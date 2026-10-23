(function () {
    "use strict";

    const DOM = window.DOM;
    const Formulario = window.PlanoDeContaFormulario;
    const Validacao = window.PlanoDeContaValidacao;
    const API = window.PlanoDeContaAPI;
    const Autenticacao = window.Autenticacao;

    const sobreposicaoModal = DOM.obterElemento("modalOverlay");
    const botaoFechar = DOM.obterElemento("botaoFecharModal");
    const botaoCancelar = DOM.obterElemento("botaoCancelarModal");
    const botaoSalvar = DOM.obterElemento("botaoSalvar");
    const tituloModal = DOM.obterElemento("modalTitulo");

    let planoDeContaEmEdicao = null;

    function definirPlanoDeContaEmEdicao(plano) {
        planoDeContaEmEdicao = plano || null;
    }

    function atualizarTituloModal() {
        if (!tituloModal) {
            return;
        }

        if (!planoDeContaEmEdicao) {
            tituloModal.textContent = "Adicionar novo plano de contas";

            return;
        }

        tituloModal.textContent = "Editar plano de contas";
    }

    function atualizarBotaoSalvar() {
        if (!botaoSalvar) {
            return;
        }

        botaoSalvar.textContent = planoDeContaEmEdicao? "Atualizar": "Salvar";
    }

    function abrirModal() {
        if (!sobreposicaoModal) {
            return;
        }

        if (planoDeContaEmEdicao) {
            Formulario.preencherDados(planoDeContaEmEdicao);
        }

        atualizarTituloModal();
        atualizarBotaoSalvar();

        sobreposicaoModal.classList.add("active");
    }

    function fecharModal() {
        sobreposicaoModal?.classList.remove("active");

        planoDeContaEmEdicao = null;

        Formulario.limparFormulario();

        atualizarTituloModal();
        atualizarBotaoSalvar();
    }

    function prepararNovoCadastro() {
        planoDeContaEmEdicao = null;

        Formulario.limparFormulario();

        atualizarTituloModal();
        atualizarBotaoSalvar();
    }

    function prepararEdicao(plano) {
        if (!plano) {
            console.error("Nenhum plano de contas foi informado para edição.");

            return;
        }

        planoDeContaEmEdicao = plano;

        Formulario.preencherDados(plano);

        atualizarTituloModal();
        atualizarBotaoSalvar();

        abrirModal();
    }

    async function salvar() {
        if (!Validacao.validarFormulario()) {
            return;
        }

        if (!Autenticacao || !Autenticacao.obterToken()) {
            alert("Sua sessão expirou. Faça login novamente.");

            Autenticacao?.redirecionarParaLogin();

            return;
        }

        const dados = Formulario.obterDados();
        const estaEditando = Boolean(planoDeContaEmEdicao?.id);

        if (botaoSalvar) {
            botaoSalvar.disabled = true;
            botaoSalvar.textContent = estaEditando? "Atualizando...": "Salvando...";
        }

        try {
            const resultado = estaEditando? await API.atualizar(planoDeContaEmEdicao.id, dados): await API.cadastrar(dados);

            if (resultado === null && !Autenticacao.estaAutenticado()) {
                return;
            }

            alert(estaEditando? "Plano de contas atualizado com sucesso!": "Plano de contas cadastrado com sucesso!");

            window.dispatchEvent(new CustomEvent("planoDeContaSalvo"));

            fecharModal();
        } catch (erro) {
            console.error("Erro ao salvar plano de contas:", erro);

            alert(erro.message || "Erro ao salvar plano de contas.");
        } finally {
            if (botaoSalvar) {
                botaoSalvar.disabled = false;
            }

            atualizarBotaoSalvar();
        }
    }

    function inicializarEventos() {
        botaoFechar?.addEventListener("click", fecharModal);
        botaoCancelar?.addEventListener("click", fecharModal);

        sobreposicaoModal?.addEventListener("click", (evento) => {

            if (evento.target === sobreposicaoModal) {
                fecharModal();
            }
        });

        botaoSalvar?.addEventListener("click", salvar);

        const nome = DOM.obterElemento("nome");

        nome?.addEventListener("input", () => {
            Formulario.removerErro(
                "nome"
            );
        });

        const descricao = DOM.obterElemento("descricao");

        descricao?.addEventListener("input", () => {
            Formulario.removerErro("descricao");
        });
    }

    function inicializar() {
        if (!sobreposicaoModal) {
            console.error("Modal #modalOverlay não encontrada.");

            return;
        }

        inicializarEventos();
        atualizarTituloModal();
        atualizarBotaoSalvar();
    }

    window.abrirModalPlanoDeConta = abrirModal;
    window.fecharModalPlanoDeConta = fecharModal;
    window.abrirModalCadastroPlanoDeConta = prepararNovoCadastro;
    window.abrirModalEdicaoPlanoDeConta = prepararEdicao;
    window.definirPlanoDeContaEmEdicao = definirPlanoDeContaEmEdicao;
    window.salvarPlanoDeConta = salvar;

    inicializar();
})();