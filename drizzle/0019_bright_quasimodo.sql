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
	`compartilhamentos` int NOT NULL DEFAULT 0,
	`metaDescricao` varchar(160),
	`metaKeywords` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artigos_id` PRIMARY KEY(`id`),
	CONSTRAINT `artigos_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `depoimentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomeAutor` varchar(255) NOT NULL,
	`emailAutor` varchar(320) NOT NULL,
	`organizacao` varchar(255),
	`mensagem` text NOT NULL,
	`rating` int NOT NULL,
	`aprovado` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `depoimentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
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
CREATE TABLE `musicasAdminFavoritas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`musicaRepertorioId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `musicasAdminFavoritas_id` PRIMARY KEY(`id`)
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
	`cliquesYoutube` int NOT NULL DEFAULT 0,
	`cliquesCifra` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musicasRepertorio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `musicasRepertorioBase` (
	`id` int AUTO_INCREMENT NOT NULL,
	`repertorioId` varchar(100) NOT NULL,
	`momentoId` varchar(100) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`artista` varchar(255),
	`youtube` varchar(500),
	`cifra` varchar(500),
	`observacao` text,
	`ordem` int DEFAULT 999,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musicasRepertorioBase_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `participantesEscala` (
	`id` int AUTO_INCREMENT NOT NULL,
	`escalaId` int NOT NULL,
	`funcaoId` int NOT NULL,
	`userId` int,
	`nome` varchar(255) NOT NULL,
	`email` varchar(255),
	`telefone` varchar(20),
	`status` varchar(20) NOT NULL DEFAULT 'pendente',
	`observacoes` text,
	`token` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `participantesEscala_id` PRIMARY KEY(`id`),
	CONSTRAINT `participantesEscala_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
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
	`parcelaMaxima` int NOT NULL DEFAULT 1,
	`valorParcela` int NOT NULL DEFAULT 0,
	`temJuros` int NOT NULL DEFAULT 0,
	`freteGratis` int NOT NULL DEFAULT 0,
	`valorFrete` int NOT NULL DEFAULT 0,
	`desconto` int NOT NULL DEFAULT 0,
	`precoOriginal` int NOT NULL DEFAULT 0,
	`cupom` varchar(100),
	`valorCupom` int NOT NULL DEFAULT 0,
	`ultimaAtualizacao` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repertorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`notas` text,
	`musicas` text NOT NULL,
	`ordemMusicas` text,
	`emailUsuario` varchar(320),
	`nomeUsuario` varchar(255),
	`shareId` varchar(36),
	`isPublic` int NOT NULL DEFAULT 0,
	`dataCelebracao` timestamp,
	`visualizacoes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repertorios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repertoriosAdmin` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`slug` varchar(255) NOT NULL,
	`tempoLiturgico` varchar(100) DEFAULT 'Personalizado',
	`corPrimaria` varchar(7) NOT NULL DEFAULT '#7c3aed',
	`corSecundaria` varchar(7) NOT NULL DEFAULT '#d946ef',
	`corFundo` varchar(7) NOT NULL DEFAULT '#1e1b4b',
	`corTexto` varchar(7) NOT NULL DEFAULT '#ffffff',
	`imagemCapa` varchar(500),
	`publicado` int NOT NULL DEFAULT 1,
	`visualizacoes` int NOT NULL DEFAULT 0,
	`compartilhamentos` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repertoriosAdmin_id` PRIMARY KEY(`id`),
	CONSTRAINT `repertoriosAdmin_slug_unique` UNIQUE(`slug`)
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
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`paroquia` varchar(255),
	`foto` varchar(500),
	`bio` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `funcoesEscala` ADD CONSTRAINT `funcoesEscala_escalaId_escalas_id_fk` FOREIGN KEY (`escalaId`) REFERENCES `escalas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `momentosMissa` ADD CONSTRAINT `momentosMissa_repertorioId_repertoriosAdmin_id_fk` FOREIGN KEY (`repertorioId`) REFERENCES `repertoriosAdmin`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `musicasAdminFavoritas` ADD CONSTRAINT `musicasAdminFavoritas_musicaRepertorioId_musicasRepertorio_id_fk` FOREIGN KEY (`musicaRepertorioId`) REFERENCES `musicasRepertorio`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `musicasRepertorio` ADD CONSTRAINT `musicasRepertorio_repertorioId_repertoriosAdmin_id_fk` FOREIGN KEY (`repertorioId`) REFERENCES `repertoriosAdmin`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `musicasRepertorio` ADD CONSTRAINT `musicasRepertorio_momentoId_momentosMissa_id_fk` FOREIGN KEY (`momentoId`) REFERENCES `momentosMissa`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `participantesEscala` ADD CONSTRAINT `participantesEscala_escalaId_escalas_id_fk` FOREIGN KEY (`escalaId`) REFERENCES `escalas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `participantesEscala` ADD CONSTRAINT `participantesEscala_funcaoId_funcoesEscala_id_fk` FOREIGN KEY (`funcaoId`) REFERENCES `funcoesEscala`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `participantesEscala` ADD CONSTRAINT `participantesEscala_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repertorios` ADD CONSTRAINT `repertorios_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;