document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const CAMINHO_JS = "../../js/clientes-fornecedores/";
    const CAMINHO_UTILS = "../../js/utils/";

    const dependencias = [
        {
            id: "utilAutenticacao",
            src: `${CAMINHO_UTILS}autenticacao.js`
        },
        {
            id: "utilDOM",
            src: `${CAMINHO_UTILS}dom.js`
        },
        {
            id: "clienteFornecedorFormatadores",
            src: `${CAMINHO_JS}clienteFornecedorFormatadores.js`
        },
        {
            id: "clienteFornecedorValidacao",
            src: `${CAMINHO_JS}clienteFornecedorValidacao.js`
        },
        {
            id: "clienteFornecedorFormulario",
            src: `${CAMINHO_JS}clienteFornecedorFormulario.js`
        },
        {
            id: "clienteFornecedorApi",
            src: `${CAMINHO_JS}clienteFornecedorApi.js`
        }
    ];

    async function carregarDependencias() {
        for (const dependencia of dependencias) {
            await carregarScript(dependencia.id, dependencia.src);
        }
    }

    function carregarScript(id, src) {
        return new Promise((resolve, reject) => {
            const existente = document.getElementById(id);

            if (existente) {
                if (existente.dataset.carregado === "true") {
                    resolve();
                } else {
                    existente.addEventListener("load", resolve, { once: true });
                    existente.addEventListener(
                        "error",
                        () => reject(new Error(`Não foi possível carregar ${src}.`)),
                        { once: true }
                    );
                }

                return;
            }

            const script = document.createElement("script");
            script.id = id;
            script.src = src;
            script.async = false;

            script.addEventListener(
                "load",
                () => {
                    script.dataset.carregado = "true";
                    resolve();
                },
                { once: true }
            );

            script.addEventListener(
                "error",
                () => reject(new Error(`Não foi possível carregar ${src}.`)),
                { once: true }
            );

            document.body.appendChild(script);
        });
    }

    async function carregarModalHTML(caminho, modo = "substituir") {
        const containerModais =
            document.getElementById("containerModais");

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
            containerModais.insertAdjacentHTML(
                "beforeend",
                documento.body.innerHTML
            );
        }
    }

    async function carregarModalCadastro() {
        try {
            await carregarModalHTML(
                "modalClienteFornecedor.html",
                "substituir"
            );

            window.DOM.carregarCSS(
                "cssModalClienteFornecedor",
                "../../css/clientes-fornecedores/modalClienteFornecedor.css"
            );

            await carregarScript(
                "scriptModalClienteFornecedor",
                `${CAMINHO_JS}modalClienteFornecedor.js`
            );

            return true;
        } catch (erro) {
            console.error(
                "Erro ao carregar a modal de cadastro/edição:",
                erro
            );

            return false;
        }
    }

    async function carregarModalVisualizacao() {
        try {
            await carregarModalHTML(
                "modalVisualizarClienteFornecedor.html",
                "adicionar"
            );

            window.DOM.carregarCSS(
                "cssModalVisualizarClienteFornecedor",
                "../../css/clientes-fornecedores/modalVisualizarClienteFornecedor.css"
            );

            await carregarScript(
                "scriptModalVisualizarClienteFornecedor",
                `${CAMINHO_JS}modalVisualizarClienteFornecedor.js`
            );

            return true;
        } catch (erro) {
            console.error(
                "Erro ao carregar a modal de visualização:",
                erro
            );

            return false;
        }
    }

    await carregarDependencias();

    const Autenticacao = window.Autenticacao;
    const DOM = window.DOM;
    const API = window.ClienteFornecedorAPI;

    if (!Autenticacao.estaAutenticado()) {
        Autenticacao.redirecionarParaLogin();
        return;
    }

    if (!Autenticacao.validarAcessoPagina("clientes-fornecedores")) {
        return;
    }

    Autenticacao.sincronizarPerfil().catch(() => {});

    const usuario = Autenticacao.obterUsuario();


    const botaoAdicionar = DOM.obterElemento("botaoAdicionar");
    const botaoBuscar = DOM.obterElemento("botaoBuscar");

    let listaRegistros = [];
    let registroSelecionado = null;

    function definirRegistroSelecionado(registro) {
        registroSelecionado = registro || null;
    }

    function limparSelecao() {
        registroSelecionado = null;
    }

    async function carregarRegistros() {
        try {
            const dados = await API.buscarTodos();

            if (dados === null) {
                return;
            }

            if (!Array.isArray(dados)) {
                throw new Error(
                    "A API retornou um formato de dados inválido."
                );
            }

            listaRegistros = dados;
            renderizarTabela(listaRegistros);
        } catch (erro) {
            console.error("Erro ao carregar registros:", erro);
        }
    }

    function obterRegistroPorId(id) {
        return listaRegistros.find(
            (registro) =>
                Number(registro.id) === Number(id)
        );
    }

    function escaparHTML(valor) {
        const div = document.createElement("div");
        div.textContent = String(valor ?? "");
        return div.innerHTML;
    }

    function renderizarTabela(registros) {
        const tabela =
            DOM.obterElemento("tabelaClienteOuFornecedor");

        if (!tabela) {
            return;
        }

        tabela.innerHTML = "";

        let clientes = 0;
        let fornecedores = 0;

        registros.forEach((registro) => {
            if (registro.tipo === "cliente") {
                clientes++;
            }

            if (registro.tipo === "fornecedor") {
                fornecedores++;
            }

            const tipo =
                window.ClienteFornecedorFormatadores.formatarTipo(
                    registro.tipo
                );

            const email = registro.email || "-";
            const telefone = registro.telefone || "-";
            const status = registro.status ? "Ativo" : "Inativo";
            const id = Number(registro.id);

            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>${tipo}</td>
                <td>${escaparHTML(registro.nome ?? "-")}</td>
                <td>${escaparHTML(registro.cpf_cnpj ?? "-")}</td>
                <td>${escaparHTML(email)}</td>
                <td>${escaparHTML(telefone)}</td>
                <td>${status}</td>
                <td>
                    <div class="acoesTabela">
                        <button
                            type="button"
                            class="btnAcaoTabela btnVisualizar"
                            data-acao="visualizar"
                            data-id="${id}"
                            title="Visualizar"
                            aria-label="Visualizar registro"
                        >
                            <img
                                src="../../assets/olho.png"
                                alt="Visualizar"
                            >
                        </button>

                        <button
                            type="button"
                            class="btnAcaoTabela btnEditar"
                            data-acao="editar"
                            data-id="${id}"
                            title="Editar"
                            aria-label="Editar registro"
                        >
                            <img
                                src="../../assets/editarLapis.png"
                                alt="Editar"
                            >
                        </button>

                        <label
                            class="switchStatus"
                            title="${registro.status ? "Inativar" : "Ativar"}"
                        >
                            <input
                                type="checkbox"
                                data-acao="status"
                                data-id="${id}"
                                ${registro.status ? "checked" : ""}
                                aria-label="${
                                    registro.status
                                        ? "Inativar registro"
                                        : "Ativar registro"
                                }"
                            >
                            <span class="sliderStatus"></span>
                        </label>
                    </div>
                </td>
            `;

            tabela.appendChild(linha);
        });

        DOM.definirTexto(
            DOM.obterElemento("totalClienteOuFornecedor"),
            registros.length
        );

        DOM.definirTexto(
            DOM.obterElemento("totalClientes"),
            clientes
        );

        DOM.definirTexto(
            DOM.obterElemento("totalFornecedores"),
            fornecedores
        );
    }

    function buscarRegistro() {
        const campo = DOM.obterElemento("campoBusca");

        if (!campo) {
            return;
        }

        const termo = campo.value.toLowerCase().trim();

        if (!termo) {
            renderizarTabela(listaRegistros);
            return;
        }

        const filtrados = listaRegistros.filter((registro) => {
            const nome = String(
                registro.nome || ""
            ).toLowerCase();

            const documento = String(
                registro.cpf_cnpj || ""
            ).toLowerCase();

            return (
                nome.includes(termo) ||
                documento.includes(termo)
            );
        });

        renderizarTabela(filtrados);
    }

    function visualizarRegistro(id) {
        const registro = obterRegistroPorId(id);

        if (!registro) {
            console.error(
                "Registro não encontrado para visualização:",
                id
            );
            return;
        }

        definirRegistroSelecionado(registro);

        if (typeof window.abrirModalVisualizar === "function") {
            window.abrirModalVisualizar(registro);
            return;
        }

        console.error(
            "A função abrirModalVisualizar() não está disponível."
        );
    }

    function editarRegistro(id) {
        const registro = obterRegistroPorId(id);

        if (!registro) {
            console.error(
                "Registro não encontrado para edição:",
                id
            );
            return;
        }

        definirRegistroSelecionado(registro);

        if (
            typeof window.definirRegistroClienteFornecedorEmEdicao ===
            "function"
        ) {
            window.definirRegistroClienteFornecedorEmEdicao(registro);
        }

        if (typeof window.abrirModal === "function") {
            window.abrirModal();
            return;
        }

        console.error(
            "A função abrirModal() da modal não está disponível."
        );
    }

    async function alterarStatus(id, statusAtual) {
        try {
            const resultado =
                await API.alterarStatus(id, statusAtual);

            if (
                resultado === null &&
                !Autenticacao.estaAutenticado()
            ) {
                return;
            }

            await carregarRegistros();
        } catch (erro) {
            console.error("Erro ao alterar status:", erro);

            alert(
                erro.message ||
                "Erro ao alterar status."
            );

            await carregarRegistros();
        }
    }

    function configurarAcoesTabela() {
        const tabela =
            DOM.obterElemento("tabelaClienteOuFornecedor");

        if (!tabela) {
            return;
        }

        tabela.addEventListener("click", (evento) => {
            const botao =
                evento.target.closest("[data-acao]");

            if (!botao) {
                return;
            }

            const acao = botao.dataset.acao;
            const id = botao.dataset.id;

            if (acao === "visualizar") {
                visualizarRegistro(id);
            }

            if (acao === "editar") {
                editarRegistro(id);
            }
        });

        tabela.addEventListener("change", (evento) => {
            const caixa =
                evento.target.closest(
                    'input[data-acao="status"]'
                );

            if (!caixa) {
                return;
            }

            const id = caixa.dataset.id;
            const statusAtual = !caixa.checked;

            alterarStatus(id, statusAtual);
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

        window.addEventListener(
            "clienteFornecedorSalvo",
            async () => {
                await carregarRegistros();
            }
        );

        botaoBuscar?.addEventListener(
            "click",
            buscarRegistro
        );

        DOM.obterElemento("campoBusca")?.addEventListener(
            "keydown",
            (evento) => {
                if (evento.key === "Enter") {
                    buscarRegistro();
                }
            }
        );
    }

    async function inicializarModais() {
        const cadastroCarregado =
            await carregarModalCadastro();

        if (!cadastroCarregado) {
            console.error(
                "A modal de cadastro/edição não pôde ser carregada."
            );
        }

        const visualizacaoCarregada =
            await carregarModalVisualizacao();

        if (!visualizacaoCarregada) {
            console.error(
                "A modal de visualização não pôde ser carregada."
            );
        }
    }

    async function inicializar() {
        await inicializarModais();

        configurarInterface();
        configurarAcoesTabela();

        await carregarRegistros();
    }

    window.visualizarRegistro = visualizarRegistro;
    window.editarRegistro = editarRegistro;
    window.alterarStatus = alterarStatus;

    await inicializar();
});