-- REGISTRY: LifeSync Unified Healthcare Platform

-- 1. Profiles (Users & Hospital Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'patient', -- 'patient', 'hospital_admin'
    avatar_url TEXT,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hospitals
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    contact TEXT,
    beds_total INTEGER DEFAULT 0,
    beds_avail INTEGER DEFAULT 0,
    icu_total INTEGER DEFAULT 0,
    icu_avail INTEGER DEFAULT 0,
    rating DOUBLE PRECISION DEFAULT 5.0,
    status TEXT DEFAULT 'Stable', -- 'Stable', 'Near Capacity', 'Critical'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ambulances
CREATE TABLE IF NOT EXISTS public.ambulances (
    id TEXT PRIMARY KEY, -- Unit ID e.g. AMB-001
    driver_name TEXT,
    contact TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    status TEXT DEFAULT 'available', -- 'available', 'busy', 'en-route'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ambulance Requests (Real-time tracking)
CREATE TABLE IF NOT EXISTS public.ambulance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_name TEXT,
    hospital_name TEXT,
    contact TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'en-route', 'completed'
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Doctors
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialization TEXT,
    availability TEXT DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Patients (Medical Records)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    medical_history JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    appointment_date DATE,
    appointment_time TIME,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Completed', 'Cancelled'
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Health Metrics
CREATE TABLE IF NOT EXISTS public.health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    type TEXT, -- 'heart_rate', 'blood_pressure', 'spo2'
    value DOUBLE PRECISION,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) - Simple permissive policy for development
-- In production, these should be much stricter
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hospitals are viewable by everyone" ON public.hospitals FOR SELECT USING (true);

ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ambulances are viewable by everyone" ON public.ambulances FOR SELECT USING (true);

ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requests are viewable by everyone" ON public.ambulance_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert requests" ON public.ambulance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update requests" ON public.ambulance_requests FOR UPDATE USING (true);

-- Enabling Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulances;

-- Seed Data (Optional)
INSERT INTO public.hospitals (name, address, lat, lng, contact, beds_total, beds_avail, icu_total, icu_avail, rating, status)
VALUES 
('City General Hospital', 'Downtown Chennai', 13.0827, 80.2707, '+91 44 1234 5678', 250, 45, 40, 12, 4.8, 'Stable'),
('Apollo Specialty', 'Greams Road', 13.0601, 80.2520, '+91 44 2345 6789', 500, 20, 100, 5, 4.9, 'Near Capacity');

INSERT INTO public.ambulances (id, driver_name, contact, lat, lng, status)
VALUES 
('AMB-101', 'Ravi Kumar', '+91 91234 56789', 13.0827, 80.2707, 'available'),
('AMB-102', 'Priya Sharma', '+91 91234 56780', 13.0900, 80.2800, 'busy');
