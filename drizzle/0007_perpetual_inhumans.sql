CREATE TABLE `musicHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`musicaId` varchar(100) NOT NULL,
	`musicaTitulo` varchar(255) NOT NULL,
	`momentoId` varchar(100) NOT NULL,
	`accessedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `musicHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `musicasFavoritas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`musicaId` varchar(100) NOT NULL,
	`musicaTitulo` varchar(255) NOT NULL,
	`musicaArtista` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `musicasFavoritas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`newsletterEnabled` int NOT NULL DEFAULT 1,
	`newsletterFrequency` enum('weekly','monthly','never') NOT NULL DEFAULT 'monthly',
	`notifyNewSongs` int NOT NULL DEFAULT 1,
	`notifyNewArticles` int NOT NULL DEFAULT 1,
	`notifyLiturgicalEvents` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `paroquia` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `foto` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;