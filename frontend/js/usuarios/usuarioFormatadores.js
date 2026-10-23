(function () {
    "use strict";

    function formatarRole(role) {
        if (role === "administrador") {
            return "Administrador";
        }

        if (role === "gestor") {
            return "Gestor";
        }

        if (role === "financeiro") {
            return "Financeiro";
        }

        return role || "Usuario";
    }

    function formatarStatus(status) {
        return status ? "Ativo" : "Inativo";
    }

    function formatarRoleParaValor(roleTexto) {
        const texto = String(roleTexto || "").toLowerCase();

        if (texto.includes("admin")) {
            return "administrador";
        }

        if (texto.includes("gestor")) {
            return "gestor";
        }

        if (texto.includes("financeiro")) {
            return "financeiro";
        }

        return "";
    }

    function formatarStatusParaValor(statusTexto) {
        return statusTexto === "Ativo"? "true": "false";
    }

    window.UsuarioFormatadores = Object.freeze({
        formatarRole,
        formatarStatus,
        formatarRoleParaValor,
        formatarStatusParaValor
    });
})();