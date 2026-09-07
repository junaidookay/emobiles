-- Clean slate: remove ALL old shipping methods, insert only Standard + Same Day
DELETE FROM public.shipping_methods;

INSERT INTO public.shipping_methods (name, description, estimated_days, price, is_active) VALUES
('Standard Shipping', 'Delivered in 3-5 business days', '3-5 days', 800, true),
('Same Day Delivery', 'Delivered today (Lahore only)', 'Same day', 1500, true);
