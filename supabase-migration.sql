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
CREATE TABLE `clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`musicaId` varchar(100) NOT NULL,
	`musicaTitulo` varchar(255) NOT NULL,
	`musicaArtista` varchar(255) NOT NULL,
	`momentoId` varchar(100) NOT NULL,
	`momentoTitulo` varchar(255) NOT NULL,
	`linkType` enum('youtube','cifra') NOT NULL,
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clicks_id` PRIMARY KEY(`id`)
);
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('donation','contact','newsletter','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`data` text,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
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
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`preco` int NOT NULL,
	`moeda` varchar(10) NOT NULL DEFAULT 'BRL',
	`plataforma` enum('mercado_livre','amazon') NOT NULL,
	`produtoId` varchar(100) NOT NULL,
	`linkAfiliado` varchar(500) NOT NULL,
	`imagem` varchar(500),
	`disponivel` int NOT NULL DEFAULT 1,
	`ultimaAtualizacao` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
CREATE TABLE `liturgiaFavoritos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`liturgiaId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `liturgiaFavoritos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `liturgias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data` varchar(10) NOT NULL,
	`dataISO` date NOT NULL,
	`liturgia` varchar(255) NOT NULL,
	`cor` varchar(50) NOT NULL,
	`coleta` text,
	`oferendas` text,
	`comunhao` text,
	`extras` text,
	`primeiraLeitura` text,
	`segundaLeitura` text,
	`salmo` text,
	`evangelho` text,
	`apiResponse` text,
	`ultimaAtualizacao` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `liturgias_id` PRIMARY KEY(`id`),
	CONSTRAINT `liturgias_data_unique` UNIQUE(`data`),
	CONSTRAINT `liturgias_dataISO_unique` UNIQUE(`dataISO`)
);
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
ALTER TABLE `users` ADD `bio` text;ALTER TABLE `repertorios` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `repertorios` ADD `notas` text;--> statement-breakpoint
ALTER TABLE `repertorios` ADD `ordemMusicas` text;--> statement-breakpoint
ALTER TABLE `repertorios` ADD `shareId` varchar(36);--> statement-breakpoint
ALTER TABLE `repertorios` ADD `isPublic` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `repertorios` ADD `dataCelebracao` timestamp;--> statement-breakpoint
ALTER TABLE `repertorios` ADD CONSTRAINT `repertorios_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;