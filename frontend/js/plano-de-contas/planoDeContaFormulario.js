(function () {
    "use strict";

    let camposCache = null;

    function obterCampos() {
        if (camposCache) {
            return camposCache;
        }

        camposCache = {
            nome: document.getElementById("nome"),
            descricao: document.getElementById("descricao"),
            nomeErro: document.getElementById("nomeErro"),
            descricaoErro: document.getElementById("descricaoErro")
        };

        return camposCache;
    }

    function limparCache() {
        camposCache = null;
    }

    function obterDados() {
        const campos = obterCampos();

        return {
            nome: campos.nome?.value.trim() || "",
            descricao: campos.descricao?.value.trim() || ""
        };
    }

    function limparErros() {
        document.querySelectorAll("#modalOverlay .error-message").forEach((elemento) => {
            elemento.classList.remove("active");
        });

        document.querySelectorAll("#modalOverlay input, #modalOverlay textarea").forEach((campo) => {
            campo.classList.remove("error");
        });
    }

    function preencherDados(registro) {
        if (!registro) {
            return;
        }

        const campos = obterCampos();

        if (campos.nome) {
            campos.nome.value = registro.nome || "";
        }

        if (campos.descricao) {
            campos.descricao.value = registro.descricao || "";
        }

        limparErros();
    }

    function limparFormulario() {
        const campos = obterCampos();

        if (campos.nome) {
            campos.nome.value = "";
        }

        if (campos.descricao) {
            campos.descricao.value = "";
        }

        limparErros();
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

    window.PlanoDeContaFormulario = Object.freeze({
        obterCampos,
        limparCache,
        obterDados,
        limparErros,
        preencherDados,
        limparFormulario,
        mostrarErro,
        removerErro
    });
})();