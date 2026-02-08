-- Add description column to businesses table
alter table businesses add column if not exists description text;
