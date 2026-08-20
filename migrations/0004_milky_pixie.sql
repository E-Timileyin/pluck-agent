ALTER TABLE `admins` ADD `is_super_admin` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `video_key` text;--> statement-breakpoint
-- Existing deployments already have admins with no super admin among them —
-- make the earliest-created one the super admin so /admin/team still has
-- someone who can add the next account.
UPDATE `admins` SET `is_super_admin` = 1 WHERE `id` = (SELECT `id` FROM `admins` ORDER BY `created_at` ASC LIMIT 1);