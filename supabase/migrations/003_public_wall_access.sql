-- Allow public access to business info (needed for wall/form pages)
create policy "Anyone can view business public info"
  on businesses for select using (true);

-- Drop the old restrictive policy (it's now redundant since the new one is broader)
drop policy if exists "Users can view own businesses" on businesses;
