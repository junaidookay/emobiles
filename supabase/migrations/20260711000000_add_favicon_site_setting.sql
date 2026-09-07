-- Seed default favicon setting (empty URL = use static /favicon.svg)
INSERT INTO public.site_settings (key, value)
VALUES ('favicon', '{"url": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
