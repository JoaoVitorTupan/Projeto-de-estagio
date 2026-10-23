(function () {
    "use strict";

    const API_BASE = "http://localhost:3000/dashboard";

    function obterCabecalhos() {
        return {...window.Autenticacao.obterCabecalhoAutorizacao()};
    }

    async function interpretarResposta(resposta) {
        let dados = null;

        try {
            dados = await resposta.json();
        } catch {
            dados = null;
        }

        if (window.Autenticacao.tratarRespostaNaoAutorizada(resposta)) {
            return {autorizado: false, dados};
        }

        if (!resposta.ok) {
            throw new Error(dados?.message || dados?.error || "Não foi possível concluir a operação.");
        }

        return {autorizado: true, dados};
    }

    async function buscar(mes, ano) {
        const parametros = new URLSearchParams({mes: String(mes), ano: String(ano)});

        const resposta = await fetch(`${API_BASE}?${parametros.toString()}`, {
            method: "GET",
            headers: obterCabecalhos()
        });
        const resultado = await interpretarResposta(resposta);

        if (!resultado.autorizado) {
            return null;
        }

        return resultado.dados;
    }

    window.DashboardAPI = Object.freeze({
        API_BASE,
        buscar
    });
})();
