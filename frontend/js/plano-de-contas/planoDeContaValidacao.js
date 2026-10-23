(function () {
    "use strict";

    function validarNome(nome) {
        const valor = String(nome ?? "").trim();

        return (valor.length >= 2 && valor.length <= 150);
    }

    function validarDescricao(descricao) {
        const valor = String(descricao ?? "").trim();

        return valor.length <= 500;
    }

    function validarDadosPrincipais() {
        const formulario = window.PlanoDeContaFormulario;
        const campos = formulario.obterCampos();
        
        let valido = true;

        const nome = campos.nome?.value.trim() || "";
        const descricao = campos.descricao?.value.trim() || "";

        if (!nome) {
            formulario.mostrarErro("nome", "Informe o nome do plano de contas.");

            valido = false;
        } else if (!validarNome(nome)) {
            formulario.mostrarErro("nome", "O nome deve possuir entre 2 e 150 caracteres.");

            valido = false;
        } else {
            formulario.removerErro("nome");
        }

        if (!validarDescricao(descricao)) {
            formulario.mostrarErro("descricao", "A descrição deve possuir no máximo 500 caracteres.");

            valido = false;
        } else {
            formulario.removerErro("descricao");
        }

        return valido;
    }

    function validarFormulario() {
        return validarDadosPrincipais();
    }

    window.PlanoDeContaValidacao = Object.freeze({
        validarNome,
        validarDescricao,
        validarDadosPrincipais,
        validarFormulario
    });
})();