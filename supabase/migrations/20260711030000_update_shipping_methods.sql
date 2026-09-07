-- Update shipping methods to new pricing
-- Standard: PKR 800 (was 1670), Same Day: PKR 1500 (Lahore only), Free: over 14000

UPDATE public.shipping_methods
SET name = 'Standard Shipping',
    description = 'Delivered in 3-5 business days',
    price = 800,
    estimated_days = '3-5 days'
WHERE name = 'Standard Shipping';

UPDATE public.shipping_methods
SET name = 'Same Day Delivery',
    description = 'Delivered today (Lahore only)',
    price = 1500,
    estimated_days = 'Same day'
WHERE name = 'Express Shipping';

-- Remove Free Shipping row if it exists (free shipping is calculated dynamically)
DELETE FROM public.shipping_methods WHERE name = 'Free Shipping';
