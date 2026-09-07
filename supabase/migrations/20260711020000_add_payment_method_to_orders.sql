-- =============================================================================
-- Add payment method support + Pakistan address fields
-- =============================================================================

-- 1. Add payment_method column to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod'
  CHECK (payment_method IN ('cod', 'bank_transfer', 'card'));

-- 2. Add payment_details JSONB for storing bank transfer info / payment metadata
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT NULL;

-- 3. Fix status CHECK constraint to include 'paid' (used by Stripe webhook)
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'));

-- 4. Update addresses default country to Pakistan
ALTER TABLE public.addresses
  ALTER COLUMN country SET DEFAULT 'PK';

-- 5. Update existing addresses that have 'US' to 'PK' (optional, for existing data)
-- Only if you want to migrate existing addresses
-- UPDATE public.addresses SET country = 'PK' WHERE country = 'US';

-- 6. Seed bank transfer details into site_settings
INSERT INTO public.site_settings (key, value)
VALUES ('bank_transfer', '{
  "bank_name": "Habib Bank Limited (HBL)",
  "account_title": "eMobiles (Pvt) Ltd",
  "account_number": "1234-5678-9012-3",
  "iban": "PK36SCBL0000001234567890",
  "branch_code": "0123",
  "instructions": "Please transfer the exact order amount and send screenshot of receipt to our WhatsApp or email for order confirmation."
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
