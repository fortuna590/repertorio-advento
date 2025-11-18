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
