(function () {
    "use strict";

    function somenteNumeros(valor) {
        return String(valor ?? "").replace(/\D/g, "");
    }

    function formatarTelefone(valor) {
        if (!valor) {
            return "";
        }

        let numeros = somenteNumeros(valor).substring(0, 11);

        if (numeros.length <= 10) {
            numeros = numeros
                .replace(/^(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{4})(\d)/, "$1-$2");
        } else {
            numeros = numeros
                .replace(/^(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2");
        }

        return numeros;
    }

    function formatarCep(valor) {
        let numeros = somenteNumeros(valor).substring(0, 8);

        if (numeros.length > 5) {
            numeros = numeros.replace(/^(\d{5})(\d)/, "$1-$2");
        }

        return numeros;
    }

    function formatarCPF(valor) {
        let numeros = somenteNumeros(valor).substring(0, 11);

        return numeros
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    }

    function formatarCNPJ(valor) {
        let numeros = somenteNumeros(valor).substring(0, 14);

        return numeros
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
            .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    }

    function formatarDocumento(valor) {
        const numeros = somenteNumeros(valor);

        if (numeros.length === 11) {
            return formatarCPF(numeros);
        }

        if (numeros.length === 14) {
            return formatarCNPJ(numeros);
        }

        return valor ?? "";
    }

    function formatarTipo(tipo) {
        if (tipo === "cliente") {
            return "Cliente";
        }

        if (tipo === "fornecedor") {
            return "Fornecedor";
        }

        return "-";
    }

    function formatarStatus(status) {
        return status ? "Ativo" : "Inativo";
    }

    function valorOuTraco(valor) {
        if (
            valor === null ||
            valor === undefined ||
            String(valor).trim() === ""
        ) {
            return "-";
        }

        return valor;
    }

    window.ClienteFornecedorFormatadores = Object.freeze({
        somenteNumeros,
        formatarTelefone,
        formatarCep,
        formatarCPF,
        formatarCNPJ,
        formatarDocumento,
        formatarTipo,
        formatarStatus,
        valorOuTraco
    });
})();