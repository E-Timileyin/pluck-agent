ALTER TABLE `promoters` ADD `agent_id` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `promoters_agent_id_unique` ON `promoters` (`agent_id`);