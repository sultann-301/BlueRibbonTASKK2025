create table sports (
  id serial primary key,
  name text not null,
  subscription_price numeric,
  allowed_gender text check (allowed_gender in ('male', 'female'))
);

alter table sports
add constraint unique_name UNIQUE(name)


create table subscriptions (
  member_id int references members(id) on delete cascade,
  sport_id int references sports(id) on delete cascade,
  type text check (type in ('group', 'private')),
  primary key (member_id, sport_id) -- Prevent duplicates
);

create table members (
  id SERIAL primary key,
  first_name text not null,
  last_name text not null,
  gender text check (gender in ('male', 'female')),
  birthdate date,
  subscription_date timestamp DEFAULT NOW()
);

alter table members
add column central_member_id int references members(id) on delete set null;

alter table members
add constraint check_not_self_reference
check (central_member_id is null or central_member_id != id);


--dummy insertions
-- Insert members
INSERT INTO members (first_name, last_name, gender, birthdate, subscription_date, central_member_id)
VALUES
  ('Alice', 'Smith', 'female', '1990-05-12', '2024-06-01 10:30:00', NULL),
  ('Bob', 'Johnson', 'male', '1985-11-23', '2024-06-02 14:00:00', 1),
  ('Carol', 'Davis', 'female', '1992-07-08', '2024-06-03 09:15:00', 1),
  ('Dave', 'Miller', 'male', '1988-03-15', '2024-06-04 11:45:00', NULL);


-- Insert sports
INSERT INTO sports (name, subscription_price, allowed_gender)
VALUES
  ('Basketball', 30.00, 'male'),
  ('Volleyball', 25.50, 'female'),
  ('Tennis', 20.00, 'male'),
  ('Yoga', 15.00, 'female');
-- Insert subscriptions
INSERT INTO subscriptions (member_id, sport_id, type)
VALUES
  (1, 1, 'group'),
  (2, 2, 'private'),
  (3, 3, 'group'),
  (1, 4, 'private');