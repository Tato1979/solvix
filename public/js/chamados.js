let todosChamados = [];

let usuariosCadastrados = [];

let categoriasCadastradas = [];

let graficoCategorias = null;
let graficoPrioridades = null;
let graficoStatus = null;

// Buscar chamados na API
async function carregarChamados() {
    const lista = document.getElementById('lista-chamados');

    try {
        const resposta = await fetch('/api/chamados');
        const chamados = await resposta.json();
        todosChamados = chamados;

        // Atualizar indicadores do Dashboard
        atualizarDashboard(todosChamados); 
        atualizarGraficos(todosChamados);
        carregarChamadosRecentes(todosChamados);       

        if (chamados.length === 0) {
            lista.innerHTML = '<p>Nenhum chamado cadastrado.</p>';
            return;
        }


        exibirChamados(todosChamados);


    } catch (erro) {
        lista.innerHTML = '<p>Erro ao carregar chamados.</p>';
        console.error(erro);
    }
}

// Executar ao abrir a página
carregarChamados();

function atualizarGraficos(chamados) {

    // CONTAR CHAMADOS POR CATEGORIA
    const categorias = {};

    chamados.forEach(chamado => {
        categorias[chamado.categoria] =
            (categorias[chamado.categoria] || 0) + 1;
    });

    // CONTAR CHAMADOS POR PRIORIDADE
    const prioridades = {
        'Baixa': 0,
        'Média': 0,
        'Alta': 0
    };

    chamados.forEach(chamado => {
        prioridades[chamado.prioridade]++;
    });

    // CONTAR CHAMADOS POR STATUS
    const status = {
        'Aberto': 0,
        'Em andamento': 0,
        'Resolvido': 0
    };

    chamados.forEach(chamado => {
        status[chamado.status]++;
    });


    // GRÁFICO POR CATEGORIA
    if (graficoCategorias) graficoCategorias.destroy();

    graficoCategorias = new Chart(
        document.getElementById('grafico-categorias'),
        {
            type: 'doughnut',
            data: {
                labels: Object.keys(categorias),
                datasets: [{
                    data: Object.values(categorias),
                    backgroundColor: [
                        '#10B981',
                        '#3B82F6',
                        '#F59E0B',
                        '#8B5CF6',
                        '#EF4444',
                        '#64748B'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );


    // GRÁFICO POR PRIORIDADE
    if (graficoPrioridades) graficoPrioridades.destroy();

    graficoPrioridades = new Chart(
        document.getElementById('grafico-prioridades'),
        {
            type: 'bar',
            data: {
                labels: Object.keys(prioridades),
                datasets: [{
                    label: 'Quantidade de chamados',
                    data: Object.values(prioridades),
                    backgroundColor: [
                        '#10B981',
                        '#F59E0B',
                        '#EF4444'
                    ],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        }
    );


    // GRÁFICO POR STATUS
    if (graficoStatus) graficoStatus.destroy();

    graficoStatus = new Chart(
        document.getElementById('grafico-status'),
        {
            type: 'pie',
            data: {
                labels: Object.keys(status),
                datasets: [{
                    data: Object.values(status),
                    backgroundColor: [
                        '#3B82F6',
                        '#F59E0B',
                        '#10B981'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

}



// Buscar categorias na API
async function carregarCategorias() {
    const campoCategoria = document.getElementById('categoria');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const categoriaEdicao = document.getElementById('editar-categoria-chamado');

    try {
        const resposta = await fetch('/api/categorias');
        const categorias = await resposta.json();

        if (!resposta.ok) {
            throw new Error('Erro ao buscar categorias.');
        }

        // Limpar opções anteriores
        campoCategoria.innerHTML = `
            <option value="">Selecione uma categoria</option>
        `;

        filtroCategoria.innerHTML = `
            <option value="">Todas as categorias</option>
        `;

        categoriaEdicao.innerHTML = `
            <option value="">Selecione a categoria</option>
        `;

        // Inserir categorias atualizadas
        categorias.forEach(categoria => {

            const opcao = document.createElement('option');
            opcao.value = categoria.id;
            opcao.textContent = categoria.nome;
            campoCategoria.appendChild(opcao);

            const opcaoFiltro = document.createElement('option');
            opcaoFiltro.value = categoria.id;
            opcaoFiltro.textContent = categoria.nome;
            filtroCategoria.appendChild(opcaoFiltro);

            const opcaoEdicao = document.createElement('option');
            opcaoEdicao.value = categoria.id;
            opcaoEdicao.textContent = categoria.nome;
            categoriaEdicao.appendChild(opcaoEdicao);

        });

    } catch (erro) {
        console.error('Erro ao carregar categorias:', erro);
    }
}

// Executar ao abrir a página
carregarCategorias();


// Cadastrar novo chamado
const formulario = document.getElementById('form-chamado');

formulario.addEventListener('submit', async (evento) => {

    // Impedir que a página seja recarregada
    evento.preventDefault();

    // Capturar os dados preenchidos
    const novoChamado = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        prioridade: document.getElementById('prioridade').value,
        usuario_id: Number(document.getElementById('solicitante').value),
        categoria_id: Number(document.getElementById('categoria').value)
    };

    const mensagem = document.getElementById('mensagem-formulario');

    try {
        const resposta = await fetch('/api/chamados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoChamado)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao cadastrar chamado.');
        }

        mensagem.textContent = 'Chamado cadastrado com sucesso!';
        mensagem.style.color = '#059669';

        // Limpar formulário
        formulario.reset();

        // Atualizar a listagem
        carregarChamados();

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.style.color = '#DC2626';

        console.error(erro);
    }
});


// Atualizar status do chamado
const listaChamados = document.getElementById('lista-chamados');

listaChamados.addEventListener('change', async (evento) => {

    // Verificar se a alteração aconteceu em um seletor de status
    if (!evento.target.classList.contains('seletor-status')) {
        return;
    }

    const id = evento.target.dataset.id;
    const novoStatus = evento.target.value;

    try {
        const resposta = await fetch(`/api/chamados/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: novoStatus
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao atualizar status.');
        }

        // Atualizar a listagem
        carregarChamados();

    } catch (erro) {
        alert(erro.message);
        console.error(erro);

        // Recuperar o status que está salvo no banco
        carregarChamados();
    }
});

// Exibir chamados na tela

function exibirChamados(chamados) {
    const lista = document.getElementById('lista-chamados');

    if (chamados.length === 0) {
        lista.innerHTML = '<p>Nenhum chamado encontrado.</p>';
        return;
    }

    lista.innerHTML = `
        <div class="tabela-container">
            <table class="tabela-chamados">

                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Título</th>
                        <th>Solicitante</th>
                        <th>Categoria</th>
                        <th>Prioridade</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    ${chamados.map(chamado => `
                        <tr>
                            <td>#${chamado.id}</td>

                            <td class="titulo-chamado">
                                ${chamado.titulo}
                            </td>

                            <td>${chamado.solicitante}</td>

                            <td>${chamado.categoria}</td>

                            <td>
                                <span class="prioridade prioridade-${chamado.prioridade.toLowerCase()}">
                                    ${chamado.prioridade}
                                </span>
                            </td>

                            <td>
                                <select
                                    class="seletor-status"
                                    data-id="${chamado.id}"
                                >
                                    <option value="Aberto" ${chamado.status === 'Aberto' ? 'selected' : ''}>Aberto</option>

                                    <option value="Em andamento" ${chamado.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>

                                    <option value="Resolvido" ${chamado.status === 'Resolvido' ? 'selected' : ''}>Resolvido</option>
                                </select>
                            </td>

                            <td>
                                <button
                                    type="button"
                                    class="btn-detalhes"
                                    data-id="${chamado.id}"
                                    title="Visualizar chamado"
                                    aria-label="Visualizar chamado"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    class="btn-editar-chamado"
                                    data-id="${chamado.id}"
                                    title="Editar chamado"
                                    aria-label="Editar chamado"
                                >✎</button>
                            </td>                           
                            
                        </tr>
                    `).join('')}
                </tbody>

            </table>
        </div>
    `;
}


// Aplicar filtros aos chamados
function filtrarChamados() {

    const status = document.getElementById('filtro-status').value;
    const prioridade = document.getElementById('filtro-prioridade').value;
    const categoria = document.getElementById('filtro-categoria').value;

    const pesquisa = document.getElementById('pesquisa-chamado')
    .value.toLowerCase().trim();

    const chamadosFiltrados = todosChamados.filter(chamado => {


    const correspondePesquisa =
        chamado.id.toString().includes(pesquisa) ||
        chamado.titulo.toLowerCase().includes(pesquisa) ||
        chamado.solicitante.toLowerCase().includes(pesquisa);

        const correspondeStatus =
            status === '' || chamado.status === status;

        const correspondePrioridade =
            prioridade === '' || chamado.prioridade === prioridade;

        const correspondeCategoria =
            categoria === '' || chamado.categoria_id.toString() === categoria;

        return correspondePesquisa &&
            correspondeStatus &&
            correspondePrioridade &&
            correspondeCategoria;
    });

    exibirChamados(chamadosFiltrados);
}

// Detectar alterações nos filtros
document.getElementById('filtro-status')
    .addEventListener('change', filtrarChamados);

document.getElementById('filtro-prioridade')
    .addEventListener('change', filtrarChamados);

document.getElementById('filtro-categoria')
    .addEventListener('change', filtrarChamados);

document.getElementById('pesquisa-chamado')
    .addEventListener('input', filtrarChamados);    


// Navegação entre telas
const menuItens = document.querySelectorAll('.menu-item');

menuItens.forEach(item => {

    item.addEventListener('click', (evento) => {

        evento.preventDefault();

        // Identificar a tela selecionada
        const destino = item.getAttribute('href');

        // Ocultar todas as telas
        document.querySelectorAll('.tela').forEach(tela => {
            tela.classList.remove('ativa');
        });

        // Exibir a tela selecionada
        if (destino === '#chamados') {
            document.getElementById('tela-chamados').classList.add('ativa');
        }

        if (destino === '#novo-chamado') {
            document.getElementById('tela-novo-chamado').classList.add('ativa');
        }

        if (destino === '#usuarios') {
            document.getElementById('tela-usuarios').classList.add('ativa');
        }
        
        if (destino === '#categorias') {
            document.getElementById('tela-categorias').classList.add('ativa');
        }
        
        if (destino === '#dashboard') {
            document.getElementById('tela-dashboard').classList.add('ativa');
        }        

        // Atualizar item ativo do menu
        menuItens.forEach(menu => {
            menu.classList.remove('ativo');
        });

        item.classList.add('ativo');

    });

});


// Abrir detalhes do chamado
const modalDetalhes = document.getElementById('modal-detalhes');

const conteudoDetalhes = document.getElementById('conteudo-detalhes');

document.getElementById('lista-chamados').addEventListener('click', async (evento) => {

    // BOTÃO EDITAR
    const botaoEditar = evento.target.closest('.btn-editar-chamado');

    if (botaoEditar) {
        const id = botaoEditar.dataset.id;

        try {
            const resposta = await fetch(`/api/chamados/${id}`);
            const chamado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(chamado.erro || 'Erro ao consultar chamado.');
            }

            document.getElementById('editar-id-chamado').value = chamado.id;
            document.getElementById('editar-titulo-chamado').value = chamado.titulo;
            document.getElementById('editar-descricao-chamado').value = chamado.descricao;

            document.getElementById('editar-solicitante-chamado').value = chamado.usuario_id;

            document.getElementById('editar-categoria-chamado').value = chamado.categoria_id;

            document.getElementById('editar-prioridade-chamado').value = chamado.prioridade;
            document.getElementById('editar-status-chamado').value = chamado.status;

            document.getElementById('modal-editar-chamado').classList.add('aberto');

        } catch (erro) {
            alert(erro.message);
            console.error(erro);
        }

        return;
    }    

    const botao = evento.target.closest('.btn-detalhes');

    if (!botao) {
        return;
    }

    const id = botao.dataset.id;

    modalDetalhes.classList.add('aberto');

    conteudoDetalhes.innerHTML = 'Carregando informações...';

    try {
        const resposta = await fetch(`/api/chamados/${id}`);

        const chamado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(chamado.erro || 'Erro ao consultar chamado.');
        }

        conteudoDetalhes.innerHTML = `
            <p><strong>Número:</strong> #${chamado.id}</p>

            <p><strong>Título:</strong> ${chamado.titulo}</p>

            <p><strong>Descrição:</strong> ${chamado.descricao}</p>

            <p><strong>Solicitante:</strong> ${chamado.solicitante}</p>

            <p><strong>Categoria:</strong> ${chamado.categoria}</p>

            <p><strong>Prioridade:</strong> ${chamado.prioridade}</p>

            <p><strong>Status:</strong> ${chamado.status}</p>

            <p><strong>Data de abertura:</strong> ${chamado.data_abertura}</p>
        `;

    } catch (erro) {
        conteudoDetalhes.textContent = erro.message;
        console.error(erro);
    }
});

// Fechar janela de detalhes
document.getElementById('fechar-modal').addEventListener('click', () => {
    modalDetalhes.classList.remove('aberto');
});

// Fechar ao clicar fora da janela
modalDetalhes.addEventListener('click', (evento) => {

    if (evento.target === modalDetalhes) {
        modalDetalhes.classList.remove('aberto');
    }

});


// Atualizar indicadores do Dashboard
function atualizarDashboard(chamados) {

    const total = chamados.length;

    const abertos = chamados.filter(
        chamado => chamado.status === 'Aberto'
    ).length;

    const emAndamento = chamados.filter(
        chamado => chamado.status === 'Em andamento'
    ).length;

    const resolvidos = chamados.filter(
        chamado => chamado.status === 'Resolvido'
    ).length;

    document.getElementById('total-chamados').textContent = total;

    document.getElementById('total-abertos').textContent = abertos;

    document.getElementById('total-andamento').textContent = emAndamento;

    document.getElementById('total-resolvidos').textContent = resolvidos;
}


// Exibir chamados recentes no Dashboard
function carregarChamadosRecentes(chamados) {

    const area = document.getElementById('chamados-recentes');

    const recentes = chamados.slice(0, 5);

    if (recentes.length === 0) {
        area.innerHTML = '<p>Nenhum chamado cadastrado.</p>';
        return;
    }

    area.innerHTML = recentes.map(chamado => `
        <div class="chamado-recente">

            <div>
                <strong>#${chamado.id} - ${chamado.titulo}</strong>
                <p>${chamado.solicitante} | ${chamado.categoria}</p>
            </div>

            <span class="status status-${chamado.status.toLowerCase().replace(' ', '-')}">
                ${chamado.status}
            </span>

        </div>
    `).join('');
}

async function carregarUsuarios() {
    try {
        const resposta = await fetch('/api/usuarios');
        const usuarios = await resposta.json();

        usuariosCadastrados = usuarios;
        
        const solicitante = document.getElementById('solicitante');

        solicitante.innerHTML = `
            <option value="">Selecione o solicitante</option>
            ${usuarios.map(usuario => `
                <option value="${usuario.id}">${usuario.nome}</option>
            `).join('')}
        `;   
        
        const solicitanteEdicao = document.getElementById('editar-solicitante-chamado');

        solicitanteEdicao.innerHTML = `
            <option value="">Selecione o solicitante</option>
            ${usuarios.map(usuario => `
                <option value="${usuario.id}">${usuario.nome}</option>
            `).join('')}
        `;        

        const lista = document.getElementById('lista-usuarios');

        lista.innerHTML = `
            <table class="tabela-usuarios">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Setor</th>
                        <th>Perfil</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(usuario => `
                        <tr>
                            <td>${usuario.id}</td>
                            <td>${usuario.nome}</td>
                            <td>${usuario.email}</td>
                            <td>${usuario.setor || '-'}</td>
                            <td>${usuario.perfil}</td>
                            <td class="acoes-tabela">
                                <button
                                    type="button"
                                    class="btn-editar-usuario"
                                    data-id="${usuario.id}"
                                    title="Editar usuário"
                                    aria-label="Editar usuário"
                                >✎</button>

                                <button
                                    type="button"
                                    class="btn-excluir-usuario"
                                    data-id="${usuario.id}"
                                    title="Excluir usuário"
                                    aria-label="Excluir usuário"
                                >🗑</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (erro) {
        console.error('Erro ao carregar usuários:', erro);
    }
}

const listaUsuarios = document.getElementById('lista-usuarios');

listaUsuarios.addEventListener('click', (evento) => {

    // BOTÃO EDITAR
    const botao = evento.target.closest('.btn-editar-usuario');

    if (botao) {
        const id = Number(botao.dataset.id);

        const usuario = usuariosCadastrados.find(
            usuario => usuario.id === id
        );

        if (!usuario) return;

        document.getElementById('editar-id').value = usuario.id;
        document.getElementById('editar-nome').value = usuario.nome;
        document.getElementById('editar-email').value = usuario.email;
        document.getElementById('editar-setor').value = usuario.setor || '';
        document.getElementById('editar-perfil').value = usuario.perfil;

        document.getElementById('modal-usuario').classList.add('aberto');
        return;
    }

    // BOTÃO EXCLUIR
    const botaoExcluir = evento.target.closest('.btn-excluir-usuario');

    if (botaoExcluir) {
        const id = botaoExcluir.dataset.id;

        const confirmar = confirm(
            'Tem certeza de que deseja excluir este usuário?'
        );

        if (!confirmar) return;

        fetch(`/api/usuarios/${id}`, {
            method: 'DELETE'
        })
        .then(async resposta => {
            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.erro);
            }

            alert('Usuário excluído com sucesso!');
            carregarUsuarios();
        })
        .catch(erro => {
            alert(erro.message);
        });
    }

});

carregarUsuarios();

const formEditarChamado = document.getElementById('form-editar-chamado');

formEditarChamado.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const id = document.getElementById('editar-id-chamado').value;

    const chamadoAtualizado = {
        titulo: document.getElementById('editar-titulo-chamado').value,
        descricao: document.getElementById('editar-descricao-chamado').value,
        usuario_id: Number(document.getElementById('editar-solicitante-chamado').value),
        categoria_id: Number(document.getElementById('editar-categoria-chamado').value),
        prioridade: document.getElementById('editar-prioridade-chamado').value,
        status: document.getElementById('editar-status-chamado').value
    };

    try {
        const resposta = await fetch(`/api/chamados/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chamadoAtualizado)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao atualizar chamado.');
        }

        document.getElementById('mensagem-editar-chamado').textContent =
            'Chamado atualizado com sucesso!';

        document.getElementById('mensagem-editar-chamado').style.color = '#059669';

        await carregarChamados();

        modalEditarChamado.classList.remove('aberto');

    } catch (erro) {
        document.getElementById('mensagem-editar-chamado').textContent = erro.message;
        document.getElementById('mensagem-editar-chamado').style.color = '#DC2626';
    }
});

const formEditarCategoria = document.getElementById('form-editar-categoria');

formEditarCategoria.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const id = document.getElementById('editar-id-categoria').value;

    const categoriaAtualizada = {
        nome: document.getElementById('editar-nome-categoria').value,
        descricao: document.getElementById('editar-descricao-categoria').value
    };

    try {
        const resposta = await fetch(`/api/categorias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoriaAtualizada)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao atualizar categoria.');
        }

        document.getElementById('mensagem-editar-categoria').textContent =
            'Categoria atualizada com sucesso!';

        document.getElementById('mensagem-editar-categoria').style.color = '#059669';

        await carregarCategoriasTabela();
        await carregarCategorias();

        modalEditarCategoria.classList.remove('aberto');

    } catch (erro) {
        document.getElementById('mensagem-editar-categoria').textContent = erro.message;
        document.getElementById('mensagem-editar-categoria').style.color = '#DC2626';
    }
});

const formUsuario = document.getElementById('form-usuario');

formUsuario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const novoUsuario = {
        nome: document.getElementById('nome-usuario').value,
        email: document.getElementById('email-usuario').value,
        setor: document.getElementById('setor-usuario').value,
        perfil: document.getElementById('perfil-usuario').value
    };

    try {
        const resposta = await fetch('/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoUsuario)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Não foi possível cadastrar o usuário.');
        }

        document.getElementById('mensagem-usuario').textContent =
            'Usuário cadastrado com sucesso!';

        document.getElementById('mensagem-usuario').style.color = '#059669';

        formUsuario.reset();

        carregarUsuarios();

    } catch (erro) {
        document.getElementById('mensagem-usuario').textContent = erro.message;
        document.getElementById('mensagem-usuario').style.color = '#DC2626';
    }
});

const formEditarUsuario = document.getElementById('form-editar-usuario');

formEditarUsuario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const id = document.getElementById('editar-id').value;

    const usuarioAtualizado = {
        nome: document.getElementById('editar-nome').value,
        email: document.getElementById('editar-email').value,
        setor: document.getElementById('editar-setor').value,
        perfil: document.getElementById('editar-perfil').value
    };

    try {
        const resposta = await fetch(`/api/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioAtualizado)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao atualizar usuário.');
        }

        document.getElementById('mensagem-editar-usuario').textContent =
            'Usuário atualizado com sucesso!';

        document.getElementById('mensagem-editar-usuario').style.color = '#059669';

        await carregarUsuarios();

        document.getElementById('modal-usuario').classList.remove('aberto');

    } catch (erro) {
        document.getElementById('mensagem-editar-usuario').textContent = erro.message;
        document.getElementById('mensagem-editar-usuario').style.color = '#DC2626';
    }
});

async function carregarCategoriasTabela() {
    try {
        const resposta = await fetch('/api/categorias');
        const categorias = await resposta.json();

        categoriasCadastradas = categorias;

        const lista = document.getElementById('lista-categorias');

        lista.innerHTML = `
            <table class="tabela-usuarios">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${categorias.map(categoria => `
                        <tr>
                            <td>${categoria.id}</td>
                            <td>${categoria.nome}</td>
                            <td>${categoria.descricao || '-'}</td>
                            <td class="acoes-tabela">
                                <button
                                    type="button"
                                    class="btn-editar-categoria"
                                    data-id="${categoria.id}"
                                    title="Editar categoria"
                                    aria-label="Editar categoria"
                                >✎</button>

                                <button
                                    type="button"
                                    class="btn-excluir-categoria"
                                    data-id="${categoria.id}"
                                    title="Excluir categoria"
                                    aria-label="Excluir categoria"
                                >🗑</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (erro) {
        console.error('Erro ao carregar categorias:', erro);
    }
}

// ABRIR EDIÇÃO DE CATEGORIA
const listaCategorias = document.getElementById('lista-categorias');

listaCategorias.addEventListener('click', (evento) => {

    // BOTÃO EDITAR
    const botao = evento.target.closest('.btn-editar-categoria');

    if (botao) {
        const id = Number(botao.dataset.id);

        const categoria = categoriasCadastradas.find(
            categoria => categoria.id === id
        );

        if (!categoria) return;

        document.getElementById('editar-id-categoria').value = categoria.id;
        document.getElementById('editar-nome-categoria').value = categoria.nome;
        document.getElementById('editar-descricao-categoria').value =
            categoria.descricao || '';

        document.getElementById('modal-editar-categoria').classList.add('aberto');

        return;
    }

    // BOTÃO EXCLUIR
    const botaoExcluir = evento.target.closest('.btn-excluir-categoria');

    if (botaoExcluir) {
        const id = botaoExcluir.dataset.id;

        const confirmar = confirm(
            'Tem certeza de que deseja excluir esta categoria?'
        );

        if (!confirmar) return;

        fetch(`/api/categorias/${id}`, {
            method: 'DELETE'
        })
        .then(async resposta => {
            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.erro);
            }

            alert('Categoria excluída com sucesso!');

            await carregarCategoriasTabela();
            await carregarCategorias();
        })
        .catch(erro => {
            alert(erro.message);
        });
    }

});

const modalEditarCategoria = document.getElementById('modal-editar-categoria');

document.getElementById('fechar-modal-editar-categoria').addEventListener('click', () => {
    modalEditarCategoria.classList.remove('aberto');
});

modalEditarCategoria.addEventListener('click', (evento) => {
    if (evento.target === modalEditarCategoria) {
        modalEditarCategoria.classList.remove('aberto');
    }
});

carregarCategoriasTabela();

const btnNovaCategoria = document.getElementById('btn-nova-categoria');

btnNovaCategoria.addEventListener('click', () => {
    document.getElementById('form-categoria').reset();

    document.getElementById('mensagem-categoria').textContent = '';

    document.getElementById('modal-categoria').classList.add('aberto');
});

// FECHAR MODAL DE USUÁRIOS
const fecharModalUsuario = document.getElementById('fechar-modal-usuario');
const modalUsuario = document.getElementById('modal-usuario');

fecharModalUsuario.addEventListener('click', () => {
    modalUsuario.classList.remove('aberto');
});

// FECHAR MODAL DE CATEGORIAS
const fecharModalCategoria = document.getElementById('fechar-modal-categoria');
const modalCategoria = document.getElementById('modal-categoria');

fecharModalCategoria.addEventListener('click', () => {
    modalCategoria.classList.remove('aberto');
});

// FECHAR MODAL DE EDIÇÃO DE CHAMADO
const modalEditarChamado = document.getElementById('modal-editar-chamado');

const fecharModalEditarChamado = document.getElementById('fechar-modal-editar-chamado');

fecharModalEditarChamado.addEventListener('click', () => {
    modalEditarChamado.classList.remove('aberto');
});

// FECHAR AO CLICAR FORA DA JANELA
modalEditarChamado.addEventListener('click', (evento) => {
    if (evento.target === modalEditarChamado) {
        modalEditarChamado.classList.remove('aberto');
    }
});

// FECHAR AO CLICAR FORA DA JANELA
modalUsuario.addEventListener('click', (evento) => {
    if (evento.target === modalUsuario) {
        modalUsuario.classList.remove('aberto');
    }
});

modalCategoria.addEventListener('click', (evento) => {
    if (evento.target === modalCategoria) {
        modalCategoria.classList.remove('aberto');
    }
});

// MODAL DE NOVO USUÁRIO

const modalNovoUsuario = document.getElementById('modal-novo-usuario');

const btnNovoUsuario = document.getElementById('btn-novo-usuario');

const fecharModalNovoUsuario = document.getElementById('fechar-modal-novo-usuario');

// Abrir modal
btnNovoUsuario.addEventListener('click', () => {
    modalNovoUsuario.classList.add('aberto');
});

// Fechar pelo X
fecharModalNovoUsuario.addEventListener('click', () => {
    modalNovoUsuario.classList.remove('aberto');
});

// Fechar clicando fora da janela
modalNovoUsuario.addEventListener('click', (evento) => {
    if (evento.target === modalNovoUsuario) {
        modalNovoUsuario.classList.remove('aberto');
    }
});

const formCategoria = document.getElementById('form-categoria');

formCategoria.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const novaCategoria = {
        nome: document.getElementById('nome-categoria').value,
        descricao: document.getElementById('descricao-categoria').value
    };

    try {
        const resposta = await fetch('/api/categorias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novaCategoria)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao cadastrar categoria.');
        }

        document.getElementById('mensagem-categoria').textContent =
            'Categoria cadastrada com sucesso!';

        document.getElementById('mensagem-categoria').style.color = '#059669';

        formCategoria.reset();

        await carregarCategoriasTabela();
        
        await carregarCategorias();

        setTimeout(() => {
            document.getElementById('modal-categoria').classList.remove('aberto');
        }, 1000);

    } catch (erro) {
        document.getElementById('mensagem-categoria').textContent = erro.message;
        document.getElementById('mensagem-categoria').style.color = '#DC2626';
    }
});