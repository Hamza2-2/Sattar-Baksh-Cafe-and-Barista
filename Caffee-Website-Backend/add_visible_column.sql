ALTER TABLE products ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE;
UPDATE products SET visible = TRUE WHERE visible IS NULL;
DESCRIBE products;
SELECT id, name, in_stock, visible FROM products;
    