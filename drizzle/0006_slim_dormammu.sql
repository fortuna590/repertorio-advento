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
