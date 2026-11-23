const db = require('./database/conexao');

// Apaga todos os chamados
db.prepare('DELETE FROM chamados').run();

// Reinicia a numeração dos chamados
db.prepare(`
    DELETE FROM sqlite_sequence
    WHERE name = 'chamados'
`).run();

console.log('Chamados excluídos com sucesso!');

db.close();