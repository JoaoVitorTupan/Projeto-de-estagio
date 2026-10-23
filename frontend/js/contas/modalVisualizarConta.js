(function () {
    "use strict";

    const DOM = window.DOM;
    const Formatadores =window.ContaFormatadores;
    const sobreposicaoModal = DOM.obterElemento("sobreposicaoModalVisualizacao");
    const modal = DOM.obterElemento("modalVisualizacao");
    const botaoFechar = DOM.obterElemento("botaoFecharModalVisualizacao");
    const botaoCancelar = DOM.obterElemento("botaoCancelarModalVisualizacao");

    const campos = {
        tipo: DOM.obterElemento("tipoVisualizacao"),
        descricao: DOM.obterElemento("descricaoVisualizacao"),
        valor: DOM.obterElemento("valorVisualizacao"),
        status: DOM.obterElemento("statusVisualizacao"),
        dataVencimento: DOM.obterElemento("dataVencimentoVisualizacao"),
        clienteOuFornecedor: DOM.obterElemento("clienteOuFornecedorVisualizacao"),
        planoDeConta: DOM.obterElemento("planoDeContaVisualizacao"),
        usuario: DOM.obterElemento("usuarioVisualizacao")
    };

    function obterNomeClienteOuFornecedor(conta) {
        if (conta?.clienteOuFornecedor) {
            return (
                conta.clienteOuFornecedor.nome ||
                conta.clienteOuFornecedor.razao_social ||
                "-"
            );
        }

        if (conta?.cliente_ou_fornecedor) {
            return (
                conta.cliente_ou_fornecedor.nome ||
                conta.cliente_ou_fornecedor.razao_social ||
                "-"
            );
        }

        return "-";
    }

    function obterNomePlanoDeConta(conta) {
        if (conta?.planoDeConta) {
            return (
                conta.planoDeConta.nome ||
                conta.planoDeConta.razao_social ||
                "-"
            );
        }

        if (conta?.plano_de_conta) {
            return (
                conta.plano_de_conta.nome ||
                conta.plano_de_conta.razao_social ||
                "-"
            );
        }

        return "-";
    }

    function obterNomeUsuario(conta) {
        if (conta?.usuario) {
            return (
                conta.usuario.nome ||
                conta.usuario.username ||
                conta.usuario.email ||
                "-"
            );
        }

        if (conta?.usuario_cadastro) {
            return (
                conta.usuario_cadastro.nome ||
                conta.usuario_cadastro.username ||
                conta.usuario_cadastro.email ||
                "-"
            );
        }

        return "-";
    }

    function preencherModal(conta) {
        if (!conta) {
            console.error("Nenhuma conta foi informada para preencher a modal.");

            return;
        }

        if (!Formatadores) {
            console.error("ContaFormatadores não foi encontrado.");

            return;
        }

        DOM.definirTexto(
            campos.tipo,
            Formatadores.formatarTipo
                ? Formatadores.formatarTipo(conta.tipo)
                : conta.tipo || "-"
        );

        DOM.definirTexto(
            campos.descricao,
            Formatadores.formatarDescricao
                ? Formatadores.formatarDescricao(
                    conta.descricao
                )
                : conta.descricao || "-"
        );

        DOM.definirTexto(
            campos.valor,
            Formatadores.formatarValor
                ? Formatadores.formatarValor(
                    conta.valor
                )
                : conta.valor || "-"
        );

        DOM.definirTexto(
            campos.status,
            Formatadores.formatarStatus
                ? Formatadores.formatarStatus(
                    conta.status
                )
                : conta.status || "-"
        );

        DOM.definirTexto(
            campos.dataVencimento,
            Formatadores.formatarData
                ? Formatadores.formatarData(
                    conta.data_vencimento
                )
                : conta.data_vencimento || "-"
        );

        DOM.definirTexto(campos.clienteOuFornecedor, obterNomeClienteOuFornecedor(conta));
        DOM.definirTexto(campos.planoDeConta, obterNomePlanoDeConta(conta));
        DOM.definirTexto(campos.usuario, obterNomeUsuario(conta));
    }

    function abrirModalVisualizar(conta) {
        if (!sobreposicaoModal) {
            console.error(
                "Elemento #sobreposicaoModalVisualizacao não encontrado."
            );
            return;
        }

        if (!conta) {
            console.error("Nenhuma conta foi informada para visualização.");

            return;
        }

        preencherModal(conta);

        sobreposicaoModal.classList.add("active");
        sobreposicaoModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        if (botaoFechar) {
            setTimeout(() => {
                botaoFechar.focus();
            }, 0);
        }
    }

    function fecharModalVisualizar() {
        if (!sobreposicaoModal) {
            return;
        }

        sobreposicaoModal.classList.remove("active");
        sobreposicaoModal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";
    }

    function inicializarEventos() {
        if (botaoFechar) {
            botaoFechar.addEventListener("click", fecharModalVisualizar);
        }

        if (botaoCancelar) {
            botaoCancelar.addEventListener("click", fecharModalVisualizar);
        }

        if (sobreposicaoModal) {
            sobreposicaoModal.addEventListener(
                "click",
                function (evento) {
                    if (evento.target === sobreposicaoModal) {
                        fecharModalVisualizar();
                    }
                }
            );
        }

        document.addEventListener(
            "keydown",
            function (evento) {
                if (evento.key === "Escape" && sobreposicaoModal && sobreposicaoModal.classList.contains("active")) {
                    fecharModalVisualizar();
                }
            }
        );
    }

    function inicializar() {
        if (!sobreposicaoModal) {
            console.error("Elemento #sobreposicaoModalVisualizacao não encontrado.");

            return;
        }

        sobreposicaoModal.classList.remove("active");
        sobreposicaoModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

        inicializarEventos();
    }

    window.abrirModalVisualizar = abrirModalVisualizar;
    window.abrirModalVisualizacao = abrirModalVisualizar;
    window.fecharModalVisualizar = fecharModalVisualizar;
    window.fecharModalVisualizacao = fecharModalVisualizar;

    inicializar();
})();