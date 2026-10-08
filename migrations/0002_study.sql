create table if not exists user_prefs (
  user_id text primary key,
  theme text not null default 'dark',
  font_scale text not null default 'md',
  show_niqqud boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists reading_position (
  user_id text primary key,
  book_id text not null,
  chapter integer not null,
  verse integer not null,
  updated_at timestamptz not null default now()
);

create table if not exists marks (
  id text primary key,
  user_id text not null,
  kind text not null,
  book_id text not null,
  chapter integer not null,
  verse integer not null,
  color text,
  body text,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists marks_user_updated_idx on marks (user_id, updated_at);

create table if not exists guide_progress (
  user_id text not null,
  guide_id text not null,
  status text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, guide_id)
);

create index if not exists guide_progress_user_updated_idx on guide_progress (user_id, updated_at);
