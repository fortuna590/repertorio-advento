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
