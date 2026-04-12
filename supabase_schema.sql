-- 1. CLEANUP (Optional - ensures clean state)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Anyone can view ambulance requests" ON public.ambulance_requests;
DROP POLICY IF EXISTS "Anyone can create ambulance requests" ON public.ambulance_requests;
DROP POLICY IF EXISTS "Anyone can update requests" ON public.ambulance_requests;
DROP POLICY IF EXISTS "Anyone can view ambulances" ON public.ambulances;

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.ambulances (
  id TEXT PRIMARY KEY,
  driver_name TEXT,
  contact TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ambulance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  hospital_id UUID REFERENCES public.hospitals(id),
  ambulance_id TEXT REFERENCES public.ambulances(id),
  status TEXT DEFAULT 'pending',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view hospitals" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Anyone can view ambulance requests" ON public.ambulance_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can create ambulance requests" ON public.ambulance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update requests" ON public.ambulance_requests FOR UPDATE USING (true);
CREATE POLICY "Anyone can view ambulances" ON public.ambulances FOR SELECT USING (true);

-- 5. SEED DATA
INSERT INTO public.hospitals (name, address, lat, lng, contact, beds_total, beds_avail, icu_total, icu_avail, rating, status)
VALUES 
('City General Hospital', 'Downtown Chennai', 13.0827, 80.2707, '+91 44 1234 5678', 250, 45, 40, 12, 4.8, 'Stable'),
('Apollo Specialty', 'Greams Road', 13.0601, 80.2520, '+91 44 2345 6789', 500, 20, 100, 5, 4.9, 'Near Capacity')
ON CONFLICT DO NOTHING;

INSERT INTO public.ambulances (id, driver_name, contact, lat, lng, status)
VALUES 
('AMB-101', 'Ravi Kumar', '+91 91234 56789', 13.0827, 80.2707, 'available'),
('AMB-102', 'Priya Sharma', '+91 91234 56780', 13.0900, 80.2800, 'busy')
ON CONFLICT DO NOTHING;
