(function () {
    "use strict";


    function validarEmail(email) {
        const valor = String(email || "").trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return regex.test(valor);
    }

    function validarNome(nome) {
        return String(nome || "").trim().length > 0;
    }

    function validarSenha(senha) {
        return String(senha || "").length >= 8;
    }

    function validarConfirmacaoSenha(senha, confirmSenha) {
        return senha === confirmSenha;
    }

    function validarRole(role) {
        return [
            "administrador",
            "gestor",
            "financeiro"
        ].includes(role);
    }

    function validarCadastro(dados) {
        if (!validarNome(dados.nome)) {
            return "Preencha o nome";
        }

        if (!dados.email) {
            return "Preencha o email";
        }

        if (!validarEmail(dados.email)) {
            return "Informe um email válido";
        }

        if (!dados.senha) {
            return "Preencha a senha";
        }

        if (!dados.confirmSenha) {
            return "Confirme a senha";
        }

        if (!validarSenha(dados.senha)) {
            return "Senha deve ter no mínimo 8 caracteres";
        }

        if (!validarConfirmacaoSenha(
            dados.senha,
            dados.confirmSenha
        )) {
            return "As senhas não coincidem";
        }

        if (!validarRole(dados.role)) {
            return "Selecione um perfil válido";
        }

        return null;
    }

    function validarEdicao(dados) {
        if (!validarNome(dados.nome)) {
            return "Preencha o nome";
        }

        if (!dados.email) {
            return "Preencha o email";
        }

        if (!validarEmail(dados.email)) {
            return "Informe um email válido";
        }

        if (!validarRole(dados.role)) {
            return "Selecione um perfil válido";
        }

        return null;
    }

    window.UsuarioValidacao = Object.freeze({
        validarEmail,
        validarNome,
        validarSenha,
        validarConfirmacaoSenha,
        validarRole,
        validarCadastro,
        validarEdicao
    });
})();