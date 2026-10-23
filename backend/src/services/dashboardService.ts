import contaRepository from "../repositories/contaRepository";
import { Conta, StatusConta } from "../entities/conta";
import { BadRequestError } from "../utils/api-erros";

export interface FiltrosDashboard {
    mes?: number;
    ano?: number;
}

const DIAS_ALERTA_VENCIMENTO = 7;
const LIMITE_PROXIMOS_VENCIMENTOS = 10;
const ANO_MINIMO = 2000;
const ANO_MAXIMO = 2100;

interface TotaisPorTipo {
    quantidade: number;
    total: number;
    quantidadeAPagar: number;
    totalAPagar: number;
    quantidadeAReceber: number;
    totalAReceber: number;
}

export class DashboardService {
    private textoData(data: Date | string): string {
        return String(data).substring(0, 10);
    }

    private formatarDataLocal(data: Date): string {
        const ano = String(data.getFullYear()).padStart(4, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    private arredondar(valor: number): number {
        return Math.round((valor + Number.EPSILON) * 100) / 100;
    }

    private diasEntre(dataInicial: string, dataFinal: string): number {
        const [anoA, mesA, diaA] = dataInicial.split("-").map(Number);
        const [anoB, mesB, diaB] = dataFinal.split("-").map(Number);
        const inicio = Date.UTC(anoA, mesA - 1, diaA);
        const fim = Date.UTC(anoB, mesB - 1, diaB);

        return Math.round((fim - inicio) / 86400000);
    }

    private statusEfetivo(conta: Conta, hoje: string): StatusConta {
        if (conta.status === "pago" || conta.status === "recebido") {
            return conta.status;
        }

        return this.textoData(conta.data_vencimento) < hoje ? "vencido" : "aberto";
    }

    private validarFiltros(filtros: FiltrosDashboard): {mes: number; ano: number} {
        const hoje = new Date();
        const mes = filtros.mes ?? hoje.getMonth() + 1;
        const ano = filtros.ano ?? hoje.getFullYear();

        if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
            throw new BadRequestError("O mês informado é inválido.");
        }

        if (!Number.isInteger(ano) || ano < ANO_MINIMO || ano > ANO_MAXIMO) {
            throw new BadRequestError("O ano informado é inválido.");
        }

        return {mes, ano};
    }

    private criarTotais(): TotaisPorTipo {
        return {
            quantidade: 0,
            total: 0,
            quantidadeAPagar: 0,
            totalAPagar: 0,
            quantidadeAReceber: 0,
            totalAReceber: 0
        };
    }

    private acumularTotais(totais: TotaisPorTipo, conta: Conta): void {
        const valor = Number(conta.valor);

        totais.quantidade++;
        totais.total += valor;

        if (conta.tipo === "despesa") {
            totais.quantidadeAPagar++;
            totais.totalAPagar += valor;
        } else {
            totais.quantidadeAReceber++;
            totais.totalAReceber += valor;
        }
    }

    private finalizarTotais(totais: TotaisPorTipo): TotaisPorTipo {
        return {
            quantidade: totais.quantidade,
            total: this.arredondar(totais.total),
            quantidadeAPagar: totais.quantidadeAPagar,
            totalAPagar: this.arredondar(totais.totalAPagar),
            quantidadeAReceber: totais.quantidadeAReceber,
            totalAReceber: this.arredondar(totais.totalAReceber)
        };
    }

    private async buscarContasDoPeriodo(dataInicial: string, dataFinal: string): Promise<Conta[]> {
        return await contaRepository
            .createQueryBuilder("conta")
            .leftJoinAndSelect("conta.clienteOuFornecedor", "clienteOuFornecedor")
            .where("conta.data_vencimento >= :dataInicial", {dataInicial})
            .andWhere("conta.data_vencimento <= :dataFinal", {dataFinal})
            .orderBy("conta.data_vencimento", "ASC")
            .addOrderBy("conta.id", "ASC")
            .getMany();
    }

    private async buscarContasPendentes(): Promise<Conta[]> {
        return await contaRepository
            .createQueryBuilder("conta")
            .leftJoinAndSelect("conta.clienteOuFornecedor", "clienteOuFornecedor")
            .leftJoinAndSelect("conta.planoDeConta", "planoDeConta")
            .where("conta.status IN (:...status)", {status: ["aberto", "vencido"]})
            .orderBy("conta.data_vencimento", "ASC")
            .addOrderBy("conta.id", "ASC")
            .getMany();
    }

    private calcularResumo(contas: Conta[], hoje: string) {
        const resumo = {
            totalAPagar: 0,
            totalAReceber: 0,
            quantidadeAPagar: 0,
            quantidadeAReceber: 0,
            totalVencido: 0,
            totalVencidoAPagar: 0,
            totalVencidoAReceber: 0,
            totalPago: 0,
            totalRecebido: 0,
            receitasPrevistas: 0,
            despesasPrevistas: 0,
            saldoProjetado: 0
        };

        const indicadores = {
            totalContas: contas.length,
            pendentes: 0,
            vencidas: 0,
            pagas: 0,
            recebidas: 0
        };

        for (const conta of contas) {
            const valor = Number(conta.valor);
            const status = this.statusEfetivo(conta, hoje);
            const despesa = conta.tipo === "despesa";

            if (despesa) {
                resumo.despesasPrevistas += valor;
            } else {
                resumo.receitasPrevistas += valor;
            }

            switch (status) {
                case "aberto":
                    indicadores.pendentes++;
                    break;

                case "vencido":
                    indicadores.vencidas++;
                    resumo.totalVencido += valor;

                    if (despesa) {
                        resumo.totalVencidoAPagar += valor;
                    } else {
                        resumo.totalVencidoAReceber += valor;
                    }

                    break;

                case "pago":
                    indicadores.pagas++;
                    resumo.totalPago += valor;
                    break;

                case "recebido":
                    indicadores.recebidas++;
                    resumo.totalRecebido += valor;
                    break;
            }

            if (status === "aberto" || status === "vencido") {
                if (despesa) {
                    resumo.quantidadeAPagar++;
                    resumo.totalAPagar += valor;
                } else {
                    resumo.quantidadeAReceber++;
                    resumo.totalAReceber += valor;
                }
            }
        }

        resumo.saldoProjetado = resumo.receitasPrevistas - resumo.despesasPrevistas;

        return {
            resumo: {
                totalAPagar: this.arredondar(resumo.totalAPagar),
                totalAReceber: this.arredondar(resumo.totalAReceber),
                quantidadeAPagar: resumo.quantidadeAPagar,
                quantidadeAReceber: resumo.quantidadeAReceber,
                totalVencido: this.arredondar(resumo.totalVencido),
                totalVencidoAPagar: this.arredondar(resumo.totalVencidoAPagar),
                totalVencidoAReceber: this.arredondar(resumo.totalVencidoAReceber),
                totalPago: this.arredondar(resumo.totalPago),
                totalRecebido: this.arredondar(resumo.totalRecebido),
                receitasPrevistas: this.arredondar(resumo.receitasPrevistas),
                despesasPrevistas: this.arredondar(resumo.despesasPrevistas),
                saldoProjetado: this.arredondar(resumo.saldoProjetado)
            },
            indicadores
        };
    }

    private calcularGrafico(contas: Conta[], mes: number, ano: number) {
        const diasNoMes = new Date(ano, mes, 0).getDate();
        const serie: {dia: number; receitas: number; despesas: number}[] = [];

        for (let dia = 1; dia <= diasNoMes; dia++) {
            serie.push({dia, receitas: 0, despesas: 0});
        }

        for (const conta of contas) {
            const dia = Number(this.textoData(conta.data_vencimento).substring(8, 10));
            const ponto = serie[dia - 1];

            if (!ponto) {
                continue;
            }

            if (conta.tipo === "receita") {
                ponto.receitas += Number(conta.valor);
            } else {
                ponto.despesas += Number(conta.valor);
            }
        }

        return serie.map((ponto) => ({
            dia: ponto.dia,
            receitas: this.arredondar(ponto.receitas),
            despesas: this.arredondar(ponto.despesas)
        }));
    }

    private montarProximosVencimentos(contas: Conta[], hoje: string) {
        return contas
            .filter((conta) => this.statusEfetivo(conta, hoje) === "aberto")
            .slice(0, LIMITE_PROXIMOS_VENCIMENTOS)
            .map((conta) => {
                const dataVencimento = this.textoData(conta.data_vencimento);

                return {
                    id: conta.id,
                    tipo: conta.tipo,
                    descricao: conta.descricao,
                    valor: this.arredondar(Number(conta.valor)),
                    data_vencimento: dataVencimento,
                    diasParaVencer: this.diasEntre(hoje, dataVencimento),
                    clienteOuFornecedor: conta.clienteOuFornecedor
                        ? conta.clienteOuFornecedor.nome
                        : null
                };
            });
    }

    private calcularAlertas(pendentes: Conta[], hoje: string, limite: string) {
        const vencidas = this.criarTotais();
        const vencendoEmBreve = this.criarTotais();
        let cadastrosInativos = 0;

        for (const conta of pendentes) {
            const data = this.textoData(conta.data_vencimento);

            if (data < hoje) {
                this.acumularTotais(vencidas, conta);
            } else if (data <= limite) {
                this.acumularTotais(vencendoEmBreve, conta);
            }

            const clienteInativo = conta.clienteOuFornecedor ? conta.clienteOuFornecedor.status === false : false;
            const planoInativo = conta.planoDeConta ? conta.planoDeConta.status === false : false;

            if (clienteInativo || planoInativo) {
                cadastrosInativos++;
            }
        }

        return {
            vencidas: this.finalizarTotais(vencidas),
            vencendoEmBreve: {
                dias: DIAS_ALERTA_VENCIMENTO,
                ...this.finalizarTotais(vencendoEmBreve)
            },
            cadastrosInativos
        };
    }

    async gerarDashboard(filtros: FiltrosDashboard) {
        const {mes, ano} = this.validarFiltros(filtros);

        const agora = new Date();
        const hoje = this.formatarDataLocal(agora);
        const limiteAlerta = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + DIAS_ALERTA_VENCIMENTO);
        const dataInicial = `${String(ano).padStart(4, "0")}-${String(mes).padStart(2, "0")}-01`;
        const ultimoDia = new Date(ano, mes, 0).getDate();
        const dataFinal = `${String(ano).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;

        const [contasPeriodo, contasPendentes] = await Promise.all([
            this.buscarContasDoPeriodo(dataInicial, dataFinal),
            this.buscarContasPendentes()
        ]);

        const {resumo, indicadores} = this.calcularResumo(contasPeriodo, hoje);

        return {
            periodo: {mes, ano, dataInicial, dataFinal, hoje},
            resumo,
            indicadores,
            grafico: this.calcularGrafico(contasPeriodo, mes, ano),
            proximosVencimentos: this.montarProximosVencimentos(contasPeriodo, hoje),
            alertas: this.calcularAlertas(contasPendentes, hoje, this.formatarDataLocal(limiteAlerta))
        };
    }
}
