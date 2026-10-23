(function () {
    "use strict";

    const API_BASE = "http://localhost:3000/planos-de-conta";

    function obterCabecalhos(incluirJson = false) {
        const cabecalhos = {...window.Autenticacao.obterCabecalhoAutorizacao()};

        if (incluirJson) {
            cabecalhos["Content-Type"] = "application/json";
        }

        return cabecalhos;
    }

    async function interpretarResposta(resposta) {
        let resultado = null;

        try {
            resultado = await resposta.json();
        } catch {
            resultado = null;
        }

        if (window.Autenticacao.tratarRespostaNaoAutorizada(resposta)) {
            return {autorizado: false, dados: resultado};
        }

        if (!resposta.ok) {
            throw new Error(
                resultado?.message ||
                resultado?.error ||
                "Não foi possível concluir a operação."
            );
        }

        return {autorizado: true, dados: resultado};
    }

    async function buscarTodos() {
        const resposta = await fetch(API_BASE, {
            method: "GET", 
            headers: obterCabecalhos()
        });

        const resultado = await interpretarResposta(resposta);

        if (!resultado.autorizado) {
            return null;
        }

        return resultado.dados;
    }

    async function cadastrar(dados) {
        const resposta = await fetch(API_BASE, {
            method: "POST",
            headers: obterCabecalhos(true),
            body: JSON.stringify(dados)
        });

        const resultado = await interpretarResposta(resposta);

        if (!resultado.autorizado) {
            return null;
        }

        return resultado.dados;
    }

    async function atualizar(id, dados) {
        const resposta = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: obterCabecalhos(true),
            body: JSON.stringify(dados)
        });

        const resultado = await interpretarResposta(resposta);

        if (!resultado.autorizado) {
            return null;
        }

        return resultado.dados;
    }

    async function inativar(id) {
        const resposta = await fetch(`${API_BASE}/${id}`, {
            method: "DELETE",
            headers: obterCabecalhos()
        });

        const resultado = await interpretarResposta(resposta);

        if (!resultado.autorizado) {
            return null;
        }

        return resultado.dados;
    }

    async function reativar(id) {
        const resposta = await fetch(`${API_BASE}/reativar/${id}`, {
            method: "PATCH",
            headers: obterCabecalhos()
        });

        const resultado = await interpretarResposta(resposta);

        if (!resultado.autorizado) {
            return null;
        }

        return resultado.dados;
    }

    window.PlanoDeContaAPI = Object.freeze({
        API_BASE,
        buscarTodos,
        cadastrar,
        atualizar,
        inativar,
        reativar
    });
})();