ALTER TABLE `musicasRepertorio` ADD `cliquesYoutube` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `musicasRepertorio` ADD `cliquesCifra` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `repertoriosAdmin` ADD `tempoLiturgico` varchar(100) DEFAULT 'Personalizado';