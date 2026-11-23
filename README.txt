PROJETO INTEGRADOR - SOLVIX Sistema de Gestão de Chamados de TI
Frontend + Backend + SQLite

1.  SOBRE O PROJETO O SOLVIX é um sistema web de gerenciamento de
    chamados de Tecnologia da Informação (TI). Seu objetivo é
    centralizar solicitações de suporte, permitindo registrar chamados,
    acompanhar seus status, organizar categorias e gerenciar usuários.

2.  FUNCIONALIDADES IMPLEMENTADAS

-   Dashboard com indicadores gerais.
-   Gráficos de chamados por categoria, prioridade e status.
-   Cadastro e consulta de chamados.
-   Pesquisa por número, título ou solicitante.
-   Filtros por status, prioridade e categoria.
-   Visualização dos detalhes e edição de chamados.
-   Atualização do status dos chamados.
-   Cadastro, consulta, edição e exclusão de usuários.
-   Cadastro, consulta, edição e exclusão de categorias.
-   Integração entre frontend, backend e banco de dados.

3.  TECNOLOGIAS UTILIZADAS Frontend: HTML5, CSS3 e JavaScript. Backend:
    Node.js e Express. Banco de dados: SQLite e better-sqlite3.
    Biblioteca de gráficos: Chart.js.

4.  REQUISITOS PARA EXECUÇÃO

-   Node.js e npm instalados.
-   Navegador atualizado, como Google Chrome ou Microsoft Edge.

5.  COMO EXECUTAR O SISTEMA
6.  Abra o terminal na pasta principal do projeto SOLVIX.
7.  Instale as dependências com o comando: npm install
8.  Inicie o servidor com o comando: npm start
9.  Abra o navegador e acesse: http://localhost:3000

O banco de dados SQLite e suas tabelas são inicializados automaticamente
pelo sistema quando a aplicação é executada.

6.  ESTRUTURA DE PASTAS SOLVIX/ public/ css/ style.css js/ chamados.js
    assets/ index.html database/ conexao.js banco.db app.js package.json
    package-lock.json popular-chamados.js README.txt

A pasta node_modules é criada automaticamente pelo npm durante a
instalação das dependências.

7.  BANCO DE DADOS O sistema utiliza SQLite. As principais tabelas são:

-   usuarios: armazena os usuários cadastrados.
-   categorias: armazena as categorias dos chamados.
-   chamados: armazena título, descrição, prioridade, status, data de
    abertura, solicitante e categoria.

A estrutura das tabelas e as categorias iniciais são configuradas em
database/conexao.js.

8.  OBSERVAÇÕES

-   O sistema é executado localmente por meio do servidor Node.js.
-   O arquivo database/banco.db armazena os dados cadastrados durante a
    utilização.
-   O arquivo popular-chamados.js é um script auxiliar para inserir
    dados de demonstração. Execute-o somente quando desejar adicionar
    novos registros.
-   Para preservar os dados existentes, não exclua o arquivo
    database/banco.db.

FIM