CREATE TABLE `musicasRepertorioPersonalizado` (
	`id` int AUTO_INCREMENT NOT NULL,
	`repertorioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`artista` varchar(255),
	`tom` varchar(10),
	`linkCifra` varchar(500),
	`linkYoutube` varchar(500),
	`momento` varchar(100) NOT NULL,
	`ordem` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musicasRepertorioPersonalizado_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repertoriosPersonalizados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`shareId` varchar(36),
	`isPublic` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repertoriosPersonalizados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `musicasRepertorioPersonalizado` ADD CONSTRAINT `musicasRepertorioPersonalizado_repertorioId_repertoriosPersonalizados_id_fk` FOREIGN KEY (`repertorioId`) REFERENCES `repertoriosPersonalizados`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repertoriosPersonalizados` ADD CONSTRAINT `repertoriosPersonalizados_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;