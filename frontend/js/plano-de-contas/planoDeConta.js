document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const CAMINHO_JS = "../../js/plano-de-contas/";
    const CAMINHO_UTILS = "../../js/utils/";
    const dependencias = [
        {id: "utilAutenticacaoPlanoDeConta", src: `${CAMINHO_UTILS}autenticacao.js`},
        {id: "utilDOMPlanoDeConta", src: `${CAMINHO_UTILS}dom.js`},
        {id: "planoDeContaFormatadores", src: `${CAMINHO_JS}planoDeContaFormatadores.js`},
        {id: "planoDeContaValidacao", src: `${CAMINHO_JS}planoDeContaValidacao.js`},
        {id: "planoDeContaFormulario", src: `${CAMINHO_JS}planoDeContaFormulario.js`},
        {id: "planoDeContaApi", src: `${CAMINHO_JS}planoDeContaApi.js`}
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
                    existente.addEventListener("load", resolve, { 
                        once: true 
                    });

                    existente.addEventListener("error", () => {
                        reject(new Error(`Não foi possível carregar ${src}.`));
                        },{ 
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
            },{ 
                once: true 
            });

            script.addEventListener("error", () => {
                reject(new Error(`Não foi possível carregar ${src}.`));
            },{ 
                once: true 
            });

            document.body.appendChild(script);
        });
    }

    async function carregarModalHTML(caminho) {
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

        containerModais.innerHTML = documento.body.innerHTML;
    }

    async function carregarModalCadastro() {
        try {
            await carregarModalHTML("modalPlanoDeConta.html");

            window.DOM.carregarCSS("cssModalPlanoDeConta", "../../css/plano-de-contas/modalPlanoDeConta.css");

            await carregarScript("scriptModalPlanoDeConta", `${CAMINHO_JS}modalPlanoDeConta.js`);

            return true;
        } catch (erro) {
            console.error("Erro ao carregar a modal de cadastro/edição:", erro);

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
    const API = window.PlanoDeContaAPI;

    if (!Autenticacao || !Autenticacao.estaAutenticado()) {
        if (Autenticacao) {
            Autenticacao.redirecionarParaLogin();
        } else {
            window.location.href = "../login.html";
        }

        return;
    }

    if (!Autenticacao.validarAcessoPagina("plano-de-contas")) {
        return;
    }

    Autenticacao.sincronizarPerfil().catch(() => {});


    const botaoAdicionar = DOM.obterElemento("botaoAdicionar");
    const botaoBuscar = DOM.obterElemento("botaoBuscar");
    const campoBusca = DOM.obterElemento("campoBusca");
    const tabela = DOM.obterElemento("tabelaPlanoDeConta");

    let listaPlanosDeContas = [];

    async function carregarPlanosDeContas() {
        try {
            const dados = await API.buscarTodos();

            if (dados === null) {
                return;
            }

            if (!Array.isArray(dados)) {
                throw new Error("A API retornou um formato de dados inválido.");
            }

            listaPlanosDeContas = dados;

            renderizarTabela(listaPlanosDeContas);
        } catch (erro) {
            console.error("Erro ao carregar planos de contas:", erro);

            exibirErroCarregamento(erro.message);
        }
    }

    function renderizarTabela(planos) {
        if (!tabela) {
            return;
        }

        tabela.innerHTML = "";

        atualizarResumo(planos);

        if (!Array.isArray(planos) || planos.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="tabela-vazia"
                    >
                        Nenhum plano de contas encontrado.
                    </td>
                </tr>
            `;

            return;
        }

        planos.forEach((planoDeConta) => {
            const linha = document.createElement("tr");
            const nome = window.PlanoDeContaFormatadores.formatarNome(planoDeConta.nome);
            const descricao = window.PlanoDeContaFormatadores.formatarDescricao(planoDeConta.descricao);
            const status = window.PlanoDeContaFormatadores.formatarStatus(planoDeConta.status);

            linha.innerHTML = `
                <td>
                    ${nome}
                </td>
                <td>
                    ${descricao}
                </td>
                <td>
                    ${status}
                </td>
                <td>
                    <div class="acoesTabela">
                        <button
                            type="button"
                            class="btnAcaoTabela btnEditar"
                            data-acao="editar"
                            data-id="${planoDeConta.id}"
                            title="Editar"
                            aria-label="Editar plano de contas"
                        >
                            <img
                                src="../../assets/editarLapis.png"
                                alt="Editar"
                            >
                        </button>

                        <label
                            class="switchStatus"
                            title="${
                                planoDeConta.status? "Inativar": "Ativar"
                            }"
                        >
                            <input
                                type="checkbox"
                                data-acao="${
                                    planoDeConta.status? "inativar": "reativar"
                                }"
                                data-id="${planoDeConta.id}"
                                ${
                                    planoDeConta.status? "checked": ""
                                }
                                aria-label="${
                                    planoDeConta.status? "Inativar plano de contas": "Ativar plano de contas"
                                }"
                            >

                            <span
                                class="sliderStatus"
                            ></span>
                        </label>
                    </div>

                </td>
            `;

            tabela.appendChild(
                linha
            );
        });

    }

    function atualizarResumo(planos) {

        const registros = Array.isArray(planos)? planos: [];
        const total = registros.length;
        const ativos = registros.filter((plano) => plano.status === true).length;
        const inativos = registros.filter((plano) => plano.status === false).length;

        DOM.definirTexto(DOM.obterElemento("totalPlanosDeContas"), total);
        DOM.definirTexto(DOM.obterElemento("totalPlanosAtivos"), ativos);
        DOM.definirTexto(DOM.obterElemento("totalPlanosInativos"), inativos);
    }

    function buscarPlanoDeConta() {
        if (!campoBusca) {
            return;
        }

        const termo = campoBusca.value.toLowerCase().trim();

        if (!termo) {
            renderizarTabela(listaPlanosDeContas);

            return;
        }

        const filtrados = listaPlanosDeContas.filter(
            (plano) => {
                const nome = String(plano.nome || "").toLowerCase();
                const descricao = String(plano.descricao || "").toLowerCase();

                return (nome.includes(termo) || descricao.includes(termo));
            });
        renderizarTabela(filtrados);
    }

    function obterPlanoPorId(id) {
        return listaPlanosDeContas.find(
            (plano) => Number(plano.id) === Number(id)
        );
    }

    function editarPlanoDeConta(id) {
        const plano = obterPlanoPorId(id);

        if (!plano) {
            alert("Plano de contas não encontrado.");

            return;
        }

        if (typeof window.abrirModalEdicaoPlanoDeConta === "function") {
            window.abrirModalEdicaoPlanoDeConta(plano);

            return;
        }

        console.error("A função abrirModalEdicaoPlanoDeConta() não está disponível.");
    }

    async function inativarPlano(id) {
        const plano = obterPlanoPorId(id);

        if (!plano) {
            return;
        }

        const confirmar = confirm(`Deseja realmente inativar o plano de contas "${plano.nome}"?`);

        if (!confirmar) {
            await carregarPlanosDeContas();

            return;
        }

        try {
            const resultado = await API.inativar(id);

            if (resultado === null && !Autenticacao.estaAutenticado()) {
                return;
            }

            await carregarPlanosDeContas();
        } catch (erro) {
            console.error("Erro ao inativar plano de contas:", erro);

            alert(erro.message || "Erro ao inativar plano de contas.");

            await carregarPlanosDeContas();
        }
    }

    async function reativarPlano(id) {
        const plano = obterPlanoPorId(id);

        if (!plano) {
            return;
        }

        const confirmar = confirm(`Deseja reativar o plano de contas "${plano.nome}"?`);

        if (!confirmar) {
            await carregarPlanosDeContas();

            return;
        }

        try {
            const resultado = await API.reativar(id);

            if (resultado === null && !Autenticacao.estaAutenticado()) {
                return;
            }

            await carregarPlanosDeContas();
        } catch (erro) {
            console.error("Erro ao reativar plano de contas:", erro);

            alert(erro.message || "Erro ao reativar plano de contas.");

            await carregarPlanosDeContas();
        }
    }

    function configurarAcoesTabela() {
        if (!tabela) {
            return;
        }

        tabela.addEventListener("click", (evento) => {
            const botao = evento.target.closest("button[data-acao]");

            if (!botao) {
                return;
            }

            const acao = botao.dataset.acao;
            const id = botao.dataset.id;

            if (acao === "editar") {
                editarPlanoDeConta(id);
            }
        });

        tabela.addEventListener("change", (evento) => {
            const switchStatus = evento.target.closest("input[data-acao]");

            if (!switchStatus) {
                return;
            }
                const acao = switchStatus.dataset.acao;
                const id = switchStatus.dataset.id;

                if (acao === "inativar") {
                    inativarPlano(id);
                } else if (acao === "reativar") {
                    reativarPlano(id);
                }
            }
        );
    }

    function configurarInterface() {
        botaoAdicionar?.addEventListener("click", () => {
            if (
                typeof window.abrirModalCadastroPlanoDeConta !==
                "function" ||
                typeof window.abrirModalPlanoDeConta !==
                "function"
            ) {
                console.error("As funções da modal de Plano de Contas não estão disponíveis.");

                return;
            }
                window.abrirModalCadastroPlanoDeConta();
                window.abrirModalPlanoDeConta();
            }
        );

        window.addEventListener("planoDeContaSalvo", async () => {
            await carregarPlanosDeContas();
        });

        botaoBuscar?.addEventListener("click", buscarPlanoDeConta);
        campoBusca?.addEventListener("input", buscarPlanoDeConta);
        campoBusca?.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") {
                buscarPlanoDeConta();
            }}
        );
    }

    function exibirErroCarregamento(mensagem) {
        if (!tabela) {
            return;
        }

        tabela.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="tabela-vazia"
                >
                    Não foi possível carregar os planos de contas.
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
            console.error("A modal de cadastro/edição não pôde ser carregada.");
        }
    }

    async function inicializar() {
        await inicializarModais();
        configurarInterface();
        configurarAcoesTabela();
        await carregarPlanosDeContas();
    }

    window.editarPlanoDeConta = editarPlanoDeConta;
    window.inativarPlano = inativarPlano;
    window.reativarPlano = reativarPlano;
    await inicializar();
});