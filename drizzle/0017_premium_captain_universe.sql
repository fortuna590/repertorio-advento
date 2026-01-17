ALTER TABLE `participantesEscala` ADD `token` varchar(64);--> statement-breakpoint
ALTER TABLE `participantesEscala` ADD CONSTRAINT `participantesEscala_token_unique` UNIQUE(`token`);