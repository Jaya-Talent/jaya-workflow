-- Performance & High-Traffic Composite Indexes for Jaya Talent

create index if not exists jobs_status_cat_updated_idx on jobs (status, category, updated_at desc);
create index if not exists jobs_remote_status_idx on jobs (remote, status);
create index if not exists matches_applicant_score_idx on matches (applicant_id, match_score desc);
