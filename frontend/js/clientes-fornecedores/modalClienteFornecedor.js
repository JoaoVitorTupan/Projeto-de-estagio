(function () {
    "use strict";

    const DOM = window.DOM;
    const Formulario = window.ClienteFornecedorFormulario;
    const Validacao = window.ClienteFornecedorValidacao;
    const Formatadores = window.ClienteFornecedorFormatadores;
    const API = window.ClienteFornecedorAPI;
    const Autenticacao = window.Autenticacao;

    const sobreposicaoModal = DOM.obterElemento("modalOverlay");
    const botaoFechar = DOM.obterElemento("botaoFecharModal");
    const botaoCancelar = DOM.obterElemento("botaoCancelarModal");
    const botaoProximo = DOM.obterElemento("botaoProximo");
    const botaoVoltar = DOM.obterElemento("botaoVoltar");
    const botaoSalvar = DOM.obterElemento("botaoSalvar");
    const etapa1 = DOM.obterElemento("etapa1");
    const etapa2 = DOM.obterElemento("etapa2");
    const indicadorEtapa1 = DOM.obterElemento("indicadorEtapa1");
    const indicadorEtapa2 = DOM.obterElemento("indicadorEtapa2");
    const documento = DOM.obterElemento("documento");
    const cep = DOM.obterElemento("cep");
    const botaoBuscarCep = DOM.obterElemento("botaoBuscarCep");
    const tituloModal = DOM.obterElemento("modalTitulo");

    let etapaAtual = 1;
    let registroEmEdicao = null;

    function definirRegistroEmEdicao(registro) {
        registroEmEdicao = registro || null;
    }

    function atualizarTituloModal() {
        if (!tituloModal) {
            return;
        }

        if (!registroEmEdicao) {
            tituloModal.textContent =
                "Adicionar novo cliente ou fornecedor";
            return;
        }

        tituloModal.textContent =
            registroEmEdicao.tipo === "cliente"
                ? "Editar cliente"
                : "Editar fornecedor";
    }

    function atualizarBotaoSalvar() {
        if (botaoSalvar) {
            botaoSalvar.textContent =
                registroEmEdicao ? "Atualizar" : "Salvar";
        }
    }

    function mostrarEtapa(etapa) {
        etapaAtual = etapa;

        const primeiraEtapa = etapa === 1;

        etapa1?.classList.toggle("active", primeiraEtapa);
        etapa2?.classList.toggle("active", !primeiraEtapa);

        indicadorEtapa1?.classList.toggle("active", primeiraEtapa);
        indicadorEtapa1?.classList.toggle("completed", !primeiraEtapa);
        indicadorEtapa2?.classList.toggle("active", !primeiraEtapa);

        if (botaoVoltar) {
            botaoVoltar.style.display = primeiraEtapa ? "none" : "block";
        }

        if (botaoProximo) {
            botaoProximo.style.display = primeiraEtapa ? "block" : "none";
        }

        if (botaoSalvar) {
            botaoSalvar.style.display = primeiraEtapa ? "none" : "block";
        }

        atualizarBotaoSalvar();
    }

    function abrirModal() {
        if (!sobreposicaoModal) {
            return;
        }

        if (registroEmEdicao) {
            Formulario.preencherDados(registroEmEdicao);
        }

        atualizarTituloModal();
        mostrarEtapa(1);

        sobreposicaoModal.classList.add("active");
    }

    function fecharModal() {
        sobreposicaoModal?.classList.remove("active");

        registroEmEdicao = null;
        mostrarEtapa(1);
        Formulario.limparFormulario();
        atualizarTituloModal();
        atualizarBotaoSalvar();
    }

    function prepararNovoCadastro() {
        registroEmEdicao = null;
        Formulario.limparFormulario();
        mostrarEtapa(1);
        atualizarTituloModal();
        atualizarBotaoSalvar();
    }

    async function buscarCep() {
        const campos = Formulario.obterCampos();
        const numeros = Formatadores.somenteNumeros(
            campos.cep?.value || ""
        );

        Formulario.removerErro("cep");

        if (numeros.length !== 8) {
            Formulario.mostrarErro(
                "cep",
                "Informe um CEP com 8 números."
            );
            Formulario.limparStatusCep();
            return;
        }

        if (botaoBuscarCep) {
            botaoBuscarCep.disabled = true;
        }

        if (campos.statusCep) {
            campos.statusCep.textContent = "Consultando CEP...";
            campos.statusCep.className = "cep-status loading";
        }

        try {
            const endereco =
                await API.buscarEnderecoPorCep(numeros);

            if (campos.logradouro) {
                campos.logradouro.value = endereco.logradouro || "";
            }

            if (campos.bairro) {
                campos.bairro.value = endereco.bairro || "";
            }

            if (campos.cidade) {
                campos.cidade.value = endereco.localidade || "";
            }

            if (campos.uf) {
                campos.uf.value = endereco.uf || "";
            }

            if (campos.statusCep) {
                campos.statusCep.textContent =
                    "CEP encontrado. Confira os dados abaixo.";
                campos.statusCep.className = "cep-status success";
            }
        } catch (erro) {
            if (campos.statusCep) {
                campos.statusCep.textContent =
                    erro.message || "Não foi possível consultar o CEP.";
                campos.statusCep.className = "cep-status error";
            }
        } finally {
            if (botaoBuscarCep) {
                botaoBuscarCep.disabled = false;
            }
        }
    }

    async function salvar() {
        if (!Validacao.validarFormulario()) {
            if (!Validacao.validarDadosPrincipais()) {
                mostrarEtapa(1);
            }

            return;
        }

        if (!Autenticacao.obterToken()) {
            alert("Sua sessão expirou. Faça login novamente.");
            Autenticacao.redirecionarParaLogin();
            return;
        }

        const dados = Formulario.obterDados();
        const estaEditando = Boolean(registroEmEdicao?.id);

        if (botaoSalvar) {
            botaoSalvar.disabled = true;
            botaoSalvar.textContent =
                estaEditando ? "Atualizando..." : "Salvando...";
        }

        try {
            const resultado = estaEditando
                ? await API.atualizar(registroEmEdicao.id, dados)
                : await API.cadastrar(dados);

            if (resultado === null && !Autenticacao.estaAutenticado()) {
                return;
            }

            alert(
                estaEditando
                    ? "Cliente/fornecedor atualizado com sucesso!"
                    : "Cliente/fornecedor cadastrado com sucesso!"
            );

            window.dispatchEvent(
                new CustomEvent("clienteFornecedorSalvo")
            );

            fecharModal();
        } catch (erro) {
            console.error(
                "Erro ao salvar cliente/fornecedor:",
                erro
            );

            alert(
                erro.message ||
                "Erro ao salvar cliente/fornecedor."
            );
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

        botaoProximo?.addEventListener("click", () => {
            if (Validacao.validarDadosPrincipais()) {
                mostrarEtapa(2);
            }
        });

        botaoVoltar?.addEventListener("click", () => {
            mostrarEtapa(1);
        });

        botaoSalvar?.addEventListener("click", salvar);

        botaoBuscarCep?.addEventListener("click", buscarCep);

        cep?.addEventListener("blur", () => {
            const numeros = Formatadores.somenteNumeros(cep.value);

            if (numeros.length === 8) {
                buscarCep();
            }
        });

        cep?.addEventListener("input", () => {
            cep.value = Formatadores.formatarCep(cep.value);
            Formulario.removerErro("cep");
        });

        const telefone = DOM.obterElemento("telefone");

        telefone?.addEventListener("input", () => {
            telefone.value =
                Formatadores.formatarTelefone(telefone.value);
        });

        documento?.addEventListener("input", () => {
            Formulario.aplicarMascaraDocumento();
        });


        const selecionarCpf = DOM.obterElemento("selecionarCpf");

        const selecionarCnpj =
            DOM.obterElemento("selecionarCnpj");

        function atualizarTipoDocumento() {
            if (!documento) return;

            documento.value = "";
            Formulario.aplicarMascaraDocumento();
            Formulario.removerErro("documento");
        }

        selecionarCpf?.addEventListener(
            "change",
            atualizarTipoDocumento
        );

        selecionarCnpj?.addEventListener(
            "change",
            atualizarTipoDocumento
        );
    }

    function inicializar() {
        if (!sobreposicaoModal) {
            console.error("Modal #modalOverlay não encontrada.");
            return;
        }

        inicializarEventos();
        Formulario.aplicarMascaraDocumento();
        mostrarEtapa(1);
        atualizarTituloModal();
        atualizarBotaoSalvar();
    }

    window.abrirModal = abrirModal;
    window.fecharModal = fecharModal;
    window.limparModal = prepararNovoCadastro;
    window.definirRegistroClienteFornecedorEmEdicao =
        definirRegistroEmEdicao;

    inicializar();
})();