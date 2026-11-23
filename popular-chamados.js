
const db = require('./database/conexao');

// Consultar usuários e categorias cadastrados
const usuarios = db.prepare(`
    SELECT id FROM usuarios ORDER BY id
`).all();

const categorias = db.prepare(`
    SELECT id FROM categorias ORDER BY id
`).all();

if (usuarios.length === 0 || categorias.length === 0) {
    console.log('Cadastre usuários e categorias antes de continuar.');
    db.close();
    process.exit(1);
}

// Chamados fictícios para demonstração
const chamados = [
    {
        titulo: 'Computador apresentando lentidão',
        descricao: 'Estação de trabalho demora para iniciar e apresenta lentidão durante a utilização dos sistemas.',
        prioridade: 'Alta',
        status: 'Aberto'
    },
    {
        titulo: 'Erro ao acessar o sistema ERP',
        descricao: 'Sistema apresenta mensagem de erro ao tentar acessar o módulo financeiro.',
        prioridade: 'Alta',
        status: 'Em andamento'
    },
    {
        titulo: 'Solicitação de acesso ao sistema financeiro',
        descricao: 'Colaborador solicita liberação de acesso ao sistema financeiro da empresa.',
        prioridade: 'Média',
        status: 'Resolvido'
    },
    {
        titulo: 'Impressora não está imprimindo',
        descricao: 'Impressora do departamento comercial não responde aos comandos de impressão.',
        prioridade: 'Média',
        status: 'Aberto'
    },
    {
        titulo: 'Outlook não sincroniza os e-mails',
        descricao: 'Aplicativo apresenta falha na sincronização das mensagens recebidas.',
        prioridade: 'Alta',
        status: 'Em andamento'
    },
    {
        titulo: 'Wi-Fi desconectando frequentemente',
        descricao: 'Conexão sem fio apresenta quedas durante o expediente.',
        prioridade: 'Alta',
        status: 'Aberto'
    },
    {
        titulo: 'Instalação de software de edição',
        descricao: 'Solicitação de instalação e configuração de software para atividades do departamento.',
        prioridade: 'Baixa',
        status: 'Resolvido'
    },
    {
        titulo: 'Ramal telefônico sem sinal',
        descricao: 'Telefone da estação de trabalho não apresenta sinal ao retirar o aparelho do gancho.',
        prioridade: 'Média',
        status: 'Em andamento'
    },
    {
        titulo: 'Solicitação de redefinição de senha',
        descricao: 'Colaborador não consegue acessar sua conta corporativa e solicita redefinição de senha.',
        prioridade: 'Média',
        status: 'Resolvido'
    },
    {
        titulo: 'Monitor apresenta tela piscando',
        descricao: 'Monitor apresenta oscilações na imagem durante o uso.',
        prioridade: 'Média',
        status: 'Aberto'
    },
    {
        titulo: 'Falha na VPN corporativa',
        descricao: 'Usuário remoto não consegue estabelecer conexão com a rede interna.',
        prioridade: 'Alta',
        status: 'Em andamento'
    },
    {
        titulo: 'Atualização de navegador',
        descricao: 'Solicitação de atualização do navegador utilizado nas atividades corporativas.',
        prioridade: 'Baixa',
        status: 'Resolvido'
    },
    {
        titulo: 'Acesso bloqueado ao sistema de RH',
        descricao: 'Colaborador relata bloqueio de acesso ao sistema de gestão de pessoas.',
        prioridade: 'Alta',
        status: 'Aberto'
    },
    {
        titulo: 'Teclado com teclas sem funcionamento',
        descricao: 'Algumas teclas do teclado apresentam falhas durante a digitação.',
        prioridade: 'Baixa',
        status: 'Resolvido'
    },
    {
        titulo: 'Compartilhamento de arquivos indisponível',
        descricao: 'Pasta compartilhada da rede não está acessível para o departamento.',
        prioridade: 'Alta',
        status: 'Em andamento'
    },
    {
        titulo: 'Solicitação de criação de conta corporativa',
        descricao: 'Solicitação de criação de conta e configuração de e-mail para colaborador.',
        prioridade: 'Média',
        status: 'Aberto'
    },
    {
        titulo: 'Sistema apresenta erro ao salvar relatório',
        descricao: 'Aplicação interna apresenta erro ao tentar salvar relatórios em PDF.',
        prioridade: 'Alta',
        status: 'Em andamento'
    },
    {
        titulo: 'Scanner não reconhecido pelo computador',
        descricao: 'Equipamento não é identificado após conexão USB.',
        prioridade: 'Baixa',
        status: 'Resolvido'
    },
    {
        titulo: 'Solicitação de permissão em pasta compartilhada',
        descricao: 'Colaborador precisa de autorização para acessar documentos do departamento.',
        prioridade: 'Média',
        status: 'Aberto'
    },
    {
        titulo: 'Computador reiniciando inesperadamente',
        descricao: 'Estação apresenta reinicializações inesperadas durante o expediente.',
        prioridade: 'Alta',
        status: 'Em andamento'
    }
];

// Preparar inserção no banco
const inserirChamado = db.prepare(`
    INSERT INTO chamados (
        titulo,
        descricao,
        prioridade,
        status,
        data_abertura,
        usuario_id,
        categoria_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// Distribuir chamados entre usuários e categorias
const cadastrarChamados = db.transaction(() => {

    chamados.forEach((chamado, indice) => {

        const usuario = usuarios[indice % usuarios.length];
        const categoria = categorias[indice % categorias.length];

        const data = new Date();
        data.setDate(data.getDate() - ((indice * 2) % 30));

        const dataAbertura = data.toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        inserirChamado.run(
            chamado.titulo,
            chamado.descricao,
            chamado.prioridade,
            chamado.status,
            dataAbertura,
            usuario.id,
            categoria.id
        );

    });

});

cadastrarChamados();

console.log(`${chamados.length} chamados cadastrados com sucesso!`);

db.close();
