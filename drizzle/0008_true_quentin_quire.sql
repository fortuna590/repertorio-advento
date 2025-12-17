ALTER TABLE `repertorios` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `repertorios` ADD `notas` text;--> statement-breakpoint
ALTER TABLE `repertorios` ADD `ordemMusicas` text;--> statement-breakpoint
ALTER TABLE `repertorios` ADD `shareId` varchar(36);--> statement-breakpoint
ALTER TABLE `repertorios` ADD `isPublic` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `repertorios` ADD `dataCelebracao` timestamp;--> statement-breakpoint
ALTER TABLE `repertorios` ADD CONSTRAINT `repertorios_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;