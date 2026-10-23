(function () {
    "use strict";

    function obterCamposCadastro() {
        return {
            nome: document.getElementById("nome"),
            email: document.getElementById("email"),
            senha: document.getElementById("senha"),
            confirmSenha: document.getElementById("confirmSenha"),
            role: document.getElementById("role"),
            error: document.getElementById("error")
        };
    }

    function obterDadosCadastro() {
        const campos = obterCamposCadastro();

        return {
            nome: campos.nome?.value.trim() || "",
            email: campos.email?.value.trim() || "",
            senha: campos.senha?.value || "",
            confirmSenha: campos.confirmSenha?.value || "",
            role: campos.role?.value || ""
        };
    }

    function obterCamposEdicao() {
        return {
            id: document.getElementById("editarId"),
            nome: document.getElementById("editarNome"),
            email: document.getElementById("editarEmail"),
            role: document.getElementById("editarRole"),
            status: document.getElementById("editarStatus")
        };
    }

    function obterDadosEdicao() {
        const campos = obterCamposEdicao();

        return {
            id: campos.id?.value || "",
            nome: campos.nome?.value.trim() || "",
            email: campos.email?.value.trim() || "",
            role: campos.role?.value || "",
            status: campos.status?.value === "true"
        };
    }

    function limparCadastro() {
        const campos = obterCamposCadastro();

        if (campos.nome) campos.nome.value = "";
        if (campos.email) campos.email.value = "";
        if (campos.senha) campos.senha.value = "";
        if (campos.confirmSenha) campos.confirmSenha.value = "";
        if (campos.role) {
            campos.role.value = "administrador";
        }

        limparErro();
    }

    function limparErro() {
        const error = document.getElementById("error");

        if (error) {
            error.innerText = "";
        }
    }

    function mostrarErro(mensagem) {
        const error = document.getElementById("error");

        if (error) {
            error.innerText = mensagem;
        }
    }

    window.UsuarioFormulario = Object.freeze({
        obterCamposCadastro,
        obterDadosCadastro,
        obterCamposEdicao,
        obterDadosEdicao,
        limparCadastro,
        limparErro,
        mostrarErro
    });
})();