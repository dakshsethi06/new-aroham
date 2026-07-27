-- Astrologer Onboarding & Hiring System Schema

create type astrologer_application_status as enum (
  'DRAFT',
  'SUBMITTED',
  'PENDING_REVIEW',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW_ROUND_1',
  'INTERVIEW_ROUND_2',
  'DOCUMENTS_PENDING',
  'DOCUMENTS_VERIFIED',
  'APPROVED',
  'ACTIVATED',
  'REJECTED',
  'ON_HOLD',
  'NEED_MORE_DOCUMENTS',
  'SUSPENDED',
  'BLOCKED',
  'DEACTIVATED'
);

create type astrologer_document_type as enum (
  'AADHAAR_FRONT',
  'AADHAAR_BACK',
  'PAN_CARD',
  'CANCELLED_CHEQUE',
  'GST_CERTIFICATE',
  'ADDRESS_PROOF',
  'CERTIFICATION',
  'PROFILE_PICTURE',
  'INTRO_VIDEO',
  'INTRO_AUDIO',
  'OTHER'
);

create type astrologer_document_status as enum (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'REUPLOAD_REQUESTED'
);

-- Applications Sequence
create sequence if not exists astrologer_application_seq start 1;

create or replace function next_astrologer_application_number()
returns text language plpgsql as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('astrologer_application_seq');
  return 'AST-' || extract(year from now())::text || '-' || lpad(seq_val::text, 6, '0');
end $$;

-- Applications (the wizard)
create table if not exists astrologer_applications (
  id uuid primary key default gen_random_uuid(),
  application_number text unique,
  user_id uuid references auth.users(id),
  status astrologer_application_status not null default 'DRAFT',
  current_step int not null default 1,

  country_code text default '+91',
  mobile text,
  mobile_verified_at timestamptz,

  full_name text,
  display_name text,
  gender text,
  dob date,
  email text,
  profile_picture_url text,

  years_experience int,
  primary_expertise text[] default '{}',
  secondary_skills text[] default '{}',
  languages text[] default '{}',
  availability text[] default '{}',
  daily_available_hours numeric(4,1),
  on_other_platform boolean default false,
  other_platform_name text,

  learned_from text check (learned_from in
    ('FAMILY_TRADITION', 'GURU', 'INSTITUTE', 'UNIVERSITY', 'CERTIFICATION', 'SELF_LEARNING', 'OTHER')),
  background_description text,

  aadhaar_number text,
  pan_number text,
  bank_account_holder_name text,
  bank_account_number text,
  bank_ifsc text,
  gst_number text,
  address jsonb,
  emergency_contact jsonb,

  intro_video_url text,
  intro_audio_url text,

  bio text check (char_length(bio) <= 1000),
  achievements text,
  specializations text[] default '{}',
  awards text,
  social_website text,
  social_instagram text,
  social_youtube text,

  agreement_terms_accepted boolean default false,
  agreement_privacy_accepted boolean default false,
  agreement_platform_accepted boolean default false,
  agreement_commission_accepted boolean default false,
  digital_signature_name text,
  agreement_accepted_at timestamptz,

  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  activated_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  astrologer_id text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents
create table if not exists astrologer_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references astrologer_applications(id) on delete cascade,
  document_type astrologer_document_type not null,
  file_path text not null,
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  status astrologer_document_status not null default 'PENDING',
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  version int not null default 1,
  uploaded_at timestamptz default now()
);

-- Status history / audit log
create table if not exists astrologer_application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references astrologer_applications(id) on delete cascade,
  from_status astrologer_application_status,
  to_status astrologer_application_status not null,
  changed_by uuid,
  reason text,
  created_at timestamptz default now()
);

-- Admin notes
create table if not exists astrologer_admin_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references astrologer_applications(id) on delete cascade,
  admin_id uuid,
  note text not null,
  created_at timestamptz default now()
);

-- Interview Rounds
create table if not exists astrologer_interview_rounds (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references astrologer_applications(id) on delete cascade,
  round_number int not null check (round_number in (1, 2)),
  round_type text not null default 'PHONE' check (round_type in ('PHONE', 'VIDEO_MEET', 'VIDEO_ZOOM', 'INTERNAL_MEETING')),
  scheduled_date text,
  scheduled_time text,
  meeting_link text,
  interviewer_name text,
  interviewer_id uuid,
  status text not null default 'PENDING' check (status in ('PENDING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')),
  
  score_communication int default 0,
  score_knowledge int default 0,
  score_confidence int default 0,
  score_practical_reading int default 0,
  score_client_handling int default 0,
  overall_score numeric(4,2) default 0,
  
  result text default 'HOLD' check (result in ('PASS', 'FAIL', 'HOLD')),
  remarks text,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Candidate Notifications
create table if not exists astrologer_notifications (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references astrologer_applications(id) on delete cascade,
  user_id uuid references auth.users(id),
  title text not null,
  message text not null,
  channel text not null default 'IN_APP' check (channel in ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH')),
  read boolean default false,
  sent_at timestamptz default now()
);

-- Astrologer Wallets
create table if not exists astrologer_wallets (
  id uuid primary key default gen_random_uuid(),
  astrologer_id text,
  balance numeric(12,2) default 0.00,
  currency text default 'INR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Performance Metrics
create table if not exists astrologer_performance_metrics (
  id uuid primary key default gen_random_uuid(),
  astrologer_id text,
  total_calls int default 0,
  total_chats int default 0,
  video_sessions int default 0,
  total_revenue numeric(12,2) default 0.00,
  average_rating numeric(3,2) default 5.00,
  total_reviews int default 0,
  avg_session_minutes numeric(5,1) default 0.0,
  acceptance_rate numeric(5,2) default 100.00,
  missed_calls int default 0,
  cancellation_rate numeric(5,2) default 0.00,
  repeat_customers int default 0,
  profile_views int default 0,
  conversion_rate numeric(5,2) default 0.00,
  is_flagged boolean default false,
  flag_reason text,
  updated_at timestamptz default now()
);

-- Lock everything down: service-role only
alter table astrologer_applications enable row level security;
alter table astrologer_documents enable row level security;
alter table astrologer_application_status_history enable row level security;
alter table astrologer_admin_notes enable row level security;
alter table astrologer_interview_rounds enable row level security;
alter table astrologer_notifications enable row level security;
alter table astrologer_wallets enable row level security;
alter table astrologer_performance_metrics enable row level security;

insert into storage.buckets (id, name, public)
values ('astrologer-documents', 'astrologer-documents', false)
on conflict (id) do nothing;
