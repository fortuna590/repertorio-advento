CREATE TABLE `artigos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`resumo` text NOT NULL,
	`conteudo` text NOT NULL,
	`imagemCapa` varchar(500),
	`categoria` varchar(100),
	`tags` text,
	`autorNome` varchar(255),
	`publicado` int NOT NULL DEFAULT 1,
	`visualizacoes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artigos_id` PRIMARY KEY(`id`),
	CONSTRAINT `artigos_slug_unique` UNIQUE(`slug`)
);
