"use strict";

const API_BASE = "http://localhost:3000/contas";

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
        throw new Error(resultado?.message || resultado?.error || "Não foi possível concluir a operação.");
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

async function buscarPorId(id) {
    const resposta = await fetch(`${API_BASE}/${id}`, {
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
    const dadosCadastro = {
        tipo: dados.tipo,
        descricao: dados.descricao,
        valor: dados.valor,
        data_vencimento: dados.data_vencimento,
        cliente_ou_fornecedor_id: dados.cliente_ou_fornecedor_id,
        plano_de_conta_id: dados.plano_de_conta_id
    };

    const resposta = await fetch(API_BASE, {
        method: "POST",
        headers: obterCabecalhos(true),
        body: JSON.stringify(dadosCadastro)
    });

    const resultado = await interpretarResposta(resposta);

    if (!resultado.autorizado) {
        return null;
    }

    return resultado.dados;
}

async function atualizar(id, dados) {
    const dadosAtualizacao = {
        tipo: dados.tipo,
        descricao: dados.descricao,
        valor: dados.valor,
        data_vencimento: dados.data_vencimento,
        cliente_ou_fornecedor_id: dados.cliente_ou_fornecedor_id,
        plano_de_conta_id: dados.plano_de_conta_id
    };

    const resposta = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: obterCabecalhos(true),
        body: JSON.stringify(dadosAtualizacao)
    });

    const resultado = await interpretarResposta(resposta);

    if (!resultado.autorizado) {
        return null;
    }

    return resultado.dados;
}

async function pagar(id) {
    const resposta = await fetch(`${API_BASE}/${id}/pagar`, {
        method: "PUT",
        headers: obterCabecalhos()
    });

    const resultado = await interpretarResposta(resposta);

    if (!resultado.autorizado) {
        return null;
    }

    return resultado.dados;
}

async function receber(id) {
    const resposta = await fetch(`${API_BASE}/${id}/receber`, {
        method: "PUT",
        headers: obterCabecalhos()
    });

    const resultado = await interpretarResposta(resposta);

    if (!resultado.autorizado) {
        return null;
    }

    return resultado.dados;
}

async function excluir(id) {
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

window.ContaAPI = Object.freeze({
    API_BASE,

    buscarTodos,
    buscarPorId,
    cadastrar,
    atualizar,
    pagar,
    receber,
    excluir
});