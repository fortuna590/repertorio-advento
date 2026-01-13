CREATE TABLE `escalas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`data` date NOT NULL,
	`hora` varchar(10),
	`local` varchar(255),
	`tipo` varchar(50) NOT NULL,
	`template` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escalas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcoesEscala` (
	`id` int AUTO_INCREMENT NOT NULL,
	`escalaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ordem` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funcoesEscala_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `participantesEscala` (
	`id` int AUTO_INCREMENT NOT NULL,
	`escalaId` int NOT NULL,
	`funcaoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(255),
	`telefone` varchar(20),
	`status` varchar(20) NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `participantesEscala_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `funcoesEscala` ADD CONSTRAINT `funcoesEscala_escalaId_escalas_id_fk` FOREIGN KEY (`escalaId`) REFERENCES `escalas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `participantesEscala` ADD CONSTRAINT `participantesEscala_escalaId_escalas_id_fk` FOREIGN KEY (`escalaId`) REFERENCES `escalas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `participantesEscala` ADD CONSTRAINT `participantesEscala_funcaoId_funcoesEscala_id_fk` FOREIGN KEY (`funcaoId`) REFERENCES `funcoesEscala`(`id`) ON DELETE cascade ON UPDATE no action;