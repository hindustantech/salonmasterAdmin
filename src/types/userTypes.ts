// src/types/userTypes.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  domain_type: 'solan' | 'worker' | 'company' | 'superadmin';
  whatsapp_number: string;
  otp_verified: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  company_name: string;
  brand: string;
  gst_number: string;
  pan_number: string;
  cin: string;
  image: string;
  social_media_links: Record<string, string>;
  product_shop_options: string[];
  products: string[];
}

export interface SalonProfile {
  salon_name: string;
  brand_name: string;
  address: string;
  contact_number: string;
  gst_number: string;
  pan_number: string;
  location: string;
  requires_employee_recruitment: boolean;
  requires_product_training: boolean;
  requires_product_order: boolean;
}

export interface WorkerProfile {
  name: string;
  uniquename: string;
  location: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  contact_no: string;
  education: {
    degree: string;
    institution: string;
    year: number;
    grade: string;
  }[];
  skills: string[];
  services: string[];
  available_for_join: boolean;
}