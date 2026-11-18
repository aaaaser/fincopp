-- CreateTable
CREATE TABLE `app_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `app_name` VARCHAR(50) NOT NULL DEFAULT 'FINCOP',
    `app_subtitle` VARCHAR(100) NOT NULL DEFAULT 'FINANSIAL UCOPP',
    `currency_code` VARCHAR(10) NOT NULL DEFAULT 'IDR',
    `theme` ENUM('LIGHT', 'DARK') NOT NULL DEFAULT 'LIGHT',
    `match_price` DECIMAL(18, 2) NOT NULL DEFAULT 1000.00,
    `reminder_days_json` VARCHAR(100) NOT NULL DEFAULT '[7,3,1,0]',
    `desktop_notify_enabled` BOOLEAN NOT NULL DEFAULT true,
    `auto_backup_enabled` BOOLEAN NOT NULL DEFAULT false,
    `auto_backup_frequency` ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL DEFAULT 'DAILY',
    `auto_backup_time` VARCHAR(10) NOT NULL DEFAULT '22:00',
    `auto_backup_dir` VARCHAR(500) NULL,
    `backup_retention_count` INTEGER NOT NULL DEFAULT 14,
    `last_backup_at` DATETIME(3) NULL,
    `last_backup_status` ENUM('SUCCESS', 'FAILED') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('BANK', 'CASH', 'EWALLET', 'OTHER') NOT NULL,
    `initial_balance` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `current_balance` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallets_name_key`(`name`),
    INDEX `wallets_type_is_active_idx`(`type`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_transfers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_wallet_id` INTEGER NOT NULL,
    `to_wallet_id` INTEGER NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `transfer_date` DATE NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `wallet_transfers_from_wallet_id_idx`(`from_wallet_id`),
    INDEX `wallet_transfers_to_wallet_id_idx`(`to_wallet_id`),
    INDEX `wallet_transfers_transfer_date_idx`(`transfer_date`),
    INDEX `wallet_transfers_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `income_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `income_categories_name_key`(`name`),
    UNIQUE INDEX `income_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `incomes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_date` DATE NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `wallet_id` INTEGER NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `source` VARCHAR(120) NOT NULL,
    `notes` TEXT NULL,
    `is_cancelled` BOOLEAN NOT NULL DEFAULT false,
    `cancelled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `incomes_transaction_date_idx`(`transaction_date`),
    INDEX `incomes_category_id_idx`(`category_id`),
    INDEX `incomes_wallet_id_idx`(`wallet_id`),
    INDEX `incomes_is_cancelled_idx`(`is_cancelled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(80) NOT NULL,
    `is_recurring_type` BOOLEAN NOT NULL DEFAULT false,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `expense_categories_slug_key`(`slug`),
    INDEX `expense_categories_is_recurring_type_idx`(`is_recurring_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_date` DATE NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `wallet_id` INTEGER NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `notes` TEXT NULL,
    `is_recurring` BOOLEAN NOT NULL DEFAULT false,
    `is_cancelled` BOOLEAN NOT NULL DEFAULT false,
    `cancelled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `expenses_transaction_date_idx`(`transaction_date`),
    INDEX `expenses_category_id_idx`(`category_id`),
    INDEX `expenses_wallet_id_idx`(`wallet_id`),
    INDEX `expenses_is_cancelled_idx`(`is_cancelled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurring_expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `default_wallet_id` INTEGER NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `start_date` DATE NOT NULL,
    `next_due_date` DATE NOT NULL,
    `period` ENUM('WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
    `status` ENUM('PENDING', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    `remind_7_days` BOOLEAN NOT NULL DEFAULT true,
    `remind_3_days` BOOLEAN NOT NULL DEFAULT true,
    `remind_1_day` BOOLEAN NOT NULL DEFAULT true,
    `remind_on_due` BOOLEAN NOT NULL DEFAULT true,
    `remind_overdue` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `recurring_expenses_next_due_date_idx`(`next_due_date`),
    INDEX `recurring_expenses_status_idx`(`status`),
    INDEX `recurring_expenses_default_wallet_id_idx`(`default_wallet_id`),
    INDEX `recurring_expenses_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurring_expense_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recurring_expense_id` INTEGER NOT NULL,
    `wallet_id` INTEGER NOT NULL,
    `period_key` VARCHAR(32) NOT NULL,
    `due_date` DATE NOT NULL,
    `paid_at` DATETIME(3) NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recurring_expense_payments_wallet_id_idx`(`wallet_id`),
    INDEX `recurring_expense_payments_paid_at_idx`(`paid_at`),
    UNIQUE INDEX `recurring_expense_payments_recurring_expense_id_period_key_key`(`recurring_expense_id`, `period_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `party_name` VARCHAR(150) NOT NULL,
    `type` ENUM('DEBT', 'RECEIVABLE') NOT NULL,
    `wallet_id` INTEGER NULL,
    `initial_amount` DECIMAL(18, 2) NOT NULL,
    `paid_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `remaining_amount` DECIMAL(18, 2) NOT NULL,
    `loan_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM('UNPAID', 'PARTIAL', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'UNPAID',
    `affects_cash_now` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `is_cancelled` BOOLEAN NOT NULL DEFAULT false,
    `cancelled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `debts_type_status_idx`(`type`, `status`),
    INDEX `debts_due_date_idx`(`due_date`),
    INDEX `debts_wallet_id_idx`(`wallet_id`),
    INDEX `debts_is_cancelled_idx`(`is_cancelled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debt_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `debt_id` INTEGER NOT NULL,
    `wallet_id` INTEGER NOT NULL,
    `payment_date` DATE NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `debt_payments_debt_id_idx`(`debt_id`),
    INDEX `debt_payments_wallet_id_idx`(`wallet_id`),
    INDEX `debt_payments_payment_date_idx`(`payment_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(100) NOT NULL,
    `platform` ENUM('TIKTOK', 'YOUTUBE', 'OTHER') NOT NULL,
    `wallet_id` INTEGER NOT NULL,
    `donated_at` DATETIME(3) NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `price_per_match` DECIMAL(18, 2) NOT NULL DEFAULT 1000.00,
    `match_count` INTEGER NOT NULL,
    `remainder` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `is_cancelled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `donations_donated_at_idx`(`donated_at`),
    INDEX `donations_platform_idx`(`platform`),
    INDEX `donations_wallet_id_idx`(`wallet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_queues` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `donation_id` INTEGER NOT NULL,
    `nickname` VARCHAR(100) NOT NULL,
    `platform` ENUM('TIKTOK', 'YOUTUBE', 'OTHER') NOT NULL,
    `total_matches` INTEGER NOT NULL,
    `completed_matches` INTEGER NOT NULL DEFAULT 0,
    `remaining_matches` INTEGER NOT NULL,
    `is_priority` BOOLEAN NOT NULL DEFAULT false,
    `priority_order` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'WAITING',
    `queued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `match_queues_donation_id_key`(`donation_id`),
    INDEX `match_queues_status_is_priority_priority_order_queued_at_idx`(`status`, `is_priority`, `priority_order`, `queued_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `queue_id` INTEGER NOT NULL,
    `match_number` INTEGER NOT NULL,
    `played_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,

    INDEX `match_history_played_at_idx`(`played_at`),
    UNIQUE INDEX `match_history_queue_id_match_number_key`(`queue_id`, `match_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wallet_id` INTEGER NOT NULL,
    `transaction_date` DATE NOT NULL,
    `direction` ENUM('INFLOW', 'OUTFLOW') NOT NULL,
    `classification` ENUM('INITIAL_BALANCE', 'BALANCE_ADJUSTMENT', 'INCOME', 'EXPENSE', 'RECURRING_PAYMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'DEBT_DISBURSEMENT', 'DEBT_REPAYMENT', 'RECEIVABLE_DISBURSEMENT', 'RECEIVABLE_REPAYMENT', 'DONATION') NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `balance_after` DECIMAL(18, 2) NOT NULL,
    `reference_type` ENUM('WALLET', 'WALLET_TRANSFER', 'INCOME', 'EXPENSE', 'RECURRING_EXPENSE_PAYMENT', 'DEBT', 'DEBT_PAYMENT', 'DONATION') NOT NULL,
    `reference_id` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `is_voided` BOOLEAN NOT NULL DEFAULT false,
    `voided_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cash_transactions_wallet_id_is_voided_transaction_date_idx`(`wallet_id`, `is_voided`, `transaction_date`),
    INDEX `cash_transactions_classification_idx`(`classification`),
    INDEX `cash_transactions_reference_type_reference_id_idx`(`reference_type`, `reference_id`),
    INDEX `cash_transactions_direction_is_voided_idx`(`direction`, `is_voided`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('RECURRING_UPCOMING', 'RECURRING_DUE', 'RECURRING_OVERDUE', 'DEBT_UPCOMING', 'DEBT_OVERDUE', 'RECEIVABLE_UPCOMING', 'RECEIVABLE_OVERDUE') NOT NULL,
    `reference_type` VARCHAR(50) NOT NULL,
    `reference_id` INTEGER NOT NULL,
    `reminder_key` VARCHAR(64) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `triggered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_is_read_triggered_at_idx`(`is_read`, `triggered_at`),
    UNIQUE INDEX `notifications_type_reference_type_reference_id_reminder_key_key`(`type`, `reference_type`, `reference_id`, `reminder_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backup_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `backup_type` ENUM('MANUAL', 'AUTO', 'PRE_RESTORE') NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `file_size_bytes` BIGINT NOT NULL DEFAULT 0,
    `status` ENUM('SUCCESS', 'FAILED') NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `backup_logs_backup_type_created_at_idx`(`backup_type`, `created_at`),
    INDEX `backup_logs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wallet_transfers` ADD CONSTRAINT `wallet_transfers_from_wallet_id_fkey` FOREIGN KEY (`from_wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_transfers` ADD CONSTRAINT `wallet_transfers_to_wallet_id_fkey` FOREIGN KEY (`to_wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incomes` ADD CONSTRAINT `incomes_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `income_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incomes` ADD CONSTRAINT `incomes_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_expenses` ADD CONSTRAINT `recurring_expenses_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_expenses` ADD CONSTRAINT `recurring_expenses_default_wallet_id_fkey` FOREIGN KEY (`default_wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_expense_payments` ADD CONSTRAINT `recurring_expense_payments_recurring_expense_id_fkey` FOREIGN KEY (`recurring_expense_id`) REFERENCES `recurring_expenses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_expense_payments` ADD CONSTRAINT `recurring_expense_payments_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debts` ADD CONSTRAINT `debts_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debt_payments` ADD CONSTRAINT `debt_payments_debt_id_fkey` FOREIGN KEY (`debt_id`) REFERENCES `debts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debt_payments` ADD CONSTRAINT `debt_payments_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donations` ADD CONSTRAINT `donations_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_queues` ADD CONSTRAINT `match_queues_donation_id_fkey` FOREIGN KEY (`donation_id`) REFERENCES `donations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_history` ADD CONSTRAINT `match_history_queue_id_fkey` FOREIGN KEY (`queue_id`) REFERENCES `match_queues`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_transactions` ADD CONSTRAINT `cash_transactions_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

