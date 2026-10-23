document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const CAMINHO_JS = "../../js/dashboard/";
    const CAMINHO_JS_CONTAS = "../../js/contas/";
    const CAMINHO_UTILS = "../../js/utils/";

    const NOMES_MESES = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    const ANOS_ANTERIORES = 5;
    const ANOS_POSTERIORES = 3;

    const dependencias = [
        {
            id: "utilAutenticacaoDashboard", src: `${CAMINHO_UTILS}autenticacao.js`
        },
        {
            id: "utilDOMDashboard", src: `${CAMINHO_UTILS}dom.js`
        },
        {
            id: "contaFormatadoresDashboard", src: `${CAMINHO_JS_CONTAS}contaFormatadores.js`
        },
        {
            id: "dashboardApi", src: `${CAMINHO_JS}dashboardApi.js`
        },
        {
            id: "dashboardGrafico", src: `${CAMINHO_JS}dashboardGrafico.js`
        },
        {
            id: "dashboardRender", src: `${CAMINHO_JS}dashboardRender.js`
        }
    ];

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
            }, {
                once: true
            });

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

    try {
        await carregarDependencias();
    } catch (erro) {
        console.error("Erro ao carregar dependências:", erro);

        alert("Não foi possível carregar os recursos da página.");

        return;
    }

    const Autenticacao = window.Autenticacao;
    const DOM = window.DOM;
    const API = window.DashboardAPI;
    const Grafico = window.DashboardGrafico;
    const Render = window.DashboardRender;

    if (!Autenticacao || !Autenticacao.estaAutenticado() || !Autenticacao.obterUsuario()) {
        Autenticacao?.redirecionarParaLogin();
        return;
    }

    if (!Autenticacao.validarAcessoPagina("dashboard")) {
        return;
    }

    Autenticacao.sincronizarPerfil().catch(() => {});

    const campoMes = DOM.obterElemento("filtroMes");
    const campoAno = DOM.obterElemento("filtroAno");
    const campoTipo = DOM.obterElemento("filtroTipo");
    const mensagem = DOM.obterElemento("mensagem");
    const listaAlertas = DOM.obterElemento("listaAlertas");
    const areaGrafico = DOM.obterElemento("areaGrafico");
    const legendaGrafico = DOM.obterElemento("legendaGrafico");
    const tituloGrafico = DOM.obterElemento("tituloGrafico");
    const tabelaVencimentos = DOM.obterElemento("tabelaVencimentos");

    let dadosAtuais = null;
    let requisicaoAtual = 0;

    function nomePeriodo(mes, ano) {
        return `${NOMES_MESES[mes - 1]} de ${ano}`;
    }

    function exibirMensagem(texto, erro = false) {
        if (!mensagem) {
            return;
        }

        mensagem.textContent = texto || "";
        mensagem.className = erro ? "mensagem erro" : "mensagem";
    }

    function definirFiltrosHabilitados(habilitados) {
        [campoMes, campoAno, campoTipo].forEach((campo) => {
            campo.disabled = !habilitados;
        });
    }

    function adicionarOpcao(campo, valor, texto) {
        const option = document.createElement("option");

        option.value = String(valor);
        option.textContent = texto;

        campo.appendChild(option);
    }

    function preencherFiltrosPeriodo() {
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();

        NOMES_MESES.forEach((nome, indice) => {
            adicionarOpcao(campoMes, indice + 1, nome);
        });

        for (let ano = anoAtual - ANOS_ANTERIORES; ano <= anoAtual + ANOS_POSTERIORES; ano++) {
            adicionarOpcao(campoAno, ano, String(ano));
        }

        campoMes.value = String(hoje.getMonth() + 1);
        campoAno.value = String(anoAtual);
    }

    function obterDiaDestacado(periodo) {
        const prefixo = `${periodo.ano}-${String(periodo.mes).padStart(2, "0")}-`;

        if (!periodo.hoje || !periodo.hoje.startsWith(prefixo)) {
            return null;
        }

        return Number(periodo.hoje.substring(8, 10));
    }

    function renderizarGraficoEListagem() {
        if (!dadosAtuais) {
            return;
        }

        const tipo = campoTipo.value;
        const periodo = dadosAtuais.periodo;

        tituloGrafico.textContent = `Movimentação de ${nomePeriodo(periodo.mes, periodo.ano)}`;

        Grafico.renderizar(areaGrafico, legendaGrafico, dadosAtuais.grafico, {
            tipo,
            mes: periodo.mes,
            diaDestacado: obterDiaDestacado(periodo)
        });

        Render.renderizarVencimentos(tabelaVencimentos, dadosAtuais.proximosVencimentos, tipo);
    }

    function exibirCarregando() {
        Render.limparResumo();
        Render.exibirCarregandoVencimentos(tabelaVencimentos);

        Grafico.atualizarLegenda(legendaGrafico, false, false);
        Grafico.exibirMensagem(areaGrafico, "Carregando...");

        exibirMensagem("Carregando dados...");
    }

    function exibirErro(erro) {
        const texto = erro?.message || "Não foi possível carregar o dashboard.";

        dadosAtuais = null;

        Render.limparResumo();
        Render.exibirErroAlertas(listaAlertas);
        Render.exibirErroVencimentos(tabelaVencimentos, texto);

        Grafico.atualizarLegenda(legendaGrafico, false, false);
        Grafico.exibirMensagem(areaGrafico, "Não foi possível carregar o gráfico.");

        exibirMensagem(texto, true);
    }

    async function carregarDashboard() {
        const numeroRequisicao = ++requisicaoAtual;
        const mes = Number(campoMes.value);
        const ano = Number(campoAno.value);

        definirFiltrosHabilitados(false);
        exibirCarregando();

        try {
            const dados = await API.buscar(mes, ano);

            if (numeroRequisicao !== requisicaoAtual) {
                return;
            }

            if (dados === null) {
                return;
            }

            dadosAtuais = dados;

            Render.preencherResumo(dados);
            Render.renderizarAlertas(listaAlertas, dados, nomePeriodo(dados.periodo.mes, dados.periodo.ano));
            renderizarGraficoEListagem();

            exibirMensagem("");
        } catch (erro) {
            if (numeroRequisicao !== requisicaoAtual) {
                return;
            }

            console.error("Erro ao carregar dashboard:", erro);

            exibirErro(erro instanceof TypeError ? new Error("Erro de conexão com a API.") : erro);
        } finally {
            if (numeroRequisicao === requisicaoAtual) {
                definirFiltrosHabilitados(true);
            }
        }
    }

    function configurarInterface() {


        const linkSair = document.querySelector('a[href="../autenticacao/login.html"]');

        linkSair?.addEventListener("click", (evento) => {
            evento.preventDefault();
            Autenticacao.redirecionarParaLogin();
        });

        campoMes.addEventListener("change", carregarDashboard);
        campoAno.addEventListener("change", carregarDashboard);
        campoTipo.addEventListener("change", renderizarGraficoEListagem);
    }

    preencherFiltrosPeriodo();
    configurarInterface();

    await carregarDashboard();
});
