(function () {
    "use strict";

    const API_URL = "http://localhost:3000/usuarios";

    function obterCabecalhos(incluirJSON = false) {
        return {
            ...(incluirJSON ? { "Content-Type": "application/json" } : {}),
            ...window.Autenticacao.obterCabecalhoAutorizacao()
        };
    }

    async function processarResposta(resposta, mensagemErro) {
        if (window.Autenticacao.tratarRespostaNaoAutorizada(resposta)) {
            return null;
        }

        const dados = await resposta.json().catch(() => null);

        if (!resposta.ok) {
            throw new Error(dados?.error || dados?.message || mensagemErro);
        }

        return dados;
    }

    async function listarUsuarios() {
        const resposta = await fetch(API_URL, {
            method: "GET",
            headers: obterCabecalhos()
        });

        return processarResposta(resposta, "Erro ao buscar usuários.");
    }

    async function cadastrarUsuario(dados) {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: obterCabecalhos(true),
            body: JSON.stringify(dados)
        });

        return processarResposta(resposta, "Erro ao cadastrar usuário.");
    }

    async function atualizarUsuario(id, dados) {
        const resposta = await fetch(
            `${API_URL}/${encodeURIComponent(id)}`,
            {
                method: "PUT",
                headers: obterCabecalhos(true),
                body: JSON.stringify(dados)
            }
        );

        return processarResposta(resposta, "Erro ao atualizar usuário.");
    }

    async function alterarStatusUsuario(id, novoStatus) {
        const usuarioId = encodeURIComponent(id);
        const url = novoStatus
            ? `${API_URL}/reativar/${usuarioId}`
            : `${API_URL}/${usuarioId}`;

        const resposta = await fetch(url, {
            method: novoStatus ? "PATCH" : "DELETE",
            headers: obterCabecalhos()
        });

        return processarResposta(
            resposta,
            novoStatus
                ? "Erro ao reativar usuário."
                : "Erro ao inativar usuário."
        );
    }

    window.UsuarioApi = Object.freeze({
        listarUsuarios,
        cadastrarUsuario,
        atualizarUsuario,
        alterarStatusUsuario
    });
})();