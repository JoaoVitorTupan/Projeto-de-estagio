(function () {
    "use strict";

    const Formatadores = window.ContaFormatadores;
    const DOM = window.DOM;

    const CAMINHO_CONTAS = "../contas/conta.html";

    function plural(quantidade, singular, pluralTexto) {
        return quantidade === 1 ? singular : pluralTexto;
    }

    function escaparHTML(valor) {
        const div = document.createElement("div");

        div.textContent = String(valor ?? "");

        return div.innerHTML;
    }

    function definirDetalhe(id, linhas) {
        const elemento = DOM.obterElemento(id);

        if (!elemento) {
            return;
        }

        elemento.textContent = "";

        linhas.forEach((linha, indice) => {
            if (indice > 0) {
                elemento.appendChild(document.createElement("br"));
            }

            elemento.appendChild(document.createTextNode(linha));
        });
    }

    function definirValor(id, texto, classe = "") {
        const elemento = DOM.obterElemento(id);

        if (!elemento) {
            return;
        }

        elemento.textContent = texto;
        elemento.classList.remove("valorNegativo", "valorPositivo");

        if (classe) {
            elemento.classList.add(classe);
        }
    }

    function limparResumo() {
        [
            "totalAPagar",
            "totalAReceber",
            "totalVencido",
            "saldoProjetado",
            "qtdPendentes",
            "qtdPagas",
            "qtdRecebidas",
            "qtdVencidas"
        ].forEach((id) => definirValor(id, "-"));

        [
            "detalheAPagar",
            "detalheAReceber",
            "detalheVencido",
            "detalheSaldo",
            "detalhePagas",
            "detalheRecebidas"
        ].forEach((id) => definirDetalhe(id, []));
    }

    function preencherResumo(dados) {
        const resumo = dados.resumo;
        const indicadores = dados.indicadores;

        definirValor("totalAPagar", Formatadores.formatarValor(resumo.totalAPagar));
        definirDetalhe("detalheAPagar", [
            `${resumo.quantidadeAPagar} ${plural(resumo.quantidadeAPagar, "despesa pendente", "despesas pendentes")}`
        ]);

        definirValor("totalAReceber", Formatadores.formatarValor(resumo.totalAReceber));
        definirDetalhe("detalheAReceber", [
            `${resumo.quantidadeAReceber} ${plural(resumo.quantidadeAReceber, "receita pendente", "receitas pendentes")}`
        ]);

        definirValor("totalVencido", Formatadores.formatarValor(resumo.totalVencido));
        definirDetalhe("detalheVencido", [
            `A pagar: ${Formatadores.formatarValor(resumo.totalVencidoAPagar)}`,
            `A receber: ${Formatadores.formatarValor(resumo.totalVencidoAReceber)}`
        ]);

        let classeSaldo = "";

        if (resumo.saldoProjetado < 0) {
            classeSaldo = "valorNegativo";
        } else if (resumo.saldoProjetado > 0) {
            classeSaldo = "valorPositivo";
        }

        definirValor("saldoProjetado", Formatadores.formatarValor(resumo.saldoProjetado), classeSaldo);
        definirDetalhe("detalheSaldo", [
            `Receitas ${Formatadores.formatarValor(resumo.receitasPrevistas)} − despesas ${Formatadores.formatarValor(resumo.despesasPrevistas)}`,
            "Projeção por vencimento, não é saldo bancário."
        ]);

        definirValor("qtdPendentes", String(indicadores.pendentes));
        definirValor("qtdPagas", String(indicadores.pagas));
        definirDetalhe("detalhePagas", [Formatadores.formatarValor(resumo.totalPago)]);
        definirValor("qtdRecebidas", String(indicadores.recebidas));
        definirDetalhe("detalheRecebidas", [Formatadores.formatarValor(resumo.totalRecebido)]);
        definirValor("qtdVencidas", String(indicadores.vencidas));
    }

    function criarAlerta(nivel, texto, comLink) {
        const alerta = document.createElement("div");
        const mensagem = document.createElement("span");

        alerta.className = `alerta ${nivel}`;
        mensagem.textContent = texto;

        alerta.appendChild(mensagem);

        if (comLink) {
            const link = document.createElement("a");

            link.href = CAMINHO_CONTAS;
            link.textContent = "Ver contas";

            alerta.appendChild(link);
        }

        return alerta;
    }

    function descreverTotais(totais) {
        const partes = [];

        if (totais.quantidadeAPagar > 0) {
            partes.push(`${totais.quantidadeAPagar} a pagar (${Formatadores.formatarValor(totais.totalAPagar)})`);
        }

        if (totais.quantidadeAReceber > 0) {
            partes.push(`${totais.quantidadeAReceber} a receber (${Formatadores.formatarValor(totais.totalAReceber)})`);
        }

        return partes.join(" e ");
    }

    function renderizarAlertas(container, dados, nomePeriodo) {
        container.textContent = "";

        const alertas = dados.alertas;
        const resumo = dados.resumo;
        const itens = [];

        if (alertas.vencidas.quantidade > 0) {
            itens.push(criarAlerta(
                "alertaPerigo",
                `${alertas.vencidas.quantidade} ${plural(alertas.vencidas.quantidade, "conta vencida", "contas vencidas")}: ${descreverTotais(alertas.vencidas)}.`,
                true
            ));
        }

        if (alertas.vencendoEmBreve.quantidade > 0) {
            itens.push(criarAlerta(
                "alertaAtencao",
                `${alertas.vencendoEmBreve.quantidade} ${plural(alertas.vencendoEmBreve.quantidade, "conta vence", "contas vencem")} nos próximos ${alertas.vencendoEmBreve.dias} dias: ${descreverTotais(alertas.vencendoEmBreve)}.`,
                true
            ));
        }

        if (dados.indicadores.totalContas > 0 && resumo.saldoProjetado < 0) {
            itens.push(criarAlerta(
                "alertaAtencao",
                `Saldo projetado negativo em ${nomePeriodo}: ${Formatadores.formatarValor(resumo.saldoProjetado)}.`,
                false
            ));
        }

        if (alertas.cadastrosInativos > 0) {
            itens.push(criarAlerta(
                "",
                `${alertas.cadastrosInativos} ${plural(alertas.cadastrosInativos, "conta pendente está vinculada", "contas pendentes estão vinculadas")} a cliente, fornecedor ou plano de contas inativo.`,
                true
            ));
        }

        if (itens.length === 0) {
            itens.push(criarAlerta("alertaNeutro", "Nenhum alerta no momento.", false));
        }

        itens.forEach((item) => container.appendChild(item));
    }

    function exibirErroAlertas(container) {
        container.textContent = "";
        container.appendChild(criarAlerta("alertaNeutro", "Não foi possível carregar os alertas.", false));
    }

    function textoPrazo(dias) {
        if (dias === 0) {
            return "Vence hoje";
        }

        if (dias === 1) {
            return "Vence amanhã";
        }

        return `Em ${dias} dias`;
    }

    function linhaUnica(tbody, texto) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="tabela-vazia">
                    ${escaparHTML(texto)}
                </td>
            </tr>
        `;
    }

    function renderizarVencimentos(tbody, lista, tipo) {
        const filtrados = (lista || []).filter((conta) => tipo === "todos" || conta.tipo === tipo);

        if (filtrados.length === 0) {
            linhaUnica(tbody, "Nenhum vencimento pendente neste período.");

            return;
        }

        tbody.innerHTML = "";

        filtrados.forEach((conta) => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
                <td>
                    ${escaparHTML(Formatadores.formatarTipo(conta.tipo))}
                </td>
                <td>
                    ${escaparHTML(Formatadores.formatarDescricao(conta.descricao))}
                </td>
                <td>
                    ${escaparHTML(Formatadores.formatarNomePessoa(conta.clienteOuFornecedor))}
                </td>
                <td>
                    ${escaparHTML(Formatadores.formatarValor(conta.valor))}
                </td>
                <td>
                    ${escaparHTML(Formatadores.formatarData(conta.data_vencimento))}
                </td>
                <td>
                    ${escaparHTML(textoPrazo(conta.diasParaVencer))}
                </td>
            `;

            tbody.appendChild(linha);
        });
    }

    function exibirCarregandoVencimentos(tbody) {
        linhaUnica(tbody, "Carregando...");
    }

    function exibirErroVencimentos(tbody, mensagem) {
        linhaUnica(tbody, `Não foi possível carregar os vencimentos. ${mensagem || ""}`.trim());
    }

    window.DashboardRender = Object.freeze({
        limparResumo,
        preencherResumo,
        renderizarAlertas,
        exibirErroAlertas,
        renderizarVencimentos,
        exibirCarregandoVencimentos,
        exibirErroVencimentos
    });
})();
