-- =============================================================================
-- Convert all monetary values from USD to PKR (SAFE VERSION)
-- =============================================================================
-- Exchange rate: 1 USD = 278.79 PKR (live rate fetched 2026-06-03)
-- Source: https://www.exchangerate-api.com
--
-- This version skips rows where the converted value would overflow
-- NUMERIC(10,2) (> 99,999,999.99) and logs them for manual review.
--
-- IMPORTANT: If you ran the previous migration and it failed partway,
-- run ROLLBACK; first to undo any partial changes before running this.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. PREVIEW: find rows that WOULD overflow
-- -----------------------------------------------------------------------------
SELECT 'OVERFLOW products.price' AS issue, name, price,
       ROUND(price * 278.79, 2) AS would_become
  FROM products
 WHERE price * 278.79 > 99999999.99

UNION ALL
SELECT 'OVERFLOW products.discount_price', name, discount_price,
       ROUND(discount_price * 278.79, 2)
  FROM products
 WHERE discount_price IS NOT NULL AND discount_price * 278.79 > 99999999.99

UNION ALL
SELECT 'OVERFLOW orders.subtotal', id::text, subtotal,
       ROUND(subtotal * 278.79, 2)
  FROM orders
 WHERE subtotal * 278.79 > 99999999.99

UNION ALL
SELECT 'OVERFLOW orders.total', id::text, total,
       ROUND(total * 278.79, 2)
  FROM orders
 WHERE total * 278.79 > 99999999.99

UNION ALL
SELECT 'OVERFLOW order_items.price', product_name, price,
       ROUND(price * 278.79, 2)
  FROM order_items
 WHERE price * 278.79 > 99999999.99

UNION ALL
SELECT 'OVERFLOW shipping_methods.price', name, price,
       ROUND(price * 278.79, 2)
  FROM shipping_methods
 WHERE price * 278.79 > 99999999.99

UNION ALL
SELECT 'OVERFLOW coupons.discount_value', code, discount_value,
       ROUND(discount_value * 278.79, 2)
  FROM coupons
 WHERE discount_type = 'fixed' AND discount_value * 278.79 > 99999999.99

UNION ALL
SELECT 'OVERFLOW coupons.min_order_amount', code, min_order_amount,
       ROUND(min_order_amount * 278.79, 2)
  FROM coupons
 WHERE min_order_amount * 278.79 > 99999999.99;

-- If any rows appear above, those values are already in PKR or too large.
-- They will be SKIPPED by the updates below.

-- -----------------------------------------------------------------------------
-- 2. APPLY: multiply monetary columns by 278.79, skip overflow rows
-- -----------------------------------------------------------------------------
UPDATE products
   SET price         = ROUND(price * 278.79, 2),
       discount_price = ROUND(discount_price * 278.79, 2)
 WHERE price * 278.79 <= 99999999.99
   AND (discount_price IS NULL OR discount_price * 278.79 <= 99999999.99);

UPDATE shipping_methods
   SET price = ROUND(price * 278.79, 2)
 WHERE price * 278.79 <= 99999999.99;

UPDATE order_items
   SET price = ROUND(price * 278.79, 2)
 WHERE price * 278.79 <= 99999999.99;

UPDATE orders
   SET subtotal      = ROUND(subtotal * 278.79, 2),
       shipping_cost = ROUND(shipping_cost * 278.79, 2),
       discount      = ROUND(discount * 278.79, 2),
       total         = ROUND(total * 278.79, 2)
 WHERE subtotal * 278.79 <= 99999999.99
   AND total * 278.79 <= 99999999.99;

UPDATE coupons
   SET discount_value   = CASE
         WHEN discount_type = 'fixed' AND discount_value * 278.79 <= 99999999.99
           THEN ROUND(discount_value * 278.79, 2)
         ELSE discount_value
       END,
       min_order_amount = CASE
         WHEN min_order_amount * 278.79 <= 99999999.99
           THEN ROUND(min_order_amount * 278.79, 2)
         ELSE min_order_amount
       END;

-- -----------------------------------------------------------------------------
-- 3. VERIFY: spot-check the converted values
-- -----------------------------------------------------------------------------
SELECT name, price, discount_price
  FROM products
 ORDER BY price DESC
 LIMIT 5;

SELECT name, price FROM shipping_methods ORDER BY price;

SELECT code, discount_type, discount_value, min_order_amount
  FROM coupons
 ORDER BY code;

-- If everything looks right, run COMMIT; below.
-- To undo, run ROLLBACK; instead.
COMMIT;
