(function () {
    "use strict";

    const API_BASE =
        "http://localhost:3000/clientes-fornecedores";

    function obterCabecalhos(incluirJson = false) {
        const cabecalhos = {
            ...window.Autenticacao.obterCabecalhoAutorizacao()
        };

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
            return {
                autorizado: false,
                dados: resultado
            };
        }

        if (!resposta.ok) {
            throw new Error(
                resultado?.message ||
                resultado?.error ||
                "Não foi possível concluir a operação."
            );
        }

        return {
            autorizado: true,
            dados: resultado
        };
    }

    async function buscarTodos() {
        const resposta = await fetch(API_BASE, {
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

    async function alterarStatus(id, statusAtual) {
        if (statusAtual) {
            const resposta = await fetch(`${API_BASE}/inativar/${id}`, {
                method: "PATCH",
                headers: obterCabecalhos()
            });

            const resultado = await interpretarResposta(resposta);

            if (!resultado.autorizado) {
                return null;
            }

            return resultado.dados;
        }

        const resposta = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: obterCabecalhos(true),
            body: JSON.stringify({ status: true })
        });

        const resultado = await interpretarResposta(resposta);

        if (!resultado.autorizado) {
            return null;
        }

        return resultado.dados;
    }

    async function buscarEnderecoPorCep(cep) {
        const numeros =
            window.ClienteFornecedorFormatadores.somenteNumeros(cep);

        const resposta =
            await fetch(`https://viacep.com.br/ws/${numeros}/json/`);

        if (!resposta.ok) {
            throw new Error("Erro na consulta do CEP.");
        }

        const dados = await resposta.json();

        if (dados.erro) {
            throw new Error("CEP não encontrado.");
        }

        return dados;
    }

    window.ClienteFornecedorAPI = Object.freeze({
        API_BASE,
        buscarTodos,
        cadastrar,
        atualizar,
        alterarStatus,
        buscarEnderecoPorCep
    });
})();