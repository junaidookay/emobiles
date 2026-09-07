-- Update existing shipping methods to correct values (can't delete due to FK from orders)
UPDATE public.shipping_methods SET
  name = 'Standard Shipping',
  description = 'Delivered in 3-5 business days',
  estimated_days = '3-5 days',
  price = 800,
  is_active = true
WHERE name IN ('Standard Shipping', 'Standard', 'Free Shipping');

UPDATE public.shipping_methods SET
  name = 'Same Day Delivery',
  description = 'Delivered today (Lahore only)',
  estimated_days = 'Same day',
  price = 1500,
  is_active = true
WHERE name LIKE '%Same Day%' OR name LIKE '%Express%' OR name LIKE '%Overnight%';

-- Deactivate any other shipping methods we don't use
UPDATE public.shipping_methods SET is_active = false
WHERE name NOT IN ('Standard Shipping', 'Same Day Delivery');
