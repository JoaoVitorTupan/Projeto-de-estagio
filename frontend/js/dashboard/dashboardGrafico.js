(function () {
    "use strict";

    const NS = "http://www.w3.org/2000/svg";
    const LARGURA = 960;
    const ALTURA = 320;
    const MARGEM = {esquerda: 78, direita: 12, topo: 12, base: 30};
    const TICKS_ALVO = 4;

    const formatadorCompacto = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: "compact",
        maximumFractionDigits: 1
    });

    const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    function criar(nome, atributos = {}) {
        const elemento = document.createElementNS(NS, nome);

        Object.entries(atributos).forEach(([chave, valor]) => {
            elemento.setAttribute(chave, String(valor));
        });

        return elemento;
    }

    function escalaAgradavel(maximo) {
        const bruto = maximo / TICKS_ALVO;
        const magnitude = Math.pow(10, Math.floor(Math.log10(bruto)));
        const normalizado = bruto / magnitude;

        let multiplicador = 10;

        if (normalizado <= 1) {
            multiplicador = 1;
        } else if (normalizado <= 2) {
            multiplicador = 2;
        } else if (normalizado <= 5) {
            multiplicador = 5;
        }

        const passo = multiplicador * magnitude;

        return {passo, topo: Math.ceil(maximo / passo) * passo};
    }

    function limpar(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    function exibirMensagem(container, texto) {
        limpar(container);

        const aviso = document.createElement("div");

        aviso.className = "estadoVazio";
        aviso.textContent = texto;

        container.appendChild(aviso);
    }

    function atualizarLegenda(legenda, mostrarReceitas, mostrarDespesas) {
        if (!legenda) {
            return;
        }

        limpar(legenda);

        const itens = [];

        if (mostrarReceitas) {
            itens.push(["#198754", "Receitas"]);
        }

        if (mostrarDespesas) {
            itens.push(["#dc3545", "Despesas"]);
        }

        itens.forEach(([cor, texto]) => {
            const item = document.createElement("span");
            const marcador = document.createElement("i");

            marcador.style.backgroundColor = cor;

            item.appendChild(marcador);
            item.appendChild(document.createTextNode(texto));

            legenda.appendChild(item);
        });
    }

    function renderizar(container, legenda, serie, opcoes) {
        const tipo = opcoes.tipo;
        const mes = String(opcoes.mes).padStart(2, "0");
        const diaDestacado = opcoes.diaDestacado || null;
        const mostrarReceitas = tipo !== "despesa";
        const mostrarDespesas = tipo !== "receita";

        if (!Array.isArray(serie) || serie.length === 0) {
            atualizarLegenda(legenda, false, false);
            exibirMensagem(container, "Nenhuma movimentação para exibir.");

            return;
        }

        const valores = [];

        serie.forEach((ponto) => {
            if (mostrarReceitas) {
                valores.push(Number(ponto.receitas) || 0);
            }

            if (mostrarDespesas) {
                valores.push(Number(ponto.despesas) || 0);
            }
        });

        const maximo = Math.max(...valores);

        if (!(maximo > 0)) {
            atualizarLegenda(legenda, false, false);
            exibirMensagem(container, "Nenhuma conta com vencimento neste período.");

            return;
        }

        atualizarLegenda(legenda, mostrarReceitas, mostrarDespesas);

        const {passo, topo} = escalaAgradavel(maximo);
        const larguraUtil = LARGURA - MARGEM.esquerda - MARGEM.direita;
        const alturaUtil = ALTURA - MARGEM.topo - MARGEM.base;
        const larguraFaixa = larguraUtil / serie.length;
        const barrasPorFaixa = mostrarReceitas && mostrarDespesas ? 2 : 1;
        const larguraBarra = Math.min(
            barrasPorFaixa === 2 ? larguraFaixa * 0.36 : larguraFaixa * 0.56,
            22
        );
        const baseY = MARGEM.topo + alturaUtil;

        const svg = criar("svg", {
            viewBox: `0 0 ${LARGURA} ${ALTURA}`,
            role: "img",
            "aria-label": "Receitas e despesas por dia de vencimento no mês selecionado"
        });

        for (let valor = 0; valor <= topo + passo / 1000; valor += passo) {
            const y = baseY - (valor / topo) * alturaUtil;

            svg.appendChild(criar("line", {
                x1: MARGEM.esquerda,
                x2: LARGURA - MARGEM.direita,
                y1: y,
                y2: y,
                class: valor === 0 ? "graficoEixo" : "graficoGrade"
            }));

            const rotulo = criar("text", {
                x: MARGEM.esquerda - 8,
                y: y + 4,
                "text-anchor": "end"
            });

            rotulo.textContent = valor === 0 ? "0" : formatadorCompacto.format(valor);

            svg.appendChild(rotulo);
        }

        serie.forEach((ponto, indice) => {
            const inicioFaixa = MARGEM.esquerda + indice * larguraFaixa;
            const centro = inicioFaixa + larguraFaixa / 2;
            const dia = String(ponto.dia).padStart(2, "0");
            const barras = [];

            if (mostrarReceitas) {
                barras.push({classe: "barraReceita", valor: Number(ponto.receitas) || 0, nome: "Receitas"});
            }

            if (mostrarDespesas) {
                barras.push({classe: "barraDespesa", valor: Number(ponto.despesas) || 0, nome: "Despesas"});
            }

            const larguraConjunto = larguraBarra * barras.length + (barras.length - 1) * 2;

            barras.forEach((barra, posicao) => {
                if (barra.valor <= 0) {
                    return;
                }

                const altura = Math.max((barra.valor / topo) * alturaUtil, 1);
                const x = centro - larguraConjunto / 2 + posicao * (larguraBarra + 2);

                const retangulo = criar("rect", {
                    x,
                    y: baseY - altura,
                    width: larguraBarra,
                    height: altura,
                    rx: 2,
                    class: barra.classe
                });

                const dica = criar("title");

                dica.textContent = `${dia}/${mes} - ${barra.nome}: ${formatadorMoeda.format(barra.valor)}`;

                retangulo.appendChild(dica);
                svg.appendChild(retangulo);
            });

            const rotuloDia = criar("text", {
                x: centro,
                y: baseY + 18,
                "text-anchor": "middle",
                class: diaDestacado === ponto.dia ? "graficoHoje" : ""
            });

            rotuloDia.textContent = dia;

            svg.appendChild(rotuloDia);
        });

        limpar(container);

        container.appendChild(svg);
    }

    window.DashboardGrafico = Object.freeze({
        renderizar,
        exibirMensagem,
        atualizarLegenda
    });
})();
