const express = require('express');
const db = require('./database/conexao');

const path = require('path');

const app = express();
const PORT = 3000;

// Permitir que o servidor receba dados em JSON
app.use(express.json());

// Disponibilizar os arquivos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rota inicial
app.get('/', (req, res) => {
    res.send('SOLVIX - Central de Suporte de TI');
});

// Verificar conexão com o banco
app.get('/api/status', (req, res) => {
    const resultado = db.prepare('SELECT 1 AS conectado').get();

    res.json({
        sistema: 'SOLVIX',
        banco: resultado.conectado === 1 ? 'Conectado' : 'Desconectado'
    });
});

// Consultar categorias
app.get('/api/categorias', (req, res) => {
    const categorias = db.prepare(`
        SELECT * FROM categorias
        ORDER BY nome
    `).all();

    res.json(categorias);
});

// CADASTRAR CATEGORIA
app.post('/api/categorias', (req, res) => {
    const { nome, descricao } = req.body;

    if (!nome || !nome.trim()) {
        return res.status(400).json({
            erro: 'O nome da categoria é obrigatório.'
        });
    }

    try {
        const resultado = db.prepare(`
            INSERT INTO categorias (nome, descricao)
            VALUES (?, ?)
        `).run(nome.trim(), descricao || '');

        res.status(201).json({
            mensagem: 'Categoria cadastrada com sucesso!',
            id: resultado.lastInsertRowid
        });

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                erro: 'Esta categoria já existe.'
            });
        }

        res.status(500).json({
            erro: 'Erro ao cadastrar categoria.'
        });
    }
});

// ATUALIZAR CATEGORIA
app.put('/api/categorias/:id', (req, res) => {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    if (!nome || !nome.trim()) {
        return res.status(400).json({
            erro: 'O nome da categoria é obrigatório.'
        });
    }

    try {
        const resultado = db.prepare(`
            UPDATE categorias
            SET nome = ?, descricao = ?
            WHERE id = ?
        `).run(
            nome.trim(),
            descricao || '',
            id
        );

        if (resultado.changes === 0) {
            return res.status(404).json({
                erro: 'Categoria não encontrada.'
            });
        }

        res.json({
            mensagem: 'Categoria atualizada com sucesso!'
        });

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                erro: 'Já existe uma categoria com esse nome.'
            });
        }

        res.status(500).json({
            erro: 'Erro ao atualizar categoria.'
        });
    }
});

// EXCLUIR CATEGORIA
app.delete('/api/categorias/:id', (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se existem chamados vinculados
        const chamados = db.prepare(`
            SELECT COUNT(*) AS total
            FROM chamados
            WHERE categoria_id = ?
        `).get(id);

        if (chamados.total > 0) {
            return res.status(409).json({
                erro: 'Não é possível excluir esta categoria, pois existem chamados vinculados a ela.'
            });
        }

        // Exclui a categoria
        const resultado = db.prepare(`
            DELETE FROM categorias
            WHERE id = ?
        `).run(id);

        if (resultado.changes === 0) {
            return res.status(404).json({
                erro: 'Categoria não encontrada.'
            });
        }

        res.json({
            mensagem: 'Categoria excluída com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao excluir categoria:', erro);

        res.status(500).json({
            erro: 'Erro ao excluir categoria.'
        });
    }
});

// Consultar usuários
app.get('/api/usuarios', (req, res) => {
    const usuarios = db.prepare(`
        SELECT id, nome, email, setor, perfil
        FROM usuarios
        ORDER BY nome
    `).all();

    res.json(usuarios);
});

// Cadastrar usuário
app.post('/api/usuarios', (req, res) => {
    const { nome, email, setor, perfil } = req.body;

    if (!nome || !email) {
        return res.status(400).json({
            erro: 'Nome e e-mail são obrigatórios.'
        });
    }

    try {
        const resultado = db.prepare(`
            INSERT INTO usuarios (nome, email, setor, perfil)
            VALUES (?, ?, ?, ?)
        `).run(
            nome.trim(),
            email.trim().toLowerCase(),
            setor || '',
            perfil || 'Usuario'
        );

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: resultado.lastInsertRowid
        });

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                erro: 'Este e-mail já está cadastrado.'
            });
        }

        res.status(500).json({
            erro: 'Erro ao cadastrar usuário.'
        });
    }
});

