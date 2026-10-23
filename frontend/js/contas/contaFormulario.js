(function () {
    "use strict";

    let camposCache = null;

    function obterCampos() {
        if (camposCache) {
            return camposCache;
        }

        camposCache = {
            tipo: document.getElementById("tipo"),
            descricao: document.getElementById("descricao"),
            valor: document.getElementById("valor"),
            dataVencimento: document.getElementById("dataVencimento"),
            clienteOuFornecedor: document.getElementById("clienteOuFornecedor"),
            planoDeConta: document.getElementById("planoDeConta")
        };

        return camposCache;
    }

    function limparCache() {
        camposCache = null;
    }

    function obterDados() {
        const campos = obterCampos();

        return {
            tipo: campos.tipo?.value || "",
            descricao: campos.descricao?.value.trim() || "",
            valor: campos.valor?.value || "",
            data_vencimento: campos.dataVencimento?.value || "",
            cliente_ou_fornecedor_id: campos.clienteOuFornecedor?.value || "",
            plano_de_conta_id: campos.planoDeConta?.value || ""
        };
    }

    function preencherDados(conta) {
        if (!conta) {
            return;
        }

        const campos = obterCampos();

        if (campos.tipo) {
            campos.tipo.value = conta.tipo || "";
        }

        if (campos.descricao) {
            campos.descricao.value = conta.descricao || "";
        }

        if (campos.valor) {
            campos.valor.value = conta.valor ?? "";
        }

        if (campos.dataVencimento) {
            campos.dataVencimento.value = conta.data_vencimento? String(conta.data_vencimento).substring(0, 10): "";
        }

        if (campos.clienteOuFornecedor) {
            const clienteOuFornecedorId =
                conta.cliente_ou_fornecedor_id ||
                conta.clienteOuFornecedor?.id ||
                conta.pessoa?.id ||
                "";

            campos.clienteOuFornecedor.value = clienteOuFornecedorId;
        }

        if (campos.planoDeConta) {
            const planoDeContaId =
                conta.plano_de_conta_id ||
                conta.planoDeConta?.id ||
                "";

            campos.planoDeConta.value = planoDeContaId;
        }

        limparErros();
    }

    function limparFormulario() {
        const campos = obterCampos();

        if (campos.tipo) {
            campos.tipo.value = "";
        }

        if (campos.descricao) {
            campos.descricao.value = "";
        }

        if (campos.valor) {
            campos.valor.value = "";
        }

        if (campos.dataVencimento) {
            campos.dataVencimento.value = "";
        }

        if (campos.clienteOuFornecedor) {
            campos.clienteOuFornecedor.value = "";
        }

        if (campos.planoDeConta) {
            campos.planoDeConta.value = "";
        }

        limparErros();
    }

    function limparErros() {
        document.querySelectorAll("#modalOverlay .error-message").forEach((elemento) => {
            elemento.classList.remove(
                "active"
            );
        });

        document.querySelectorAll("#modalOverlay input, #modalOverlay select, #modalOverlay textarea").forEach((campo) => {
            campo.classList.remove("error");
        });
    }

    function mostrarErro(id, mensagem) {
        const erro = document.getElementById(`${id}Erro`);

        if (erro) {
            if (mensagem) {
                erro.textContent = mensagem;
            }

            erro.classList.add("active");
        }

        const campo = document.getElementById(id);

        if (campo) {
            campo.classList.add("error");
        }
    }

    function removerErro(id) {
        const erro = document.getElementById(`${id}Erro`);

        if (erro) {
            erro.classList.remove("active");
        }

        const campo = document.getElementById(id);

        if (campo) {
            campo.classList.remove("error");
        }
    }
    
    window.ContaFormulario = Object.freeze({
        obterCampos,
        limparCache,
        obterDados,
        preencherDados,
        limparFormulario,
        limparErros,
        mostrarErro,
        removerErro
    });
})();