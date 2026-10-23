(function () {
    "use strict";

    const DOM = window.DOM;
    const Formatadores = window.ClienteFornecedorFormatadores;

    const sobreposicaoModal =
        DOM.obterElemento("sobreposicaoModalVisualizacao");

    const botaoFechar =
        DOM.obterElemento("botaoFecharModalVisualizacao");

    const botaoCancelar =
        DOM.obterElemento("botaoCancelarModalVisualizacao");

    const campos = {
        tipo: DOM.obterElemento("tipoVisualizacao"),
        nome: DOM.obterElemento("nomeVisualizacao"),
        documento: DOM.obterElemento("documentoVisualizacao"),
        email: DOM.obterElemento("emailVisualizacao"),
        telefone: DOM.obterElemento("telefoneVisualizacao"),
        status: DOM.obterElemento("statusVisualizacao"),
        cep: DOM.obterElemento("cepVisualizacao"),
        logradouro: DOM.obterElemento("logradouroVisualizacao"),
        numero: DOM.obterElemento("numeroVisualizacao"),
        complemento: DOM.obterElemento("complementoVisualizacao"),
        bairro: DOM.obterElemento("bairroVisualizacao"),
        cidade: DOM.obterElemento("cidadeVisualizacao"),
        uf: DOM.obterElemento("ufVisualizacao")
    };

    function preencherModal(registro) {
        if (!registro) {
            console.error(
                "Nenhum registro foi informado para preencher a modal."
            );
            return;
        }

        const endereco = registro.endereco || {};

        DOM.definirTexto(
            campos.tipo,
            Formatadores.formatarTipo(registro.tipo)
        );

        DOM.definirTexto(
            campos.nome,
            Formatadores.valorOuTraco(registro.nome)
        );

        DOM.definirTexto(
            campos.documento,
            Formatadores.formatarDocumento(
                registro.cpf_cnpj || registro.documento
            ) || "-"
        );

        DOM.definirTexto(
            campos.email,
            Formatadores.valorOuTraco(registro.email)
        );

        DOM.definirTexto(
            campos.telefone,
            Formatadores.formatarTelefone(registro.telefone) || "-"
        );

        DOM.definirTexto(
            campos.status,
            Formatadores.formatarStatus(registro.status)
        );

        const valores = {
            cep: registro.cep || endereco.cep || "",
            logradouro: registro.logradouro || endereco.logradouro || "",
            numero: registro.numero || endereco.numero || "",
            complemento: registro.complemento || endereco.complemento || "",
            bairro: registro.bairro || endereco.bairro || "",
            cidade: registro.cidade || endereco.cidade || "",
            uf: registro.uf || endereco.uf || ""
        };

        DOM.definirTexto(
            campos.cep,
            Formatadores.formatarCep(valores.cep) || "-"
        );

        DOM.definirTexto(
            campos.logradouro,
            Formatadores.valorOuTraco(valores.logradouro)
        );

        DOM.definirTexto(
            campos.numero,
            Formatadores.valorOuTraco(valores.numero)
        );

        DOM.definirTexto(
            campos.complemento,
            Formatadores.valorOuTraco(valores.complemento)
        );

        DOM.definirTexto(
            campos.bairro,
            Formatadores.valorOuTraco(valores.bairro)
        );

        DOM.definirTexto(
            campos.cidade,
            Formatadores.valorOuTraco(valores.cidade)
        );

        DOM.definirTexto(
            campos.uf,
            Formatadores.valorOuTraco(valores.uf)
        );
    }

    function abrirModalVisualizar(registro) {
        if (!sobreposicaoModal || !registro) {
            return;
        }

        preencherModal(registro);
        sobreposicaoModal.classList.add("active");
    }

    function fecharModalVisualizar() {
        sobreposicaoModal?.classList.remove("active");
    }

    function inicializarEventos() {
        botaoFechar?.addEventListener(
            "click",
            fecharModalVisualizar
        );

        botaoCancelar?.addEventListener(
            "click",
            fecharModalVisualizar
        );

        sobreposicaoModal?.addEventListener("click", (evento) => {
            if (evento.target === sobreposicaoModal) {
                fecharModalVisualizar();
            }
        });
    }

    function inicializar() {
        inicializarEventos();
    }

    window.abrirModalVisualizar = abrirModalVisualizar;
    window.abrirModalVisualizacao = abrirModalVisualizar;
    window.fecharModalVisualizar = fecharModalVisualizar;
    window.fecharModalVisualizacao = fecharModalVisualizar;

    inicializar();
})();