-- 1. CLEANUP (Ensures clean state for schema application)
-- Dropping with CASCADE to handle foreign key dependencies (e.g., patients -> hospitals)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;

DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.hospital_availability CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.ambulance_requests CASCADE;
DROP TABLE IF EXISTS public.ambulances CASCADE;
DROP TABLE IF EXISTS public.hospitals CASCADE;

-- 2. TABLES

-- Profiles: Managed by auth triggers
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user', -- 'user' | 'hospital' | 'doctor' | 'driver'
  age INTEGER,
  blood_group TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospitals: Medical facilities
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
  rating DOUBLE PRECISION DEFAULT 0,
  status TEXT DEFAULT 'Stable',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors: Medical professionals linked to hospitals
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT,
  qualification TEXT,
  experience INTEGER DEFAULT 0,
  phone TEXT,
  email TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients: Registered patients linked to hospitals
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  blood_group TEXT,
  gender TEXT,
  dob DATE,
  allergies TEXT,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments: Scheduled consultations
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE,
  appointment_time TIME,
  reason TEXT,
  status TEXT DEFAULT 'Pending', -- 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ambulances: Emergency vehicles
CREATE TABLE IF NOT EXISTS public.ambulances (
  id TEXT PRIMARY KEY, -- e.g. AMB-101
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  vehicle_no TEXT,
  model TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  status TEXT DEFAULT 'Available', -- 'Available' | 'On Call' | 'Maintenance'
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ambulance Requests: Dispatch logs
CREATE TABLE IF NOT EXISTS public.ambulance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  ambulance_id TEXT REFERENCES public.ambulances(id) ON DELETE SET NULL,
  driver_name TEXT,
  hospital_name TEXT,
  contact TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'en-route' | 'completed'
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital Availability: Real-time resource metrics
CREATE TABLE IF NOT EXISTS public.hospital_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  beds_total INTEGER DEFAULT 0,
  beds_occupied INTEGER DEFAULT 0,
  icu_total INTEGER DEFAULT 0,
  icu_occupied INTEGER DEFAULT 0,
  emergency_total INTEGER DEFAULT 0,
  emergency_occupied INTEGER DEFAULT 0,
  ot_total INTEGER DEFAULT 0,
  ot_in_use INTEGER DEFAULT 0,
  ventilators_total INTEGER DEFAULT 0,
  ventilators_in_use INTEGER DEFAULT 0,
  dialysis_units_total INTEGER DEFAULT 0,
  dialysis_units_in_use INTEGER DEFAULT 0,
  ambulances_total INTEGER DEFAULT 0,
  ambulances_available INTEGER DEFAULT 0,
  pharmacy_open BOOLEAN DEFAULT true,
  pharmacy_24hr BOOLEAN DEFAULT false,
  lab_open BOOLEAN DEFAULT true,
  lab_24hr BOOLEAN DEFAULT false,
  xray_available BOOLEAN DEFAULT true,
  ct_scan_available BOOLEAN DEFAULT true,
  mri_available BOOLEAN DEFAULT true,
  ultrasound_available BOOLEAN DEFAULT true,
  blood_a_pos INTEGER DEFAULT 0,
  blood_a_neg INTEGER DEFAULT 0,
  blood_b_pos INTEGER DEFAULT 0,
  blood_b_neg INTEGER DEFAULT 0,
  blood_o_pos INTEGER DEFAULT 0,
  blood_o_neg INTEGER DEFAULT 0,
  blood_ab_pos INTEGER DEFAULT 0,
  blood_ab_neg INTEGER DEFAULT 0,
  nurses_on_duty INTEGER DEFAULT 0,
  support_staff_count INTEGER DEFAULT 0,
  oxygen_cylinders INTEGER DEFAULT 0,
  wheelchair_available INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;

-- 4. HELPER FUNCTIONS (Security Definer to prevent RLS recursion)
CREATE OR REPLACE FUNCTION public.get_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. POLICIES

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Unified Access Role Logic
-- Hospital Admins, Doctors, and Drivers can view/manage clinic data.
-- Patients can view hospitals/ambulances but only manage their own appointments/requests.

-- Hospitals
CREATE POLICY "Anyone can view hospitals" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Admins manage hospitals" ON public.hospitals FOR ALL 
USING (public.get_role(auth.uid()) = 'hospital');

-- Hospital Availability
CREATE POLICY "Anyone can view availability" ON public.hospital_availability FOR SELECT USING (true);
CREATE POLICY "Admins manage availability" ON public.hospital_availability FOR ALL 
USING (public.get_role(auth.uid()) = 'hospital');

-- Doctors
CREATE POLICY "Anyone can view doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Admins manage doctors" ON public.doctors FOR ALL 
USING (public.get_role(auth.uid()) = 'hospital');

-- Patients
CREATE POLICY "Admins view patients" ON public.patients FOR SELECT 
USING (public.get_role(auth.uid()) IN ('hospital', 'doctor'));
CREATE POLICY "Admins manage patients" ON public.patients FOR ALL 
USING (public.get_role(auth.uid()) = 'hospital');

-- Appointments
CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND (SELECT email FROM public.profiles WHERE id = auth.uid()) = email) OR 
  public.get_role(auth.uid()) IN ('hospital', 'doctor')
);
CREATE POLICY "Admins manage appointments" ON public.appointments FOR ALL 
USING (public.get_role(auth.uid()) IN ('hospital', 'doctor'));

-- Ambulances
CREATE POLICY "Anyone can view ambulances" ON public.ambulances FOR SELECT USING (true);
CREATE POLICY "Authorized personnel manage ambulances" ON public.ambulances FOR ALL 
USING (public.get_role(auth.uid()) IN ('hospital', 'driver'));

-- Ambulance Requests
CREATE POLICY "Users or admins view requests" ON public.ambulance_requests FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.get_role(auth.uid()) IN ('hospital', 'driver')
);
CREATE POLICY "Anyone can create requests" ON public.ambulance_requests FOR INSERT 
WITH CHECK (true);
CREATE POLICY "Admins manage requests" ON public.ambulance_requests FOR UPDATE 
USING (public.get_role(auth.uid()) IN ('hospital', 'driver'));

-- 6. TRIGGERS (Auto-profile creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, email, role, age, blood_group, phone, location, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'hospitalName', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    (new.raw_user_meta_data->>'age')::INTEGER,
    new.raw_user_meta_data->>'bloodGroup',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location',
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. SEED DATA
INSERT INTO public.hospitals (name, address, lat, lng, contact, beds_total, beds_avail, icu_total, icu_avail, rating, status)
VALUES 
('City General Hospital', 'Downtown Chennai', 13.0827, 80.2707, '+91 44 1234 5678', 250, 45, 40, 12, 4.8, 'Stable'),
('Apollo Specialty', 'Greams Road', 13.0601, 80.2520, '+91 44 2345 6789', 500, 20, 100, 5, 4.9, 'Near Capacity')
ON CONFLICT DO NOTHING;
