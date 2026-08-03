-- SQLite does not enforce foreign keys unless asked.
PRAGMA foreign_keys = ON;--> statement-breakpoint
CREATE TABLE `answers` (
	`id` text PRIMARY KEY NOT NULL,
	`attempt_id` text NOT NULL,
	`question_id` text,
	`question_snapshot` text NOT NULL,
	`selected_index` integer,
	`is_correct` integer NOT NULL,
	`answered_at` text NOT NULL,
	FOREIGN KEY (`attempt_id`) REFERENCES `attempts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `ans_attempt` ON `answers` (`attempt_id`);--> statement-breakpoint
CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`promoter_id` text NOT NULL,
	`tutorial_mode` text,
	`tutorial_started_at` text,
	`started_at` text NOT NULL,
	`attested_at` text,
	`submitted_at` text,
	`score` integer,
	`total` integer,
	`passed` integer,
	FOREIGN KEY (`promoter_id`) REFERENCES `promoters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `a_promoter_started` ON `attempts` (`promoter_id`,`started_at`);--> statement-breakpoint
CREATE TABLE `promoters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`tier` text DEFAULT 'SP3' NOT NULL,
	`email` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `promoters_phone_unique` ON `promoters` (`phone`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt` text NOT NULL,
	`options` text NOT NULL,
	`correct_index` integer NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`is_critical` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `q_active_order` ON `questions` (`is_active`,`order_index`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`video_url` text,
	`slides_url` text,
	`min_tutorial_seconds` integer DEFAULT 45 NOT NULL,
	`pass_mark` integer DEFAULT 80 NOT NULL,
	`updated_at` text NOT NULL
);
