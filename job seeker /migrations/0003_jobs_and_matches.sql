create table if not exists jobs (
  id text not null primary key,
  created_at timestamptz default CURRENT_TIMESTAMP not null,
  updated_at timestamptz default CURRENT_TIMESTAMP not null,
  title text not null,
  company text not null,
  location text,
  remote text default 'remote',
  employment_type text,
  seniority text,
  years_min text,
  years_max text,
  salary_min text,
  salary_max text,
  salary_currency text default 'USD',
  category text,
  required_skills text[] not null default '{}',
  preferred_skills text[] not null default '{}',
  technologies text[] not null default '{}',
  description text,
  apply_url text,
  status text default 'active',
  source text default 'scraped'
);

create index if not exists jobs_status_idx on jobs (status);
create index if not exists jobs_company_idx on jobs (company);
create index if not exists jobs_category_idx on jobs (category);

create table if not exists matches (
  match_id text not null primary key,
  applicant_id text not null,
  job_id text not null,
  match_score float8 not null default 0,
  score_category text default 'poor',
  matched_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  partial_skills text[] not null default '{}',
  match_reasons text,
  created_at timestamptz default CURRENT_TIMESTAMP not null,
  updated_at timestamptz default CURRENT_TIMESTAMP not null,
  notification_status text default 'pending',
  telegram_status text,
  email_status text,
  unique (applicant_id, job_id)
);

create index if not exists matches_applicant_idx on matches (applicant_id);
create index if not exists matches_job_idx on matches (job_id);
create index if not exists matches_score_idx on matches (match_score);
