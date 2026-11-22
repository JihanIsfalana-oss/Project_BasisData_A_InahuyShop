CREATE TABLE `admin_audit_log` (
    `audit_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER UNSIGNED NOT NULL,
    `action` VARCHAR(80) NOT NULL,
    `resource_type` VARCHAR(50) NOT NULL,
    `resource_id` VARCHAR(64) NOT NULL,
    `request_id` VARCHAR(128) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,

    INDEX `admin_audit_log_expires_at_idx`(`expires_at`),
    INDEX `admin_audit_log_admin_id_created_at_idx`(`admin_id`, `created_at`),
    INDEX `admin_audit_log_request_id_idx`(`request_id`),
    PRIMARY KEY (`audit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `admin_audit_log` ADD CONSTRAINT `admin_audit_log_admin_id_fkey`
FOREIGN KEY (`admin_id`) REFERENCES `seller`(`admin_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
