CREATE TABLE `condition_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condition_id` int NOT NULL,
	`product_id` int NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `condition_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysis_id` int NOT NULL,
	`product_id` int NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `product_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminder_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`analysis_id` int,
	`schedule` varchar(10) NOT NULL,
	`completed_date` date NOT NULL,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `reminder_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skin_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`image_id` int,
	`user_id` int NOT NULL,
	`status` varchar(255) NOT NULL,
	`condition_id` int,
	`confidence_scores` double,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `skin_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skin_profile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`skin_type` varchar(50),
	`skin_sensitivity` varchar(50),
	`created_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `skin_profile_id` PRIMARY KEY(`id`),
	CONSTRAINT `skin_profile_user_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_routine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`active_analysis_id` int,
	`morning_time` time NOT NULL DEFAULT '07:00:00',
	`evening_time` time NOT NULL DEFAULT '21:00:00',
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
	CONSTRAINT `user_routine_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_routine_user_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
DROP TABLE `skin_analysis_transactions`;--> statement-breakpoint
DROP TABLE `skin_data`;--> statement-breakpoint
ALTER TABLE `journals` MODIFY COLUMN `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);--> statement-breakpoint
ALTER TABLE `skin_care_products` MODIFY COLUMN `ingredient` text DEFAULT ('NULL');--> statement-breakpoint
ALTER TABLE `skin_care_products` MODIFY COLUMN `description` text DEFAULT ('NULL');--> statement-breakpoint
ALTER TABLE `skin_care_products` MODIFY COLUMN `updated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);--> statement-breakpoint
ALTER TABLE `skin_conditions` MODIFY COLUMN `condition` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `skin_conditions` MODIFY COLUMN `can_recommend` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `first_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `last_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `birthdate` date NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `updated_at` datetime(3);--> statement-breakpoint
ALTER TABLE `journals` ADD `mood` varchar(10) DEFAULT null;--> statement-breakpoint
ALTER TABLE `otp` ADD `is_used` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `otp` ADD `updated_at` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) NOT NULL;--> statement-breakpoint
ALTER TABLE `skin_care_products` ADD `product_brand` varchar(255) DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `skin_care_products` ADD `highlighted_ingredients` varchar(255) DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `skin_care_products` ADD `available_in` varchar(255) DEFAULT 'NULL';--> statement-breakpoint
ALTER TABLE `skin_conditions` ADD `target_ingredients` text DEFAULT (null);--> statement-breakpoint
ALTER TABLE `condition_products` ADD CONSTRAINT `condition_products_condition_id_skin_conditions_id_fk` FOREIGN KEY (`condition_id`) REFERENCES `skin_conditions`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `condition_products` ADD CONSTRAINT `condition_products_product_id_skin_care_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `skin_care_products`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `product_recommendations` ADD CONSTRAINT `prt_analysis_fk` FOREIGN KEY (`analysis_id`) REFERENCES `skin_analysis`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `product_recommendations` ADD CONSTRAINT `prt_prod_fk` FOREIGN KEY (`product_id`) REFERENCES `skin_care_products`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `reminder_logs` ADD CONSTRAINT `reminder_logs_analysis_id_skin_analysis_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `skin_analysis`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `reminder_logs` ADD CONSTRAINT `rl_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `skin_analysis` ADD CONSTRAINT `skin_analysis_image_id_stored_images_id_fk` FOREIGN KEY (`image_id`) REFERENCES `stored_images`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `skin_analysis` ADD CONSTRAINT `skin_analysis_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `skin_analysis` ADD CONSTRAINT `skin_analysis_condition_id_skin_conditions_id_fk` FOREIGN KEY (`condition_id`) REFERENCES `skin_conditions`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `skin_profile` ADD CONSTRAINT `skin_profile_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_routine` ADD CONSTRAINT `user_routine_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_routine` ADD CONSTRAINT `user_routine_active_analysis_id_skin_analysis_id_fk` FOREIGN KEY (`active_analysis_id`) REFERENCES `skin_analysis`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `otp` DROP COLUMN `isUsed`;--> statement-breakpoint
ALTER TABLE `role` DROP COLUMN `created_at`;--> statement-breakpoint
ALTER TABLE `role` DROP COLUMN `updated_at`;--> statement-breakpoint
ALTER TABLE `skin_conditions` DROP COLUMN `created_at`;--> statement-breakpoint
ALTER TABLE `skin_conditions` DROP COLUMN `updated_at`;