export type UserRole = 'farmer' | 'validator' | 'admin';
export type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type LandUnit = 'acres' | 'hectares' | 'bigha';
export type DocumentType = 'identity' | 'land' | 'bank' | 'crop' | 'other';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerProfile {
  id: string;
  user_id: string;
  full_name: string;
  mobile_number: string;
  address: string;
  aadhaar_number: string;
  land_area: number;
  land_unit: LandUnit;
  crop_type: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  profile_photo_url: string | null;
  assigned_validator_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  farmer_id: string;
  user_id: string;
  document_name: string;
  document_type: DocumentType;
  file_url: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface VerificationStatusRecord {
  id: string;
  farmer_id: string;
  user_id: string;
  status: VerificationStatus;
  validator_id: string | null;
  validator_remarks: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmerOverview {
  id: string;
  user_id: string;
  full_name: string;
  mobile_number: string;
  address: string;
  crop_type: string;
  land_area: number;
  land_unit: LandUnit;
  profile_photo_url: string | null;
  created_at: string;
  status: VerificationStatus | null;
  validator_remarks: string | null;
  reviewed_at: string | null;
  validator_name: string | null;
  farmer_email: string | null;
}

export interface FarmerWithDetails extends FarmerProfile {
  verification_status: VerificationStatusRecord | null;
  documents: Document[];
  user: User | null;
}

export interface DashboardStats {
  total_farmers: number;
  pending_farmers: number;
  approved_farmers: number;
  rejected_farmers: number;
  under_review_farmers: number;
  total_validators: number;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      farmer_profiles: {
        Row: FarmerProfile;
        Insert: Omit<FarmerProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FarmerProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at'>>;
      };
      verification_status: {
        Row: VerificationStatusRecord;
        Insert: Omit<VerificationStatusRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VerificationStatusRecord, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      farmer_overview: {
        Row: FarmerOverview;
      };
    };
  };
};
