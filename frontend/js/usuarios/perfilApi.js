(function () {
    "use strict";

    const API_URL = "http://localhost:3000/usuarios/perfil";

    async function obterPerfil() {

        const resposta = await fetch(API_URL, {
            method: "GET",
            headers: {...Autenticacao.obterCabecalhoAutorizacao()}
        });

        if (Autenticacao.tratarRespostaNaoAutorizada(resposta)) {
            return null;
        }

        if (!resposta.ok) {
            throw new Error("Erro ao buscar perfil");
        }

        return await resposta.json();
    }

    window.PerfilApi = Object.freeze({
        obterPerfil
    });
})();