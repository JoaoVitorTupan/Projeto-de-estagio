document.addEventListener(
    "DOMContentLoaded",
    async () => {
        "use strict";

        const CAMINHO_JS = "../../js/relatorios/";
        const CAMINHO_UTILS = "../../js/utils/";

        function carregarScript(id, src) {
            return new Promise((resolve, reject) => {
                const existente = document.getElementById(id);

                if (existente) {
                    if (existente.dataset.carregado ==="true") {
                        resolve();
                        return;
                    }
                        
                    existente.addEventListener("load", resolve, {
                        once: true
                    });

                    existente.addEventListener("error", () => {
                        reject(new Error(`Não foi possível carregar ${src}.`));
                    }, {
                        once: true
                    });

                    return;
                }

                const script = document.createElement("script");

                script.id = id;
                script.src = src;
                script.async = false;

                script.addEventListener("load", () => {
                    script.dataset.carregado = "true"; resolve();}, {
                        once: true
                    }
                );

                script.addEventListener("error", () => {
                    reject(new Error(`Não foi possível carregar ${src}.`));
                }, {
                    once: true
                });

                document.body.appendChild(
                    script
                );
            });
        }

        const dependencias = [{
            id: "utilAutenticacao",
            src: `${CAMINHO_UTILS}autenticacao.js`
        }, {
            id: "relatorioApi",
            src: `${CAMINHO_JS}relatorioApi.js`
        }];

        async function carregarDependencias() {

            for (const dependencia of dependencias) {
                await carregarScript(
                    dependencia.id,
                    dependencia.src
                );
            }
        }

        try {
            await carregarDependencias();
        } catch (erro) {
            console.error("Dependências do módulo de relatórios não foram carregadas.", erro);

            return;
        }

        const Autenticacao = window.Autenticacao;
        const API = window.RelatorioAPI;

        if (!Autenticacao || !API) {
            console.error("Dependências do módulo de relatórios não foram carregadas.");

            return;
        }

        if (!Autenticacao.estaAutenticado()) {
            Autenticacao.redirecionarParaLogin();
            return;
        }

        if (!Autenticacao.validarAcessoPagina("relatorios")) {
            return;
        }

        Autenticacao.sincronizarPerfil().catch(() => {});


        const campoDataInicial = document.getElementById("dataInicial");
        const campoDataFinal = document.getElementById("dataFinal");
        const campoCliente = document.getElementById("clienteOuFornecedor");
        const campoPlano = document.getElementById("planoDeConta");
        const campoTipo = document.getElementById("tipo");
        const campoStatus = document.getElementById("status");
        const campoUsuario = document.getElementById("usuario");
        const campoValorMinimo = document.getElementById("valorMinimo");
        const campoValorMaximo = document.getElementById("valorMaximo");
        const campoOrdenarPor = document.getElementById("ordenarPor");
        const campoOrdem = document.getElementById("ordem");
        const botaoVisualizar = document.getElementById("botaoVisualizar");
        const botaoPDF = document.getElementById("botaoPDF");
        const botaoExcel = document.getElementById("botaoExcel");
        const botaoLimpar = document.getElementById("botaoLimpar");
        const tabela = document.getElementById("tabelaRelatorio");
        const mensagem = document.getElementById("mensagem");
        const totalContas = document.getElementById("totalContas");
        const totalReceitas = document.getElementById("totalReceitas");
        const totalDespesas = document.getElementById("totalDespesas");
        const totalAberto = document.getElementById("totalAberto");
        const totalVencido = document.getElementById("totalVencido");
        const totalPago = document.getElementById("totalPago");
        const totalRecebido = document.getElementById("totalRecebido");
        const saldo = document.getElementById("saldo");

        function formatarMoeda(valor) {
            return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL"
            }).format(Number(valor || 0));
        }

        function formatarData(data) {
            if (!data) {
                return "-";
            }

            const texto = String(data).substring(0, 10);
            const partes = texto.split("-");

            if (partes.length !== 3) {
                return texto;
            }

            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }

        function escaparHTML(valor) {
            const div = document.createElement("div");
            div.textContent = String(valor ?? "");

            return div.innerHTML;
        }

        function nomeTipo(tipo) {
            return tipo === "receita"? "Receita": "Despesa";
        }

        function nomeStatus(status) {
            switch (status) {
                case "aberto": return "Em aberto";
                case "vencido": return "Vencido";
                case "pago": return "Pago";
                case "recebido": return "Recebido";
                default: return status || "-";
            }
        }

        function adicionarOpcao(campo, valor, texto) {
            if (!campo) {
                return;
            }

            const option = document.createElement("option");

            option.value = valor;
            option.textContent = texto;

            campo.appendChild(option);
        }

        async function carregarOpcoes() {
            try {
                const dados = await API.buscarOpcoes();

                if (dados === null) {
                    return;
                }

                campoCliente.innerHTML = "";

                adicionarOpcao(campoCliente, "", "Todos");

                dados.clientesFornecedores?.forEach((registro) => {
                    adicionarOpcao(campoCliente, registro.id, `${registro.nome} - ${
                        registro.tipo === "cliente"? "Cliente": "Fornecedor"
                    }`);
                });

                campoPlano.innerHTML = "";

                adicionarOpcao(campoPlano, "", "Todos");

                dados.planos?.forEach((plano) => {
                    adicionarOpcao(campoPlano, plano.id, plano.nome);
                });

                campoUsuario.innerHTML = "";

                adicionarOpcao(campoUsuario, "", "Todos");

                dados.usuarios?.forEach((usuario) => {
                    adicionarOpcao(campoUsuario, usuario.id, `${
                        usuario.nome
                    } - ${
                        usuario.email
                    }`);
                });
            } catch (erro) {
                console.error("Erro ao carregar filtros:", erro);

                exibirMensagem(erro.message, true);
            }
        }

        function obterFiltros() {
            const filtros = {};

            if (campoDataInicial.value) {
                filtros.dataInicial = campoDataInicial.value;
            }

            if (campoDataFinal.value) {
                filtros.dataFinal = campoDataFinal.value;
            }

            if (campoCliente.value) {
                filtros.clienteOuFornecedorId = campoCliente.value;
            }

            if (campoPlano.value) {
                filtros.planoDeContaId = campoPlano.value;
            }

            if (campoTipo.value) {
                filtros.tipo = campoTipo.value;
            }

            if (campoStatus.value) {
                filtros.status = campoStatus.value;
            }

            if (campoUsuario.value) {
                filtros.usuarioId = campoUsuario.value;
            }

            if (campoValorMinimo.value) {
                filtros.valorMinimo = campoValorMinimo.value;
            }

            if (campoValorMaximo.value) {
                filtros.valorMaximo = campoValorMaximo.value;
            }

            if (campoOrdenarPor.value) {
                filtros.ordenarPor = campoOrdenarPor.value;
            }

            if (campoOrdem.value) {
                filtros.ordem = campoOrdem.value;
            }

            return filtros;
        }

        function validarFiltros() {
            if (campoDataInicial.value && campoDataFinal.value && campoDataInicial.value > campoDataFinal.value) {
                exibirMensagem("A data inicial não pode ser maior que a data final.", true);

                return false;
            }

            if (
                campoValorMinimo.value &&
                campoValorMaximo.value &&
                Number(campoValorMinimo.value) >
                Number(campoValorMaximo.value)
            ) {
                exibirMensagem("O valor mínimo não pode ser maior que o valor máximo.", true);

                return false;
            }

            return true;
        }

        function exibirMensagem(texto, erro = false) {
            if (!mensagem) {
                return;
            }

            mensagem.textContent = texto || "";
            mensagem.className = erro? "mensagem erro": "mensagem sucesso";
        }

        function limparMensagem() {
            if (mensagem) {
                mensagem.textContent = "";
                mensagem.className = "mensagem";
            }
        }

        function atualizarResumo(resumo) {
            const dadosResumo = resumo || {};

            totalContas.textContent = dadosResumo.totalContas || 0;
            totalReceitas.textContent = formatarMoeda(dadosResumo.totalReceitas);
            totalDespesas.textContent = formatarMoeda(dadosResumo.totalDespesas);
            totalAberto.textContent = formatarMoeda(dadosResumo.totalAberto);
            totalVencido.textContent = formatarMoeda(dadosResumo.totalVencido);
            totalPago.textContent = formatarMoeda(dadosResumo.totalPago);
            totalRecebido.textContent = formatarMoeda(dadosResumo.totalRecebido);
            saldo.textContent = formatarMoeda(dadosResumo.saldo);
        }

        function renderizarTabela(contas) {
            tabela.innerHTML = "";

            if (!Array.isArray(contas) || contas.length === 0) {
                tabela.innerHTML = `
                    <tr>
                        <td colspan="8" class="tabela-vazia">
                            Nenhuma conta encontrada
                            com os filtros informados.
                        </td>
                    </tr>
                `;

                return;
            }

            contas.forEach((conta) => {
                const linha = document.createElement("tr");
                
                linha.innerHTML = `
                    <td>
                        ${escaparHTML(
                            nomeTipo(
                                conta.tipo
                            )
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            conta.descricao
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            formatarMoeda(
                                conta.valor
                            )
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            conta
                                .clienteOuFornecedor
                                ?.nome ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            conta
                                .planoDeConta
                                ?.nome ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            formatarData(
                                conta.data_vencimento
                            )
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            nomeStatus(
                                conta.status
                            )
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            conta
                                .usuario
                                ?.nome ||
                            "-"
                        )}
                    </td>

                `;

                tabela.appendChild(linha);
            });
        }

        async function visualizarRelatorio() {
            limparMensagem();

            if (!validarFiltros()) {
                return;
            }

            botaoVisualizar.disabled = true;
            botaoVisualizar.textContent = "Carregando...";

            try {
                const filtros = obterFiltros();
                const resultado = await API.buscarRelatorio(filtros);

                if (resultado === null) {
                    return;
                }

                atualizarResumo(resultado.resumo);
                renderizarTabela(resultado.contas);
                exibirMensagem(`${resultado.resumo?.totalContas || 0} conta(s) encontrada(s).`);
            } catch (erro) {
                console.error("Erro ao visualizar relatório:", erro);

                exibirMensagem(erro.message || "Não foi possível gerar o relatório.", true);
            } finally {
                botaoVisualizar.disabled = false;
                botaoVisualizar.textContent = "Visualizar relatório";
            }
        }

        async function gerarPDF() {
            limparMensagem();

            if (!validarFiltros()) {
                return;
            }

            botaoPDF.disabled = true;
            botaoPDF.textContent = "Gerando PDF...";

            try {
                const filtros = obterFiltros();
                const resultado = await API.gerarPDF(filtros);

                if (resultado === null) {
                    return;
                }

                exibirMensagem("PDF gerado com sucesso.");
            } catch (erro) {
                console.error("Erro ao gerar PDF:", erro);

                exibirMensagem(erro.message || "Não foi possível gerar o PDF.", true);
            } finally {
                botaoPDF.disabled = false;
                botaoPDF.textContent = "Gerar PDF";
            }
        }

        async function gerarExcel() {
            limparMensagem();

            if (!validarFiltros()) {
                return;
            }

            botaoExcel.disabled = true;
            botaoExcel.textContent = "Gerando Excel...";

            try {
                const filtros = obterFiltros();
                const resultado = await API.gerarExcel(filtros);

                if (resultado === null) {
                    return;
                }

                exibirMensagem("Excel gerado com sucesso.");
            } catch (erro) {
                console.error("Erro ao gerar Excel:", erro);

                exibirMensagem(erro.message || "Não foi possível gerar o Excel.", true);
            } finally {
                botaoExcel.disabled = false;
                botaoExcel.textContent = "Exportar Excel";
            }
        }

        function limparFiltros() {
            campoDataInicial.value = "";
            campoDataFinal.value = "";
            campoCliente.value = "";
            campoPlano.value = "";
            campoTipo.value = "";
            campoStatus.value = "";
            campoUsuario.value = "";
            campoValorMinimo.value = "";
            campoValorMaximo.value = "";
            campoOrdenarPor.value = "data_vencimento";
            campoOrdem.value = "asc";
            totalContas.textContent = "0";
            totalReceitas.textContent = "R$ 0,00";
            totalDespesas.textContent = "R$ 0,00";
            totalAberto.textContent = "R$ 0,00";
            totalVencido.textContent = "R$ 0,00";
            totalPago.textContent = "R$ 0,00";
            totalRecebido.textContent = "R$ 0,00";
            saldo.textContent = "R$ 0,00";
            tabela.innerHTML = `
                <tr>
                    <td colspan="8" class="tabela-vazia">
                        Utilize os filtros
                        para visualizar o relatório.
                    </td>
                </tr>
            `;

            limparMensagem();
        }

        botaoVisualizar?.addEventListener("click", visualizarRelatorio);
        botaoPDF?.addEventListener("click", gerarPDF);
        botaoExcel?.addEventListener("click", gerarExcel);
        botaoLimpar?.addEventListener("click", limparFiltros);

        await carregarOpcoes();
    }
);