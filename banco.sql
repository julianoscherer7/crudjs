-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS inventario_moderno;
USE inventario_moderno;

-- Tabela de itens
CREATE TABLE IF NOT EXISTS itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserção de dados de exemplo
INSERT INTO itens (nome, tipo, quantidade) VALUES
('Notebook Dell XPS', 'Eletrônicos', 15),
('Mouse Logitech MX', 'Periféricos', 32),
('Teclado Mecânico', 'Periféricos', 18),
('Monitor 4K Samsung', 'Eletrônicos', 8),
('Cabo HDMI', 'Acessórios', 45),
('SSD 1TB Kingston', 'Armazenamento', 22),
('Webcam Full HD', 'Periféricos', 12),
('Fone Bluetooth Sony', 'Áudio', 28);
