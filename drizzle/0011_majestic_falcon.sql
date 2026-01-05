CREATE TABLE `momentosMissa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`repertorioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ordem` int NOT NULL,
	`icone` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `momentosMissa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `musicasRepertorio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`repertorioId` int NOT NULL,
	`momentoId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`artista` varchar(255),
	`descricao` text,
	`linkYoutube` varchar(500),
	`linkCifra` varchar(500),
	`ordem` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musicasRepertorio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repertoriosAdmin` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`slug` varchar(255) NOT NULL,
	`corPrimaria` varchar(7) NOT NULL DEFAULT '#7c3aed',
	`corSecundaria` varchar(7) NOT NULL DEFAULT '#d946ef',
	`corFundo` varchar(7) NOT NULL DEFAULT '#1e1b4b',
	`corTexto` varchar(7) NOT NULL DEFAULT '#ffffff',
	`imagemCapa` varchar(500),
	`publicado` int NOT NULL DEFAULT 1,
	`visualizacoes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repertoriosAdmin_id` PRIMARY KEY(`id`),
	CONSTRAINT `repertoriosAdmin_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `momentosMissa` ADD CONSTRAINT `momentosMissa_repertorioId_repertoriosAdmin_id_fk` FOREIGN KEY (`repertorioId`) REFERENCES `repertoriosAdmin`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `musicasRepertorio` ADD CONSTRAINT `musicasRepertorio_repertorioId_repertoriosAdmin_id_fk` FOREIGN KEY (`repertorioId`) REFERENCES `repertoriosAdmin`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `musicasRepertorio` ADD CONSTRAINT `musicasRepertorio_momentoId_momentosMissa_id_fk` FOREIGN KEY (`momentoId`) REFERENCES `momentosMissa`(`id`) ON DELETE no action ON UPDATE no action;