// Cadastrar chamado
app.post('/api/chamados', (req, res) => {
    const {
        titulo,
        descricao,
        prioridade,
        usuario_id,
        categoria_id
    } = req.body;

    // Validar campos obrigatórios
    if (!titulo || !descricao || !prioridade || !usuario_id || !categoria_id) {
        return res.status(400).json({
            erro: 'Preencha todos os campos obrigatórios.'
        });
    }

    // Validar prioridade
    const prioridadesValidas = ['Baixa', 'Média', 'Alta'];

    if (!prioridadesValidas.includes(prioridade)) {
        return res.status(400).json({
            erro: 'Prioridade inválida.'
        });
    }

    try {
        const resultado = db.prepare(`
            INSERT INTO chamados (
                titulo,
                descricao,
                prioridade,
                usuario_id,
                categoria_id
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            titulo.trim(),
            descricao.trim(),
            prioridade,
            usuario_id,
            categoria_id
        );

        res.status(201).json({
            mensagem: 'Chamado cadastrado com sucesso!',
            id: resultado.lastInsertRowid
        });

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
            return res.status(400).json({
                erro: 'Usuário ou categoria não encontrados.'
            });
        }

        console.error(erro);

        res.status(500).json({
            erro: 'Erro ao cadastrar chamado.'
        });
    }
});

// Consultar todos os chamados
app.get('/api/chamados', (req, res) => {

    const chamados = db.prepare(`
        SELECT
            chamados.id,
            chamados.categoria_id,
            chamados.titulo,
            chamados.descricao,
            chamados.prioridade,
            chamados.status,
            chamados.data_abertura,
            usuarios.nome AS solicitante,
            categorias.nome AS categoria

        FROM chamados

        INNER JOIN usuarios
            ON chamados.usuario_id = usuarios.id

        INNER JOIN categorias
            ON chamados.categoria_id = categorias.id

        ORDER BY chamados.id DESC
    `).all();

    res.json(chamados);
});

// Consultar detalhes de um chamado
app.get('/api/chamados/:id', (req, res) => {

    const chamado = db.prepare(`
        SELECT
            chamados.*,
            usuarios.nome AS solicitante,
            categorias.nome AS categoria

        FROM chamados

        INNER JOIN usuarios
            ON chamados.usuario_id = usuarios.id

        INNER JOIN categorias
            ON chamados.categoria_id = categorias.id

        WHERE chamados.id = ?
    `).get(req.params.id);

    if (!chamado) {
        return res.status(404).json({
            erro: 'Chamado não encontrado.'
        });
    }

    res.json(chamado);
});

// ATUALIZAR CHAMADO
app.put('/api/chamados/:id', (req, res) => {

    const id = Number(req.params.id);

    const chamado = db.prepare(`
        SELECT * FROM chamados WHERE id = ?
    `).get(id);

    if (!chamado) {
        return res.status(404).json({
            erro: 'Chamado não encontrado.'
        });
    }

    // Mantém os valores atuais quando o campo não for enviado
    const titulo = req.body.titulo ?? chamado.titulo;
    const descricao = req.body.descricao ?? chamado.descricao;
    const prioridade = req.body.prioridade ?? chamado.prioridade;
    const status = req.body.status ?? chamado.status;
    const usuario_id = req.body.usuario_id ?? chamado.usuario_id;
    const categoria_id = req.body.categoria_id ?? chamado.categoria_id;

    // Validar campos obrigatórios
    if (!titulo.trim() || !descricao.trim()) {
        return res.status(400).json({
            erro: 'Título e descrição são obrigatórios.'
        });
    }

    const prioridadesValidas = ['Baixa', 'Média', 'Alta'];

    const statusValidos = [
        'Aberto',
        'Em andamento',
        'Resolvido'
    ];

    if (!prioridadesValidas.includes(prioridade)) {
        return res.status(400).json({
            erro: 'Prioridade inválida.'
        });
    }

    if (!statusValidos.includes(status)) {
        return res.status(400).json({
            erro: 'Status inválido.'
        });
    }

    try {
        db.prepare(`
            UPDATE chamados
            SET titulo = ?,
                descricao = ?,
                prioridade = ?,
                status = ?,
                usuario_id = ?,
                categoria_id = ?
            WHERE id = ?
        `).run(
            titulo.trim(),
            descricao.trim(),
            prioridade,
            status,
            usuario_id,
            categoria_id,
            id
        );

        res.json({
            mensagem: 'Chamado atualizado com sucesso!',
            id: id
        });

    } catch (erro) {
        console.error('Erro ao atualizar chamado:', erro);

        res.status(500).json({
            erro: 'Erro ao atualizar chamado.'
        });
    }
});

// ATUALIZAR USUÁRIO
app.put('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, setor, perfil } = req.body;

    if (!nome || !email) {
        return res.status(400).json({
            erro: 'Nome e e-mail são obrigatórios.'
        });
    }

    try {
        const resultado = db.prepare(`
            UPDATE usuarios
            SET nome = ?, email = ?, setor = ?, perfil = ?
            WHERE id = ?
        `).run(
            nome.trim(),
            email.trim().toLowerCase(),
            setor,
            perfil,
            id
        );

        if (resultado.changes === 0) {
            return res.status(404).json({
                erro: 'Usuário não encontrado.'
            });
        }

        res.json({
            mensagem: 'Usuário atualizado com sucesso!'
        });

    } catch (erro) {
        if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({
                erro: 'Este e-mail já está cadastrado.'
            });
        }

        res.status(500).json({
            erro: 'Erro ao atualizar usuário.'
        });
    }
});

// EXCLUIR USUÁRIO
app.delete('/api/usuarios/:id', (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se o usuário possui chamados
        const chamados = db.prepare(`
            SELECT COUNT(*) AS total
            FROM chamados
            WHERE usuario_id = ?
        `).get(id);

        if (chamados.total > 0) {
            return res.status(409).json({
                erro: 'Não é possível excluir este usuário, pois existem chamados vinculados a ele.'
            });
        }

        // Exclui o usuário
        const resultado = db.prepare(`
            DELETE FROM usuarios
            WHERE id = ?
        `).run(id);

        if (resultado.changes === 0) {
            return res.status(404).json({
                erro: 'Usuário não encontrado.'
            });
        }

        res.json({
            mensagem: 'Usuário excluído com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao excluir usuário:', erro);

        res.status(500).json({
            erro: 'Erro ao excluir usuário.'
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`SOLVIX rodando em http://localhost:${PORT}`);
});