USE krest_center_db;

-- Product variants + cart/order integration.
-- Safe to run on a fresh database or on an existing database where some
-- of these columns/keys were already added manually.

CREATE TABLE IF NOT EXISTS product_variants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  color VARCHAR(80) NULL,
  size VARCHAR(50) NULL,
  weight_value DECIMAL(10,2) NULL,
  weight_unit ENUM('g','kg') NULL,
  volume_value DECIMAL(10,2) NULL,
  volume_unit ENUM('ml','L') NULL,
  variant_price DECIMAL(12,2) NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  sku VARCHAR(100) NULL,
  status ENUM('ACTIVE','OUT_OF_STOCK','DISABLED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_product_variant_sku (product_id, sku),
  KEY idx_product_variants_product_status (product_id, status),
  CONSTRAINT fk_product_variants_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @schema_name = DATABASE();

-- ---------- cart_items.variant_id ----------
SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE cart_items ADD COLUMN variant_id BIGINT UNSIGNED NULL AFTER product_id',
    'SELECT 1')
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='cart_items' AND COLUMN_NAME='variant_id'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- The old UNIQUE(cart_id, product_id) prevents two variants of one product
-- from being stored in the same cart. Add a cart_id index first so its FK
-- remains indexed, then remove the old unique index.
SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE cart_items ADD INDEX idx_cart_items_cart (cart_id)',
    'SELECT 1')
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='cart_items' AND INDEX_NAME='idx_cart_items_cart'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) > 0,
    'ALTER TABLE cart_items DROP INDEX uk_cart_product',
    'SELECT 1')
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='cart_items' AND INDEX_NAME='uk_cart_product'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE cart_items ADD INDEX idx_cart_items_variant (variant_id)',
    'SELECT 1')
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='cart_items' AND INDEX_NAME='idx_cart_items_variant'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE cart_items ADD INDEX idx_cart_product_variant (cart_id, product_id, variant_id)',
    'SELECT 1')
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='cart_items' AND INDEX_NAME='idx_cart_product_variant'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE',
    'SELECT 1')
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='cart_items' AND COLUMN_NAME='variant_id' AND REFERENCED_TABLE_NAME='product_variants'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------- order_items variant snapshot ----------
SET @sql = (SELECT IF(COUNT(*)=0,'ALTER TABLE order_items ADD COLUMN variant_id BIGINT UNSIGNED NULL AFTER product_id','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND COLUMN_NAME='variant_id');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = (SELECT IF(COUNT(*)=0,'ALTER TABLE order_items ADD COLUMN selected_color VARCHAR(80) NULL AFTER variant_id','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND COLUMN_NAME='selected_color');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = (SELECT IF(COUNT(*)=0,'ALTER TABLE order_items ADD COLUMN selected_size VARCHAR(50) NULL AFTER selected_color','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND COLUMN_NAME='selected_size');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = (SELECT IF(COUNT(*)=0,'ALTER TABLE order_items ADD COLUMN selected_weight_value DECIMAL(10,2) NULL AFTER selected_size','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND COLUMN_NAME='selected_weight_value');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = (SELECT IF(COUNT(*)=0,'ALTER TABLE order_items ADD COLUMN selected_weight_unit VARCHAR(10) NULL AFTER selected_weight_value','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND COLUMN_NAME='selected_weight_unit');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = (SELECT IF(COUNT(*)=0,'ALTER TABLE order_items ADD COLUMN selected_volume_value DECIMAL(10,2) NULL AFTER selected_weight_unit','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND COLUMN_NAME='selected_volume_value');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = (SELECT IF(COUNT(*)=0,'ALTER TABLE order_items ADD COLUMN selected_volume_unit VARCHAR(10) NULL AFTER selected_volume_value','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND COLUMN_NAME='selected_volume_unit');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
SET @sql = (SELECT IF(COUNT(*)=0,'ALTER TABLE order_items ADD COLUMN variant_sku VARCHAR(100) NULL AFTER selected_volume_unit','SELECT 1') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND COLUMN_NAME='variant_sku');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE order_items ADD INDEX idx_order_items_variant (variant_id)',
    'SELECT 1')
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND INDEX_NAME='idx_order_items_variant'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(COUNT(*) = 0,
    'ALTER TABLE order_items ADD CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL',
    'SELECT 1')
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA=@schema_name AND TABLE_NAME='order_items' AND COLUMN_NAME='variant_id' AND REFERENCED_TABLE_NAME='product_variants'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
