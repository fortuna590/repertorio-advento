ALTER TABLE `products` ADD `parcelaMaxima` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `valorParcela` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `temJuros` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `freteGratis` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `valorFrete` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `desconto` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `precoOriginal` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `cupom` varchar(100);--> statement-breakpoint
ALTER TABLE `products` ADD `valorCupom` int DEFAULT 0 NOT NULL;