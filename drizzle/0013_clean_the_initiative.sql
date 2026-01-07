CREATE TABLE `musicasAdminFavoritas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`musicaRepertorioId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `musicasAdminFavoritas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `musicasAdminFavoritas` ADD CONSTRAINT `musicasAdminFavoritas_musicaRepertorioId_musicasRepertorio_id_fk` FOREIGN KEY (`musicaRepertorioId`) REFERENCES `musicasRepertorio`(`id`) ON DELETE no action ON UPDATE no action;