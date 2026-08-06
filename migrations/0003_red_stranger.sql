CREATE TABLE `promoter_photos` (
	`promoter_id` text PRIMARY KEY NOT NULL,
	`mime` text NOT NULL,
	`data` blob NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`promoter_id`) REFERENCES `promoters`(`id`) ON UPDATE no action ON DELETE cascade
);
