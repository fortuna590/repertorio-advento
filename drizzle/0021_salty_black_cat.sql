CREATE TABLE `historicoEscalas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`escalaId` int NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`tipoAcao` enum('criacao','edicao','adicao_participante','remocao_participante','alteracao_status','edicao_participante','duplicacao') NOT NULL,
	`descricao` text NOT NULL,
	`dadosAnteriores` text,
	`dadosNovos` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historicoEscalas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templatesEscalas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` varchar(50) NOT NULL,
	`funcoes` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templatesEscalas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `historicoEscalas` ADD CONSTRAINT `historicoEscalas_escalaId_escalas_id_fk` FOREIGN KEY (`escalaId`) REFERENCES `escalas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historicoEscalas` ADD CONSTRAINT `historicoEscalas_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;