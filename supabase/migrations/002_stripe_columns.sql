-- Add Stripe columns to businesses
alter table businesses add column if not exists stripe_customer_id text;
alter table businesses add column if not exists stripe_subscription_id text;

-- Index for lookups
create index if not exists idx_businesses_stripe_customer on businesses(stripe_customer_id);
create index if not exists idx_businesses_stripe_subscription on businesses(stripe_subscription_id);
