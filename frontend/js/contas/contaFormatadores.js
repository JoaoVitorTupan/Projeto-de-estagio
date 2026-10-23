(function () {
    "use strict";

    function valorOuTraco(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === "") {
            return "-";
        }

        return valor;
    }

    function formatarTipo(tipo) {
        switch (tipo) {
            case "receita": return "Receita";
            case "despesa": return "Despesa";

            default: return "-";
        }
    }

    function formatarStatus(status) {
        switch (status) {
            case "aberto": return "Aberto";
            case "vencido": return "Vencido";
            case "pago": return "Pago";
            case "recebido": return "Recebido";
            default: return "-";
        }
    }

    function statusFinalizado(status) {
        return (status === "pago" || status === "recebido"
        );
    }

    function statusEmAberto(status) {
        return (status === "aberto");
    }

    function statusVencido(status) {
        return (status === "vencido");
    }

    function formatarValor(valor) {
        if (valor === null || valor === undefined || valor === "") {
            return "-";
        }

        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return "-";
        }

        return numero.toLocaleString("pt-BR", {
            style: "currency", 
            currency: "BRL"
        });
    }

    function formatarData(valor) {
        if (!valor) {
            return "-";
        }

        const data = new Date(`${valor}T00:00:00`);

        if (Number.isNaN(data.getTime())) {
            return "-";
        }

        return data.toLocaleDateString("pt-BR");
    }

    function formatarDescricao(descricao) {
        if (descricao === null || descricao === undefined || String(descricao).trim() === "") {
            return "-";
        }

        return String(
            descricao
        ).trim();
    }

    function formatarNomePessoa(pessoa) {
        if (!pessoa) {
            return "-";
        }

        if (typeof pessoa === "string") {
            return pessoa;
        }

        return (pessoa.nome || pessoa.razao_social || pessoa.nomeFantasia || "-");
    }

    function formatarClienteOuFornecedor(clienteOuFornecedor) {
        if (!clienteOuFornecedor) {
            return "-";
        }

        return formatarNomePessoa(clienteOuFornecedor);
    }

    function formatarPlanoDeConta(planoDeConta) {
        if (!planoDeConta) {
            return "-";
        }

        if (typeof planoDeConta === "string") {
            return planoDeConta;
        }

        return (planoDeConta.nome || "-");
    }

    window.ContaFormatadores = Object.freeze({
        valorOuTraco,
        formatarTipo,
        formatarStatus,
        statusFinalizado,
        statusEmAberto,
        statusVencido,
        formatarValor,
        formatarData,
        formatarDescricao,
        formatarNomePessoa,
        formatarClienteOuFornecedor,
        formatarPlanoDeConta
    });
})();