create table sports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subscription_price numeric,
  allowed_gender text check (allowed_gender in ('male', 'female'))
);


create table subscriptions (
  member_id uuid references members(id) on delete cascade,
  sport_id uuid references sports(id) on delete cascade,
  type text check (type in ('group', 'private')),
  primary key (member_id, sport_id) -- Prevent duplicates
);

create table members (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  gender text check (gender in ('male', 'female')),
  birthdate date,
  subscription_date timestamp
);

alter table members
add column central_member_id uuid references members(id) on delete set null;

alter table members
add constraint check_not_self_reference
check (central_member_id is null or central_member_id != id);
