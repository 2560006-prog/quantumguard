-- ============================================================
-- FARMER VERIFICATION SYSTEM - Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'validator', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FARMER PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  address TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL,
  land_area DECIMAL(10,2) NOT NULL,
  land_unit TEXT DEFAULT 'acres' CHECK (land_unit IN ('acres', 'hectares', 'bigha')),
  crop_type TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  profile_photo_url TEXT,
  assigned_validator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('identity', 'land', 'bank', 'crop', 'other')),
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VERIFICATION STATUS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verification_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmer_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  validator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  validator_remarks TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farmer_profiles_updated_at BEFORE UPDATE ON public.farmer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_status_updated_at BEFORE UPDATE ON public.verification_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Call handle_new_user on auth signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Validators can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('validator', 'admin'))
  );

-- FARMER PROFILES policies
CREATE POLICY "Farmers can view own profile" ON public.farmer_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Farmers can insert own profile" ON public.farmer_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Farmers can update own profile" ON public.farmer_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Validators and admins can view all farmer profiles" ON public.farmer_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('validator', 'admin'))
  );

CREATE POLICY "Admins can update all farmer profiles" ON public.farmer_profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete farmer profiles" ON public.farmer_profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- DOCUMENTS policies
CREATE POLICY "Farmers can view own documents" ON public.documents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Farmers can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Farmers can delete own documents" ON public.documents
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Validators and admins can view all documents" ON public.documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('validator', 'admin'))
  );

-- VERIFICATION STATUS policies
CREATE POLICY "Farmers can view own verification status" ON public.verification_status
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Farmers can insert own verification status" ON public.verification_status
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Validators and admins can view all verification statuses" ON public.verification_status
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('validator', 'admin'))
  );

CREATE POLICY "Validators can update verification status" ON public.verification_status
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('validator', 'admin'))
  );

-- ACTIVITY LOGS policies
CREATE POLICY "Admins can view all logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "All authenticated can insert logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Profile photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('farmer-documents', 'farmer-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-photos
CREATE POLICY "Authenticated users can upload profile photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Profile photos are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update own profile photo" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for farmer-documents
CREATE POLICY "Farmers can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'farmer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Farmers can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'farmer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Validators and admins can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'farmer-documents' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('validator', 'admin'))
  );

-- ============================================================
-- SEED: Create initial admin user
-- (Run AFTER creating the auth user manually via Supabase Dashboard)
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@example.com';
-- UPDATE public.users SET role = 'validator' WHERE email = 'validator@example.com';
-- ============================================================

-- Useful views
CREATE OR REPLACE VIEW public.farmer_overview AS
SELECT 
  fp.id,
  fp.user_id,
  fp.full_name,
  fp.mobile_number,
  fp.address,
  fp.crop_type,
  fp.land_area,
  fp.land_unit,
  fp.profile_photo_url,
  fp.created_at,
  vs.status,
  vs.validator_remarks,
  vs.reviewed_at,
  u_validator.full_name AS validator_name,
  u_farmer.email AS farmer_email
FROM public.farmer_profiles fp
LEFT JOIN public.verification_status vs ON vs.farmer_id = fp.id
LEFT JOIN public.users u_validator ON u_validator.id = vs.validator_id
LEFT JOIN public.users u_farmer ON u_farmer.id = fp.user_id;
