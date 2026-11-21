-- CreateTable
CREATE TABLE `customers` (
    `customer_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `birth_date` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `customers_email_key`(`email`),
    UNIQUE INDEX `customers_phone_key`(`phone`),
    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_address` (
    `address_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER UNSIGNED NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `street` VARCHAR(255) NOT NULL,
    `district` VARCHAR(120) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `province` VARCHAR(120) NOT NULL,
    `postal_code` VARCHAR(16) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,

    INDEX `customer_address_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`address_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seller` (
    `admin_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(80) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `seller_username_key`(`username`),
    PRIMARY KEY (`admin_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth_sessions` (
    `token_hash` CHAR(64) NOT NULL,
    `customer_id` INTEGER UNSIGNED NULL,
    `admin_id` INTEGER UNSIGNED NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `auth_sessions_customer_id_expires_at_idx`(`customer_id`, `expires_at`),
    INDEX `auth_sessions_admin_id_expires_at_idx`(`admin_id`, `expires_at`),
    INDEX `auth_sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`token_hash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `category_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER UNSIGNED NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `product_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `brand` VARCHAR(120) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `products_category_id_is_active_idx`(`category_id`, `is_active`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variant` (
    `variant_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `sku` VARCHAR(80) NOT NULL,
    `variant_name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(15, 0) NOT NULL,
    `stock_qty` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `weight_gram` INTEGER UNSIGNED NULL,
    `delivery_type` ENUM('digital', 'physical') NOT NULL,

    INDEX `product_variant_product_id_idx`(`product_id`),
    UNIQUE INDEX `product_variant_product_id_sku_key`(`product_id`, `sku`),
    PRIMARY KEY (`variant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_image` (
    `image_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER UNSIGNED NOT NULL,
    `url` TEXT NOT NULL,
    `alt_text` VARCHAR(255) NOT NULL,
    `sort_order` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    INDEX `product_image_product_id_sort_order_idx`(`product_id`, `sort_order`),
    PRIMARY KEY (`image_id`, `product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `cart_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER UNSIGNED NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `carts_customer_id_key`(`customer_id`),
    PRIMARY KEY (`cart_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_item` (
    `cart_id` INTEGER UNSIGNED NOT NULL,
    `variant_id` INTEGER UNSIGNED NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    INDEX `cart_item_variant_id_idx`(`variant_id`),
    PRIMARY KEY (`cart_id`, `variant_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `order_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_number` VARCHAR(64) NOT NULL,
    `checkout_key` VARCHAR(128) NULL,
    `customer_id` INTEGER UNSIGNED NOT NULL,
    `shipping_address_id` INTEGER UNSIGNED NULL,
    `order_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'expired') NOT NULL DEFAULT 'pending_payment',
    `subtotal` DECIMAL(15, 0) NOT NULL,
    `discount_amount` DECIMAL(15, 0) NOT NULL DEFAULT 0,
    `shipping_cost` DECIMAL(15, 0) NOT NULL DEFAULT 0,
    `grand_total` DECIMAL(15, 0) NOT NULL,

    UNIQUE INDEX `orders_order_number_key`(`order_number`),
    UNIQUE INDEX `orders_checkout_key_key`(`checkout_key`),
    INDEX `orders_customer_id_order_date_idx`(`customer_id`, `order_date`),
    INDEX `orders_shipping_address_id_idx`(`shipping_address_id`),
    INDEX `orders_status_order_date_idx`(`status`, `order_date`),
    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item` (
    `order_item_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER UNSIGNED NOT NULL,
    `variant_id` INTEGER UNSIGNED NOT NULL,
    `product_name_snapshot` VARCHAR(191) NOT NULL,
    `unit_price` DECIMAL(15, 0) NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL,
    `line_total` DECIMAL(15, 0) NOT NULL,

    INDEX `order_item_order_id_idx`(`order_id`),
    INDEX `order_item_variant_id_idx`(`variant_id`),
    PRIMARY KEY (`order_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `payment_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER UNSIGNED NOT NULL,
    `method` ENUM('simulation') NOT NULL DEFAULT 'simulation',
    `amount` DECIMAL(15, 0) NOT NULL,
    `status` ENUM('pending', 'success', 'failed', 'expired') NOT NULL DEFAULT 'pending',
    `payment_reference` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,

    UNIQUE INDEX `payments_order_id_key`(`order_id`),
    INDEX `payments_status_paid_at_idx`(`status`, `paid_at`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vouchers` (
    `voucher_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(80) NOT NULL,
    `discount_type` ENUM('percentage', 'fixed') NOT NULL,
    `discount_value` DECIMAL(12, 2) NOT NULL,
    `min_purchase` DECIMAL(15, 0) NOT NULL DEFAULT 0,
    `valid_until` DATETIME(3) NOT NULL,
    `usage_limit` INTEGER UNSIGNED NULL,

    UNIQUE INDEX `vouchers_code_key`(`code`),
    INDEX `vouchers_valid_until_idx`(`valid_until`),
    PRIMARY KEY (`voucher_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_vouchers` (
    `order_id` INTEGER UNSIGNED NOT NULL,
    `voucher_id` INTEGER UNSIGNED NOT NULL,
    `discount_applied` DECIMAL(15, 0) NOT NULL,

    INDEX `order_vouchers_voucher_id_idx`(`voucher_id`),
    UNIQUE INDEX `order_vouchers_order_id_key`(`order_id`),
    PRIMARY KEY (`order_id`, `voucher_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `shipment_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER UNSIGNED NOT NULL,
    `courier` VARCHAR(120) NULL,
    `service_type` VARCHAR(120) NULL,
    `tracking_number` VARCHAR(191) NULL,
    `shipped_at` DATETIME(3) NULL,

    UNIQUE INDEX `shipments_order_id_key`(`order_id`),
    PRIMARY KEY (`shipment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_track` (
    `shipment_id` INTEGER UNSIGNED NOT NULL,
    `tracking_seq` INTEGER UNSIGNED NOT NULL,
    `status` ENUM('picked_up', 'in_transit', 'out_for_delivery', 'delivered') NOT NULL,
    `event_time` DATETIME(3) NOT NULL,

    INDEX `shipment_track_status_event_time_idx`(`status`, `event_time`),
    PRIMARY KEY (`shipment_id`, `tracking_seq`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `review_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_item_id` INTEGER UNSIGNED NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reviews_order_item_id_key`(`order_item_id`),
    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `digital_asset` (
    `asset_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `variant_id` INTEGER UNSIGNED NOT NULL,
    `file_url` TEXT NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_size` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `digital_asset_variant_id_idx`(`variant_id`),
    PRIMARY KEY (`asset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `digital_delivery` (
    `delivery_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_item_id` INTEGER UNSIGNED NOT NULL,
    `asset_id` INTEGER UNSIGNED NOT NULL,
    `download_token_hash` CHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `download_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `digital_delivery_download_token_hash_key`(`download_token_hash`),
    INDEX `digital_delivery_order_item_id_idx`(`order_item_id`),
    INDEX `digital_delivery_asset_id_idx`(`asset_id`),
    PRIMARY KEY (`delivery_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auth_sessions` ADD CONSTRAINT `auth_sessions_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auth_sessions` ADD CONSTRAINT `auth_sessions_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `seller`(`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_address` ADD CONSTRAINT `customer_address_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variant` ADD CONSTRAINT `product_variant_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_image` ADD CONSTRAINT `product_image_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_item` ADD CONSTRAINT `cart_item_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`cart_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_item` ADD CONSTRAINT `cart_item_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variant`(`variant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shipping_address_id_fkey` FOREIGN KEY (`shipping_address_id`) REFERENCES `customer_address`(`address_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variant`(`variant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_vouchers` ADD CONSTRAINT `order_vouchers_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_vouchers` ADD CONSTRAINT `order_vouchers_voucher_id_fkey` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`voucher_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_track` ADD CONSTRAINT `shipment_track_shipment_id_fkey` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`shipment_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `order_item`(`order_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `digital_asset` ADD CONSTRAINT `digital_asset_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variant`(`variant_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `digital_delivery` ADD CONSTRAINT `digital_delivery_order_item_id_fkey` FOREIGN KEY (`order_item_id`) REFERENCES `order_item`(`order_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `digital_delivery` ADD CONSTRAINT `digital_delivery_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `digital_asset`(`asset_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE `product_variant`
    ADD CONSTRAINT `product_variant_price_nonnegative_check` CHECK (`price` >= 0);

ALTER TABLE `cart_item`
    ADD CONSTRAINT `cart_item_quantity_positive_check` CHECK (`quantity` > 0);

ALTER TABLE `orders`
    ADD CONSTRAINT `orders_amounts_nonnegative_check` CHECK (
        `subtotal` >= 0 AND
        `discount_amount` >= 0 AND
        `shipping_cost` >= 0 AND
        `grand_total` >= 0
    ),
    ADD CONSTRAINT `orders_total_consistency_check` CHECK (
        `grand_total` = `subtotal` - `discount_amount` + `shipping_cost`
    );

ALTER TABLE `order_item`
    ADD CONSTRAINT `order_item_quantity_positive_check` CHECK (`quantity` > 0),
    ADD CONSTRAINT `order_item_amounts_nonnegative_check` CHECK (
        `unit_price` >= 0 AND
        `line_total` >= 0
    ),
    ADD CONSTRAINT `order_item_total_consistency_check` CHECK (
        `line_total` = `unit_price` * `quantity`
    );

ALTER TABLE `payments`
    ADD CONSTRAINT `payments_amount_nonnegative_check` CHECK (`amount` >= 0);

ALTER TABLE `vouchers`
    ADD CONSTRAINT `vouchers_values_valid_check` CHECK (
        `discount_value` > 0 AND
        `min_purchase` >= 0 AND
        (`discount_type` <> 'percentage' OR `discount_value` <= 100)
    ),
    ADD CONSTRAINT `vouchers_usage_limit_positive_check` CHECK (
        `usage_limit` IS NULL OR `usage_limit` > 0
    );

ALTER TABLE `order_vouchers`
    ADD CONSTRAINT `order_vouchers_discount_nonnegative_check` CHECK (`discount_applied` >= 0);

ALTER TABLE `shipment_track`
    ADD CONSTRAINT `shipment_track_sequence_positive_check` CHECK (`tracking_seq` > 0);

ALTER TABLE `reviews`
    ADD CONSTRAINT `reviews_rating_range_check` CHECK (`rating` BETWEEN 1 AND 5);
