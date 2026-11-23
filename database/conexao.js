const Database = require('better-sqlite3');
const path = require('path');

// Caminho do banco de dados
const caminhoBanco = path.join(__dirname, 'banco.db');

// Criar ou abrir o banco
const db = new Database(caminhoBanco);

// Ativar relacionamentos entre tabelas
db.pragma('foreign_keys = ON');

// Criar tabelas
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        setor TEXT,
        perfil TEXT DEFAULT 'Usuario',
        senha_hash TEXT
    );

    CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS chamados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        prioridade TEXT NOT NULL,
        status TEXT DEFAULT 'Aberto',
        data_abertura TEXT DEFAULT CURRENT_TIMESTAMP,
        usuario_id INTEGER NOT NULL,
        categoria_id INTEGER NOT NULL,

        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    );
`);

// Categorias iniciais do sistema
const categoriasIniciais = [
    ['Hardware', 'Problemas com computadores e equipamentos'],
    ['Software', 'Instalações, erros e configurações de programas'],
    ['Rede', 'Problemas de rede e internet'],
    ['Acesso', 'Solicitações de acesso a sistemas'],
    ['Outros', 'Outras solicitações de suporte']
];

const inserirCategoria = db.prepare(`
    INSERT OR IGNORE INTO categorias (nome, descricao)
    VALUES (?, ?)
`);

for (const categoria of categoriasIniciais) {
    inserirCategoria.run(categoria);
}

console.log('Banco de dados SOLVIX conectado!');

module.exports = db;