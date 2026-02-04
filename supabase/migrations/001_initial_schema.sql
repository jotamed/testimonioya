-- TestimonioYa - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Businesses table
create table businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  business_name text not null,
  slug text unique not null,
  industry text,
  website text,
  logo_url text,
  brand_color text default '#6366f1',
  welcome_message text default '¡Hola! Nos encantaría saber tu opinión sobre nuestro servicio.',
  plan text default 'free' check (plan in ('free', 'pro', 'premium')),
  testimonials_count integer default 0,
  created_at timestamptz default now()
);

-- Testimonials table
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  customer_name text not null,
  customer_email text,
  text_content text not null,
  rating integer not null check (rating between 1 and 5),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_featured boolean default false,
  source text default 'form' check (source in ('whatsapp', 'form', 'manual')),
  created_at timestamptz default now()
);

-- Collection links table
create table collection_links (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade not null,
  slug text unique not null,
  name text not null,
  campaign_type text,
  is_active boolean default true,
  views_count integer default 0,
  submissions_count integer default 0,
  created_at timestamptz default now()
);

-- Indexes
create index idx_businesses_user_id on businesses(user_id);
create index idx_businesses_slug on businesses(slug);
create index idx_testimonials_business_id on testimonials(business_id);
create index idx_testimonials_status on testimonials(status);
create index idx_collection_links_business_id on collection_links(business_id);
create index idx_collection_links_slug on collection_links(slug);

-- RLS (Row Level Security)
alter table businesses enable row level security;
alter table testimonials enable row level security;
alter table collection_links enable row level security;

-- Policies: businesses
create policy "Users can view own businesses"
  on businesses for select using (auth.uid() = user_id);

create policy "Users can create businesses"
  on businesses for insert with check (auth.uid() = user_id);

create policy "Users can update own businesses"
  on businesses for update using (auth.uid() = user_id);

-- Policies: testimonials
create policy "Business owners can view their testimonials"
  on testimonials for select using (
    business_id in (select id from businesses where user_id = auth.uid())
  );

create policy "Anyone can submit testimonials"
  on testimonials for insert with check (true);

create policy "Business owners can update their testimonials"
  on testimonials for update using (
    business_id in (select id from businesses where user_id = auth.uid())
  );

-- Policies: collection_links
create policy "Business owners can manage their links"
  on collection_links for all using (
    business_id in (select id from businesses where user_id = auth.uid())
  );

-- Public access: anyone can view active collection links (for the public form)
create policy "Anyone can view active collection links"
  on collection_links for select using (is_active = true);

-- Public access: anyone can view approved testimonials (for widgets/embeds)
create policy "Anyone can view approved testimonials"
  on testimonials for select using (status = 'approved');

-- Function to auto-increment testimonials_count
create or replace function update_testimonial_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update businesses set testimonials_count = testimonials_count + 1
    where id = NEW.business_id;
  elsif TG_OP = 'DELETE' then
    update businesses set testimonials_count = testimonials_count - 1
    where id = OLD.business_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger on_testimonial_change
  after insert or delete on testimonials
  for each row execute function update_testimonial_count();
