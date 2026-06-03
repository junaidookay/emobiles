-- =============================================================================
-- Convert all monetary values from USD to PKR
-- =============================================================================
-- Exchange rate: 1 USD = 278.79 PKR (live rate fetched 2026-06-03)
-- Source: https://www.exchangerate-api.com
--
-- Tables affected:
--   * products          (price, discount_price)
--   * shipping_methods  (price)
--   * order_items       (price)
--   * orders            (subtotal, shipping_cost, discount, total)
--   * coupons           (discount_value when type='fixed', min_order_amount)
--
-- Run this file inside the Supabase SQL editor. The whole script is wrapped
-- in a transaction so you can verify the preview rows, then either COMMIT;
-- to apply or ROLLBACK; to discard.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. PREVIEW: counts and current value ranges (no changes yet)
-- -----------------------------------------------------------------------------
SELECT 'products' AS table_name,
       COUNT(*) AS rows_to_update,
       ROUND(MIN(price)::numeric, 2)         AS min_old_price,
       ROUND(MAX(price)::numeric, 2)         AS max_old_price
  FROM products
UNION ALL
SELECT 'order_items',
       COUNT(*),
       ROUND(MIN(price)::numeric, 2),
       ROUND(MAX(price)::numeric, 2)
  FROM order_items
UNION ALL
SELECT 'orders',
       COUNT(*),
       ROUND(MIN(total)::numeric, 2),
       ROUND(MAX(total)::numeric, 2)
  FROM orders
UNION ALL
SELECT 'shipping_methods',
       COUNT(*),
       ROUND(MIN(price)::numeric, 2),
       ROUND(MAX(price)::numeric, 2)
  FROM shipping_methods
UNION ALL
SELECT 'coupons (fixed-type discount_value)',
       COUNT(*),
       ROUND(MIN(discount_value)::numeric, 2),
       ROUND(MAX(discount_value)::numeric, 2)
  FROM coupons
 WHERE discount_type = 'fixed';

-- -----------------------------------------------------------------------------
-- 2. APPLY: multiply all monetary columns by 278.79 and round to 2 dp
-- -----------------------------------------------------------------------------
UPDATE products
   SET price         = ROUND(price * 278.79, 2),
       discount_price = ROUND(discount_price * 278.79, 2);

UPDATE shipping_methods
   SET price = ROUND(price * 278.79, 2);

UPDATE order_items
   SET price = ROUND(price * 278.79, 2);

UPDATE orders
   SET subtotal      = ROUND(subtotal * 278.79, 2),
       shipping_cost = ROUND(shipping_cost * 278.79, 2),
       discount      = ROUND(discount * 278.79, 2),
       total         = ROUND(total * 278.79, 2);

-- Coupons: convert fixed-type discount_value, leave percentage as-is,
-- and always convert min_order_amount (it's a currency amount either way).
UPDATE coupons
   SET discount_value   = CASE
         WHEN discount_type = 'fixed' THEN ROUND(discount_value * 278.79, 2)
         ELSE discount_value
       END,
       min_order_amount = ROUND(min_order_amount * 278.79, 2);

-- -----------------------------------------------------------------------------
-- 3. VERIFY: spot-check the converted values
-- -----------------------------------------------------------------------------
-- Top 5 most expensive products (should be flagship phones, ~PKR 300k-400k)
SELECT name, price, discount_price
  FROM products
 ORDER BY price DESC
 LIMIT 5;

-- Shipping methods (Standard should be ~PKR 1,670)
SELECT name, price FROM shipping_methods ORDER BY price;

-- Coupons
SELECT code, discount_type, discount_value, min_order_amount
  FROM coupons
 ORDER BY code;

-- If everything looks right, run COMMIT; below.
-- To undo, run ROLLBACK; instead.
COMMIT;
