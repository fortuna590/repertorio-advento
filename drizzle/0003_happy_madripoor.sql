CREATE TABLE `repertorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`musicas` text NOT NULL,
	`emailUsuario` varchar(320),
	`nomeUsuario` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repertorios_id` PRIMARY KEY(`id`)
);
