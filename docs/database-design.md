# Database Design

See `database/schema.sql`.


## Product variants

`product_variants` stores optional color, size, weight or volume combinations with per-variant price, stock and SKU. `cart_items.variant_id` is nullable for standard products. `order_items` stores both `variant_id` and a snapshot of the selected option fields so order history remains readable even if a variant is later disabled.
