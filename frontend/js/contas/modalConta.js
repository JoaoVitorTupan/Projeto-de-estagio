(function () {
    "use strict";

    const DOM = window.DOM;
    const Formulario = window.ContaFormulario;
    const Validacao = window.ContaValidacao;
    const Formatadores = window.ContaFormatadores;
    const API = window.ContaAPI;
    const Autenticacao = window.Autenticacao;
    const sobreposicaoModal = DOM.obterElemento("modalOverlay");
    const botaoFechar = DOM.obterElemento("botaoFecharModal");
    const botaoCancelar = DOM.obterElemento("botaoCancelarModal");
    const botaoSalvar = DOM.obterElemento("botaoSalvar");
    const tituloModal = DOM.obterElemento("modalTitulo");

    let contaEmEdicao = null;

    function definirContaEmEdicao(conta) {
        contaEmEdicao = conta || null;
    }

    function contaEstaFinalizada(conta) {
        if (!conta) {
            return false;
        }

        return (conta.status === "pago" || conta.status === "recebido");
    }

    function atualizarTituloModal() {
        if (!tituloModal) {
            return;
        }

        if (!contaEmEdicao) {
            tituloModal.textContent = "Adicionar nova conta";

            return;
        }

        tituloModal.textContent = "Editar conta";
    }

    function atualizarBotaoSalvar() {

        if (!botaoSalvar) {
            return;
        }

        botaoSalvar.textContent = contaEmEdicao? "Atualizar": "Salvar";
    }

    async function carregarClientesOuFornecedores() {
        const campo =DOM.obterElemento("clienteOuFornecedor");

        if (!campo) {
            return;
        }

        try {
            const resposta =await fetch("http://localhost:3000/clientes-fornecedores", {
                method: "GET",
                headers: Autenticacao.obterCabecalhoAutorizacao()
            });

            if (Autenticacao.tratarRespostaNaoAutorizada(resposta)) {
                return;
            }

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os clientes e fornecedores.");
            }

            const dados = await resposta.json();

            campo.innerHTML = "";

            const opcaoInicial = document.createElement("option");

            opcaoInicial.value = "";

            opcaoInicial.textContent = "Selecione um cliente ou fornecedor";

            campo.appendChild(opcaoInicial);

            if (!Array.isArray(dados)) {
                return;
            }

            dados.filter((registro) => registro.status === true).forEach((registro) => {
                const option = document.createElement("option");
                
                option.value = registro.id;

                const tipo = Formatadores.valorOuTraco(registro.tipo);
                const nome = Formatadores.valorOuTraco(registro.nome);

                option.textContent = `${nome} - ${tipo}`;

                campo.appendChild(option);
            });

            if (contaEmEdicao) {
                campo.value = contaEmEdicao.cliente_ou_fornecedor_id || contaEmEdicao .clienteOuFornecedor?.id || "";
            }

        } catch (erro) {

            console.error("Erro ao carregar clientes e fornecedores:", erro);
        }
    }

    async function carregarPlanosDeContas() {
        const campo = DOM.obterElemento("planoDeConta");

        if (!campo) {
            return;
        }

        try {
            const resposta = await fetch("http://localhost:3000/planos-de-conta",{
                method: "GET",
                headers: Autenticacao.obterCabecalhoAutorizacao()
            });

            if (Autenticacao.tratarRespostaNaoAutorizada(resposta)) {
                return;
            }

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os planos de contas.");
            }

            const dados = await resposta.json();

            campo.innerHTML = "";

            const opcaoInicial = document.createElement("option");

            opcaoInicial.value = "";
            opcaoInicial.textContent = "Selecione um plano de contas";

            campo.appendChild(opcaoInicial);

            if (!Array.isArray(dados)) {
                return;
            }

            dados.filter((plano) => plano.status === true).forEach((plano) => {
                const option = document.createElement("option");

                option.value = plano.id;
                option.textContent = Formatadores.valorOuTraco(plano.nome);

                campo.appendChild(option);
            });

            if (contaEmEdicao) {
                campo.value = contaEmEdicao.plano_de_conta_id || contaEmEdicao.planoDeConta?.id || "";
            }

        } catch (erro) {
            console.error("Erro ao carregar planos de contas:", erro);
        }
    }

    async function abrirModal() {
        if (!sobreposicaoModal) {
            return;
        }

        if (contaEstaFinalizada(contaEmEdicao)) {
            const status = contaEmEdicao.status === "pago"? "paga": "recebida";

            alert(`Esta conta já está ${status} e não pode ser editada.`);

            contaEmEdicao = null;

            return;
        }

        if (contaEmEdicao) {
            Formulario.preencherDados(contaEmEdicao);
        } else {
            Formulario.limparFormulario();
        }

        atualizarTituloModal();
        atualizarBotaoSalvar();

        sobreposicaoModal.classList.add("active");
        sobreposicaoModal.setAttribute("aria-hidden", "false");

        await Promise.all([
            carregarClientesOuFornecedores(), 
            carregarPlanosDeContas()
        ]);

        if (contaEmEdicao) {
            Formulario.preencherDados(contaEmEdicao);
        }
    }

    function fecharModal() {
        if (sobreposicaoModal) {
            sobreposicaoModal.classList.remove("active");
            sobreposicaoModal.setAttribute("aria-hidden", "true");
        }

        contaEmEdicao = null;

        Formulario.limparFormulario();

        atualizarTituloModal();
        atualizarBotaoSalvar();
    }

    function prepararNovoCadastro() {
        contaEmEdicao = null;

        Formulario.limparFormulario();

        atualizarTituloModal();
        atualizarBotaoSalvar();
    }

    async function salvar() {
        if (!Validacao.validarFormulario()) {
            return;
        }

        if (!Autenticacao.obterToken()) {
            alert("Sua sessão expirou. Faça login novamente.");

            Autenticacao.redirecionarParaLogin();

            return;
        }

        if (contaEstaFinalizada(contaEmEdicao)) {
            const status = contaEmEdicao.status === "pago"? "paga": "recebida";

            alert(`Esta conta já está ${status} e não pode ser alterada.`);

            return;
        }

        const dados = Formulario.obterDados();
        const estaEditando = Boolean(contaEmEdicao?.id);

        if (botaoSalvar) {
            botaoSalvar.disabled = true;
            botaoSalvar.textContent = estaEditando? "Atualizando...": "Salvando...";
        }

        try {
            const resultado = estaEditando? await API.atualizar(contaEmEdicao.id, dados): await API.cadastrar(dados);

            if (resultado === null && !Autenticacao.estaAutenticado()) {
                return;
            }

            alert(estaEditando? "Conta atualizada com sucesso!": "Conta cadastrada com sucesso!");

            window.dispatchEvent(new CustomEvent("contaSalva"));

            fecharModal();
        } catch (erro) {
            console.error("Erro ao salvar conta:", erro);

            alert(erro?.message || "Erro ao salvar conta.");
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

        const campos = Formulario.obterCampos();

        campos.valor?.addEventListener("input", () => {
            let valor = campos.valor.value;

            valor =valor.replace(/[^0-9,.-]/g, "");

            campos.valor.value = valor;

            Formulario.removerErro("valor");
        });

        campos.tipo?.addEventListener("change", () => {
            Validacao.validarDadosPrincipais();
        });

        campos.descricao?.addEventListener("input", () => {
            Formulario.removerErro("descricao");
        });

        campos.dataVencimento?.addEventListener("change", () => {
            Formulario.removerErro("dataVencimento");
        });

        campos.clienteOuFornecedor?.addEventListener("change", () => {
            Formulario.removerErro("clienteOuFornecedor");
        });

        campos.planoDeConta?.addEventListener("change", () => {
            Formulario.removerErro("planoDeConta");
        });
    }

    function inicializar() {
        if (!sobreposicaoModal) {
            console.error("Modal #modalOverlay não encontrada.");

            return;
        }

        sobreposicaoModal.classList.remove("active");
        sobreposicaoModal.setAttribute("aria-hidden", "true");

        if (!Formulario) {
            console.error("ContaFormulario não foi carregado.");

            return;
        }

        if (!Validacao) {
            console.error("ContaValidacao não foi carregado.");

            return;
        }

        if (!API) {
            console.error("ContaAPI não foi carregada.");

            return;
        }

        if (!Autenticacao) {
            console.error("Autenticacao não foi carregado.");

            return;
        }

        inicializarEventos();
        atualizarTituloModal();
        atualizarBotaoSalvar();
    }

    window.abrirModal = abrirModal;
    window.fecharModal = fecharModal;
    window.limparModal = prepararNovoCadastro;
    window.definirContaEmEdicao = definirContaEmEdicao;

    inicializar();
})();