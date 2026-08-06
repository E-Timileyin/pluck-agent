CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`last_login_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);