(function () {
    "use strict";

    function obterElemento(id) {

        return document.getElementById(
            id
        );

    }

    function obterValorCampo(id) {
        const campo = obterElemento(id);

        if (!campo) {
            return "";
        }

        return (campo.value ?? "");
    }

    function mostrarErro(campoId, mensagem) {
        const campo = obterElemento(campoId);
        const erro = obterElemento(`${campoId}Erro`);

        if (campo) {
            campo.classList.add("error");
        }

        if (erro) {
            erro.textContent = mensagem;
            erro.classList.add("active");
        }
    }

    function removerErro(campoId) {
        const campo = obterElemento(campoId);
        const erro = obterElemento(`${campoId}Erro`);

        if (campo) {
            campo.classList.remove("error");
        }

        if (erro) {
            erro.textContent = "";
            erro.classList.remove("active");
        }
    }

    function validarDescricao(descricao) {
        const valor = String(descricao ?? "").trim();

        return (valor.length >= 2);
    }

    function validarValor(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === "") {
            return false;
        }

        const numero = Number(String(valor).replace(",", "."));

        return (Number.isFinite(numero) && numero > 0);
    }

    function validarData(data) {
        if (!data) {
            return false;
        }

        const dataInformada = new Date(`${data}T00:00:00`);

        return (!Number.isNaN(dataInformada.getTime()));
    }

    function validarTipo(tipo) {
        return (tipo === "receita" || tipo === "despesa");
    }

    function validarClienteOuFornecedor(id) {
        if (id === null || id === undefined || String(id).trim() === "") {
            return false;
        }

        return (Number.isInteger(Number(id)) && Number(id) > 0);
    }

    function validarPlanoDeConta(id) {
        if (id === null || id === undefined || String(id).trim() === "") {
            return false;
        }

        return (Number.isInteger(Number(id)) && Number(id) > 0);
    }

    function validarDadosPrincipais() {
        let valido = true;

        const tipo = obterValorCampo("tipo");

        if (!validarTipo(tipo)) {
            mostrarErro("tipo", "Selecione o tipo da conta.");

            valido = false;
        } else {
            removerErro("tipo");
        }

        const descricao = obterValorCampo("descricao").trim();

        if (!validarDescricao(descricao)) {
            mostrarErro("descricao", "Informe uma descrição válida.");

            valido = false;
        } else {
            removerErro("descricao");
        }

        const valor = obterValorCampo("valor");

        if (!validarValor(valor)) {
            mostrarErro("valor", "Informe um valor maior que zero.");

            valido = false;
        } else {
            removerErro("valor");
        }

        const dataVencimento = obterValorCampo("dataVencimento");

        if (!validarData(dataVencimento)) {
            mostrarErro("dataVencimento", "Informe uma data de vencimento válida.");

            valido = false;
        } else {
            removerErro("dataVencimento");
        }

        return valido;
    }

    function validarRelacionamentos() {
        let valido = true;

        const clienteOuFornecedor = obterValorCampo("clienteOuFornecedor");

        if (!validarClienteOuFornecedor(clienteOuFornecedor)) {
            mostrarErro("clienteOuFornecedor", "Selecione um cliente ou fornecedor.");

            valido = false;
        } else {
            removerErro("clienteOuFornecedor");
        }

        const planoDeConta = obterValorCampo("planoDeConta");

        if (!validarPlanoDeConta(planoDeConta)) {
            mostrarErro("planoDeConta", "Selecione um plano de contas.");

            valido = false;
        } else {
            removerErro("planoDeConta");
        }

        return valido;
    }

    function limparErros() {
        const campos = [
            "tipo",
            "descricao",
            "valor",
            "dataVencimento",
            "clienteOuFornecedor",
            "planoDeConta"
        ];

        campos.forEach((campoId) => {
            removerErro(
                campoId
            );

        });
    }

    function validarFormulario() {
        const dadosPrincipaisValidos = validarDadosPrincipais();
        const relacionamentosValidos = validarRelacionamentos();

        return (dadosPrincipaisValidos && relacionamentosValidos);
    }

    window.ContaValidacao = Object.freeze({
        validarDescricao,
        validarValor,
        validarData,
        validarTipo,
        validarClienteOuFornecedor,
        validarPlanoDeConta,
        validarDadosPrincipais,
        validarRelacionamentos,
        validarFormulario,
        limparErros,
        mostrarErro,
        removerErro
    });
})();