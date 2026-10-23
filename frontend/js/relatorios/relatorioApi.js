(function () {

    "use strict";

    const API_BASE = "http://localhost:3000/relatorios";

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

    async function buscarOpcoes() {
        const resposta = await fetch(`${API_BASE}/opcoes`, {
            method: "GET",
            headers: obterCabecalhos()
        });
        const resultado = await interpretarResposta(resposta);

        if (!resultado.autorizado) {
            return null;
        }

        return resultado.dados;
    }

    function montarQuery(filtros = {}) {
        const parametros = new URLSearchParams();

        Object.entries(filtros).forEach(([chave, valor]) => {
            if (valor === undefined || valor === null || valor === "") {
                return;
            }
            
            parametros.set(chave,String(valor));
        });

        const query = parametros.toString();

        return query? `?${query}`: "";
    }

    async function buscarRelatorio(filtros = {}) {
        const query = montarQuery(filtros);

        const resposta = await fetch(`${API_BASE}/contas${query}`, {
            method: "GET",
            headers: obterCabecalhos()
        });
        const resultado = await interpretarResposta(resposta);

        if (!resultado.autorizado) {
            return null;
        }

        return resultado.dados;
    }

    async function baixarArquivo(tipo, filtros = {}) {
        const query = montarQuery(filtros);
        const resposta = await fetch(`${API_BASE}/contas/${tipo}${query}`, {
            method: "GET",
            headers: obterCabecalhos()
        });

        if (window.Autenticacao.tratarRespostaNaoAutorizada(resposta)) {
            return null;
        }

        if (!resposta.ok) {
            let mensagem = "Não foi possível gerar o arquivo.";

            try {
                const dados = await resposta.json();

                mensagem = dados?.error || dados?.message || mensagem;
            } catch {

            }

            throw new Error(mensagem);
        }

        const blob = await resposta.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = tipo === "pdf"? "relatorio-contas.pdf": "relatorio-contas.xlsx";

        document.body.appendChild(link);

        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        return true;
    }

    async function gerarPDF(filtros = {}) {
        return await baixarArquivo("pdf", filtros);
    }

    async function gerarExcel(filtros = {}) {
        return await baixarArquivo("excel", filtros);
    }

    window.RelatorioAPI = Object.freeze({
        API_BASE,
        buscarOpcoes,
        buscarRelatorio,
        gerarPDF,
        gerarExcel
    });
})();