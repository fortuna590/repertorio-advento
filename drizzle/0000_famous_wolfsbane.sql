CREATE TABLE `artigos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`resumo` text,
	`conteudo` text NOT NULL,
	`imagemCapa` varchar(512),
	`categoria` varchar(100) NOT NULL DEFAULT 'Liturgia',
	`tags` text,
	`publicado` boolean NOT NULL DEFAULT false,
	`visualizacoes` int NOT NULL DEFAULT 0,
	`metaTitle` varchar(255),
	`metaDescription` varchar(320),
	`palavrasChave` text,
	`ogImage` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artigos_id` PRIMARY KEY(`id`),
	CONSTRAINT `artigos_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `musicas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`repertorioId` int NOT NULL,
	`momento` enum('ENTRADA','ATO_PENITENCIAL','GLORIA','SALMO','ACLAMACAO','OFERTORIO','SANTO','COMUNHAO','FINAL','OUTROS') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`artista` varchar(255),
	`tom` varchar(10),
	`linkYoutube` varchar(512),
	`linkCifra` varchar(512),
	`linkLetra` varchar(512),
	`ordem` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `musicas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repertorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`tempoLiturgico` enum('ADVENTO','NATAL','QUARESMA','PASCOA','TEMPO_COMUM','CELEBRACOES') NOT NULL,
	`categoria` varchar(100) NOT NULL DEFAULT 'Missa Dominical',
	`descricao` text,
	`visivel` boolean NOT NULL DEFAULT true,
	`metaTitle` varchar(255),
	`metaDescription` varchar(320),
	`palavrasChave` text,
	`ogImage` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repertorios_id` PRIMARY KEY(`id`),
	CONSTRAINT `repertorios_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `musicas` ADD CONSTRAINT `musicas_repertorioId_repertorios_id_fk` FOREIGN KEY (`repertorioId`) REFERENCES `repertorios`(`id`) ON DELETE cascade ON UPDATE no action;