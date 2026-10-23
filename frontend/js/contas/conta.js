document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const CAMINHO_JS = "../../js/contas/";
    const CAMINHO_UTILS = "../../js/utils/";
    
    const dependencias = [
        {
            id: "utilAutenticacaoConta", src: `${CAMINHO_UTILS}autenticacao.js`
        },
        {
            id: "utilDOMConta", src: `${CAMINHO_UTILS}dom.js`
        },
        {
            id: "contaFormatadores", src: `${CAMINHO_JS}contaFormatadores.js`
        },
        {
            id: "contaValidacao", src: `${CAMINHO_JS}contaValidacao.js`
        },
        {
            id: "contaFormulario", src: `${CAMINHO_JS}contaFormulario.js`
        },
        {
            id: "contaApi", src: `${CAMINHO_JS}contaApi.js`
        }
    ];

    function carregarScript(id, src) {

        return new Promise((resolve, reject) => {
            const existente = document.getElementById(id);

            if (existente) {
                if (existente.dataset.carregado === "true") {
                    resolve();
                } else {
                    existente.addEventListener("load", resolve,{
                        once: true
                    });

                    existente.addEventListener("error", () =>
                        reject(new Error(`Não foi possível carregar ${src}.`)), {
                            once: true
                        }
                    );
                }

                return;
            }

            const script = document.createElement("script");

            script.id = id;
            script.src = src;
            script.async = false;

            script.addEventListener("load", () => {
                script.dataset.carregado = "true";
                    resolve();
                },
                {
                    once: true
                }
            );

            script.addEventListener("error", () => reject(new Error(`Não foi possível carregar ${src}.`)), {
                once: true
            });

            document.body.appendChild(script);
        });
        
    }

    async function carregarDependencias() {
        for (const dependencia of dependencias) {
            await carregarScript(dependencia.id, dependencia.src);
        }
    }

    async function carregarModalHTML(caminho, modo = "substituir") {
        const containerModais = document.getElementById("containerModais");

        if (!containerModais) {
            throw new Error("Elemento #containerModais não encontrado.");
        }

        const resposta = await fetch(caminho);

        if (!resposta.ok) {
            throw new Error(`Não foi possível carregar ${caminho}.`);
        }

        const html = await resposta.text();
        const parser = new DOMParser();
        const documento = parser.parseFromString(html, "text/html");

        if (modo === "substituir") {
            containerModais.innerHTML = documento.body.innerHTML;
        } else {
            containerModais.insertAdjacentHTML("beforeend", documento.body.innerHTML);
        }
    }

    async function carregarModalCadastro() {
        try {
            await carregarModalHTML("modalConta.html", "substituir");

            if (window.DOM && typeof window.DOM.carregarCSS === "function") {
                window.DOM.carregarCSS("cssModalConta", "../../css/contas/modalConta.css");
            }

            await carregarScript("scriptModalConta", `${CAMINHO_JS}modalConta.js`);

            return true;
        } catch (erro) {
            console.error("Erro ao carregar a modal de cadastro/edição:", erro);

            return false;
        }
    }

    async function carregarModalVisualizacao() {
        try {
            await carregarModalHTML("modalVisualizarConta.html", "adicionar");

            if (window.DOM && typeof window.DOM.carregarCSS === "function") {
                window.DOM.carregarCSS("cssModalVisualizarConta", "../../css/contas/modalVisualizarConta.css");
            }

            await carregarScript("scriptModalVisualizarConta", `${CAMINHO_JS}modalVisualizarConta.js`);

            return true;
        } catch (erro) {
            console.error("Erro ao carregar a modal de visualização:", erro);

            return false;
        }
    }

    try {
        await carregarDependencias();
    } catch (erro) {
        console.error("Erro ao carregar dependências:", erro);

        alert("Não foi possível carregar os recursos da página.");

        return;
    }

    const Autenticacao = window.Autenticacao;
    const DOM = window.DOM;
    const API = window.ContaAPI;

    if (!Autenticacao || !Autenticacao.estaAutenticado()) {
        if (Autenticacao) {
            Autenticacao.redirecionarParaLogin();
        } else {
            window.location.href = "../login.html";
        }

        return;
    }

    const usuario = Autenticacao.obterUsuario();

    if (!usuario) {
        Autenticacao.redirecionarParaLogin();
        return;
    }

    if (!Autenticacao.validarAcessoPagina("contas")) {
        return;
    }

    Autenticacao.sincronizarPerfil().catch(() => {});


    const botaoAdicionar = DOM.obterElemento("botaoAdicionar");
    const botaoBuscar = DOM.obterElemento("botaoBuscar");
    const campoBusca = DOM.obterElemento("campoBusca");
    const tabela = DOM.obterElemento("tabelaContas");

    let listaContas = [];
    let contaSelecionada = null;

    function definirContaSelecionada(conta) {
        contaSelecionada = conta || null;
    }

    function limparSelecao() {
        contaSelecionada = null;
    }

    function contaFinalizada(conta) {
        return (conta.status === "pago" || conta.status === "recebido");
    }

    function podeEditar(conta) {
        return !contaFinalizada(conta);
    }

    function podeExcluir(conta) {
        return !contaFinalizada(conta);
    }

    function podePagar(conta) {
        return (conta.tipo === "despesa" && (conta.status === "aberto" || conta.status === "vencido"));
    }

    function podeReceber(conta) {
        return (conta.tipo === "receita" && (conta.status === "aberto" || conta.status === "vencido"));
    }

    async function carregarContas() {
        try {
            const dados = await API.buscarTodos();

            if (dados === null) {
                return;
            }

            if (!Array.isArray(dados)) {
                throw new Error("A API retornou um formato de dados inválido.");
            }

            listaContas = dados;

            renderizarTabela(listaContas);
        } catch (erro) {
            console.error("Erro ao carregar contas:", erro);
            exibirErroCarregamento(erro.message);
        }
    }

    function obterContaPorId(id) {
        return listaContas.find((conta) => Number(conta.id) === Number(id));
    }

    function escaparHTML(valor) {
        const div = document.createElement("div");

        div.textContent = String(valor ?? "");

        return div.innerHTML;
    }

    function obterNomeClienteFornecedor(conta) {
        if (conta.clienteOuFornecedor) {
            return (
                conta.clienteOuFornecedor.nome ||
                conta.clienteOuFornecedor.razao_social ||
                conta.clienteOuFornecedor.nomeFantasia ||
                "-"
            );
        }

        if (conta.cliente_ou_fornecedor) {
            return (
                conta.cliente_ou_fornecedor.nome || 
                conta.cliente_ou_fornecedor.razao_social ||
                conta.cliente_ou_fornecedor.nomeFantasia ||
                "-"
            );
        }

        return "-";
    }

    function obterNomePlanoDeConta(conta) {
        if (conta.planoDeConta) {
            return (conta.planoDeConta.nome || "-");
        }

        if (conta.plano_de_conta) {
            return (conta.plano_de_conta.nome || "-");
        }

        return "-";
    }

    function obterNomeUsuario(conta) {
        if (conta.usuario) {
            return (conta.usuario.nome || conta.usuario.email || "-");
        }

        return "-";
    }

    function gerarAcoesConta(conta, id) {
        let acoes = "";

        acoes += `
            <button
                type="button"
                class="btnAcaoTabela btnVisualizar"
                data-acao="visualizar"
                data-id="${id}"
                title="Visualizar"
                aria-label="Visualizar conta"
            >
                <img src="../../assets/olho.png" alt="Visualizar">
            </button>
        `;

        if (contaFinalizada(conta)) {
            return acoes;
        }

        if (podeEditar(conta)) {
            acoes += `
                <button
                    type="button"
                    class="btnAcaoTabela btnEditar"
                    data-acao="editar"
                    data-id="${id}"
                    title="Editar"
                    aria-label="Editar conta"
                >
                    <img src="../../assets/editarLapis.png" alt="Editar">
                </button>
            `;
        }

        if (podePagar(conta)) {
            acoes += `
                <button
                    type="button"
                    class="btnAcaoTabela btnPagar"
                    data-acao="pagar"
                    data-id="${id}"
                    title="Marcar como paga"
                    aria-label="Marcar despesa como paga"
                >
                    <img src="../../assets/checkbox.png" alt="Pagar">
                </button>
            `;
        }

        if (podeReceber(conta)) {
            acoes += `
                <button
                    type="button"
                    class="btnAcaoTabela btnReceber"
                    data-acao="receber"
                    data-id="${id}"
                    title="Marcar como recebida"
                    aria-label="Marcar receita como recebida"
                >
                    <img src="../../assets/checkbox.png" alt="Receber">
                </button>
            `;
        }

        if (podeExcluir(conta)) {
            acoes += `
                <button
                    type="button"
                    class="btnAcaoTabela btnExcluir"
                    data-acao="excluir"
                    data-id="${id}"
                    title="Excluir"
                    aria-label="Excluir conta"
                >
                    <img src="../../assets/excluir.png" alt="Excluir">
                </button>
            `;
        }

        return acoes;
    }

    function renderizarTabela(contas) {
        if (!tabela) {
            return;
        }

        tabela.innerHTML = "";

        atualizarResumo(contas);

        if (!Array.isArray(contas) || contas.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="8" class="tabela-vazia">
                        Nenhuma conta encontrada.
                    </td>
                </tr>
            `;

            return;
        }

        contas.forEach((conta) => {
            const linha = document.createElement("tr");
            const formatadores = window.ContaFormatadores;
            const tipo = formatadores.formatarTipo(conta.tipo);
            const descricao = formatadores.formatarDescricao(conta.descricao);
            const valor = formatadores.formatarValor(conta.valor);
            const status = formatadores.formatarStatus(conta.status);
            const dataVencimento = formatadores.formatarData(conta.data_vencimento);
            const clienteFornecedor = obterNomeClienteFornecedor(conta);
            const planoDeConta = obterNomePlanoDeConta(conta);
            const id = Number(conta.id);
            const acoes = gerarAcoesConta(conta, id);

            linha.innerHTML = `
                <td>
                    ${escaparHTML(tipo)}
                </td>
                <td>
                    ${escaparHTML(descricao)}
                </td>
                <td>
                    ${escaparHTML(valor)}
                </td>
                <td>
                    ${escaparHTML(clienteFornecedor)}
                </td>
                <td>
                    ${escaparHTML(planoDeConta)}
                </td>
                <td>
                    ${escaparHTML(dataVencimento)}
                </td>
                <td>
                    ${escaparHTML(status)}
                </td>
                <td>
                    <div class="acoesTabela">
                        ${acoes}
                    </div>
                </td>
            `;
                tabela.appendChild(
                    linha
                );
        });

    }

    function atualizarResumo(contas) {
        const total = contas.length;
        const receitas = contas.filter((conta) => conta.tipo === "receita").length;
        const despesas = contas.filter((conta) => conta.tipo === "despesa").length;
        const abertas = contas.filter((conta) => conta.status === "aberto").length;

        DOM.definirTexto(DOM.obterElemento("totalContas"), total);
        DOM.definirTexto(DOM.obterElemento("totalReceitas"),receitas);
        DOM.definirTexto(DOM.obterElemento("totalDespesas"), despesas);
        DOM.definirTexto(DOM.obterElemento("totalContasAbertas"), abertas);
    }

    function buscarConta() {
        const termo = campoBusca?.value.toLowerCase().trim() || "";

        if (!termo) {
            renderizarTabela(listaContas);

            return;
        }

        const filtrados =listaContas.filter((conta) => {
            const descricao = String(conta.descricao || "").toLowerCase();
            const tipo = String(conta.tipo || "").toLowerCase();
            const status = String(conta.status || "").toLowerCase();
            const clienteFornecedor = obterNomeClienteFornecedor(conta).toLowerCase();
            const planoDeConta =obterNomePlanoDeConta(conta).toLowerCase();

            return (
                descricao.includes(termo) ||
                tipo.includes(termo) ||
                status.includes(termo) ||
                clienteFornecedor.includes(termo) ||
                planoDeConta.includes(termo)
            );
        });


        renderizarTabela(filtrados);

    }

    function visualizarConta(id) {
        const conta = obterContaPorId(id);

        if (!conta) {
            console.error("Conta não encontrada para visualização:", id);

            return;

        }

        definirContaSelecionada(conta);

        if (typeof window.abrirModalVisualizar === "function") {
            window.abrirModalVisualizar(conta);

            return;
        }

        console.error("A função abrirModalVisualizar() não está disponível.");
    }

    function editarConta(id) {
        const conta = obterContaPorId(id);

        if (!conta) {
            console.error("Conta não encontrada para edição:", id);

            return;
        }

        if (!podeEditar(conta)) {
            alert("Contas pagas ou recebidas não podem ser editadas.");

            return;
        }

        definirContaSelecionada(conta);

        if (typeof window.definirContaEmEdicao === "function") {
            window.definirContaEmEdicao(
                conta
            );

        }

        if (typeof window.abrirModal === "function") {
            window.abrirModal();

            return;
        }

        console.error("A função abrirModal() da modal de Conta não está disponível.");
    }

    async function pagarConta(id) {
        const conta = obterContaPorId(id);

        if (!conta) {
            return;
        }

        if (!podePagar(conta)) {
            alert("Essa conta não pode ser marcada como paga.");

            return;
        }

        const confirmar = confirm(`Deseja marcar a despesa "${conta.descricao}" como paga?`);

        if (!confirmar) {
            return;
        }

        try {
            const resultado = await API.pagar(id);

            if (resultado === null && !Autenticacao.estaAutenticado()) {
                return;
            }

            if (resultado === null) {
                return;
            }
            alert("Despesa marcada como paga com sucesso!");

            await carregarContas();

        } catch (erro) {
            console.error("Erro ao marcar despesa como paga:", erro);

            alert(erro.message || "Não foi possível marcar a despesa como paga.");

            await carregarContas();
        }
    }

    async function receberConta(id) {
        const conta = obterContaPorId(id);

        if (!conta) {
            return;
        }

        if (!podeReceber(conta)) {
            alert("Essa conta não pode ser marcada como recebida.");

            return;
        }

        const confirmar = confirm(`Deseja marcar a receita "${conta.descricao}" como recebida?`);

        if (!confirmar) {
            return;
        }

        try {
            const resultado = await API.receber(id);

            if (resultado === null && !Autenticacao.estaAutenticado()) {
                return;
            }

            if (resultado === null) {
                return;
            }

            alert("Receita marcada como recebida com sucesso!");

            await carregarContas();
        } catch (erro) {
            console.error("Erro ao marcar receita como recebida:", erro);

            alert(erro.message || "Não foi possível marcar a receita como recebida.");

            await carregarContas();

        }

    }

    async function excluirConta(id) {
        const conta = obterContaPorId(id);

        if (!conta) {
            return;
        }

        if (!podeExcluir(conta)) {
            alert("Contas pagas ou recebidas não podem ser excluídas.");

            return;
        }

        const confirmar = confirm(`Deseja realmente excluir a conta "${conta.descricao}"?`);

        if (!confirmar) {
            return;
        }

        try {
            const resultado = await API.excluir(id);

            if (resultado === null && !Autenticacao.estaAutenticado()) {
                return;
            }

            if (resultado === null) {
                return;
            }

            alert("Conta excluída com sucesso!");

            await carregarContas();
        } catch (erro) {
            console.error("Erro ao excluir conta:", erro);

            alert(erro.message || "Não foi possível excluir a conta.");

            await carregarContas();
        }
    }

    function configurarAcoesTabela() {
        if (!tabela) {
            return;
        }

        tabela.addEventListener("click", (evento) => {
            const botao = evento.target.closest("[data-acao]");

            if (!botao) {
                return;
            }

            const acao = botao.dataset.acao;
            const id = botao.dataset.id;

            switch (acao) {
                case "visualizar": visualizarConta(id);
                    break;

                case "editar": editarConta(id);
                    break;

                case "pagar": pagarConta(id);
                    break;

                case "receber": receberConta(id);
                    break;

                case "excluir": excluirConta(id);
                    break;
            }
        });

    }

    function configurarInterface() {
        botaoAdicionar?.addEventListener("click", () => {
            limparSelecao();

            if (typeof window.limparModal === "function") {
                window.limparModal();
            }

            if (typeof window.abrirModal === "function") {
                window.abrirModal();
            }

        });

        window.addEventListener("contaSalva", async () => {
            await carregarContas();
        });

        botaoBuscar?.addEventListener("click", buscarConta);

        campoBusca?.addEventListener("input", buscarConta);
        campoBusca?.addEventListener("keydown",(evento) => {
            if (evento.key === "Enter") {
                buscarConta();
            }
        });}

    function exibirErroCarregamento(mensagem) {
        if (!tabela) {
            return;
        }

        tabela.innerHTML = `
            <tr>
                <td colspan="8" class="tabela-vazia">
                    Não foi possível carregar as contas.

                    <br>

                    ${formatarMensagemErro(mensagem)}
                </td>
            </tr>
        `;
    }

    function formatarMensagemErro(mensagem) {
        if (!mensagem) {
            return "";
        }

        return String(mensagem)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    async function inicializarModais() {
        const cadastroCarregado = await carregarModalCadastro();

        if (!cadastroCarregado) {
            console.error("A modal de cadastro/edição de Conta não pôde ser carregada.");
        }

        const visualizacaoCarregada = await carregarModalVisualizacao();

        if (!visualizacaoCarregada) {
            console.error("A modal de visualização de Conta não pôde ser carregada.");
        }
    }

    async function inicializar() {
        await inicializarModais();

        configurarInterface();
        configurarAcoesTabela();

        await carregarContas();

    }

    window.visualizarConta = visualizarConta;
    window.editarConta = editarConta;
    window.pagarConta = pagarConta;
    window.receberConta = receberConta;
    window.excluirConta = excluirConta;

    await inicializar();
});