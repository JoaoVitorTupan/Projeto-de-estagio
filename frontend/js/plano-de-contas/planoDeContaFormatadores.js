(function () {
    "use strict";

    function formatarNome(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === "") {
            return "-";
        }

        return String(valor).trim();
    }

    function formatarDescricao(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === "") {
            return "-";
        }

        return String(valor).trim();
    }

    function formatarStatus(status) {
        return status? "Ativo": "Inativo";
    }

    function valorOuTraco(valor) {
        if (valor === null || valor === undefined || String(valor).trim() === "") {
            return "-";
        }

        return String(valor).trim();
    }

    window.PlanoDeContaFormatadores = Object.freeze({
        formatarNome,
        formatarDescricao,
        formatarStatus,
        valorOuTraco
    });
})();