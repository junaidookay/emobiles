-- Seed free shipping setting (enabled by default, threshold PKR 14000)
INSERT INTO public.site_settings (key, value, updated_at)
VALUES ('free_shipping', '{"enabled": true, "threshold": 14000}'::jsonb, now())
ON CONFLICT (key) DO NOTHING;
