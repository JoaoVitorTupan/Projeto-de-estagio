import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { AppDataSource } from "../config/data-source";
import { Conta, StatusConta, TipoConta } from "../entities/conta";
import { ClienteOuFornecedor } from "../entities/clienteOuFornecedor";
import { PlanoDeConta } from "../entities/planoDeConta";
import { Usuario } from "../entities/usuario";

export interface FiltrosRelatorio {
    dataInicial?: string;
    dataFinal?: string;
    clienteOuFornecedorId?: number;
    planoDeContaId?: number;
    tipo?: TipoConta;
    status?: StatusConta;
    usuarioId?: number;
    valorMinimo?: number;
    valorMaximo?: number;
    ordenarPor?: string;
    ordem?: "asc" | "desc";
}

interface ResumoRelatorio {
    totalContas: number;
    quantidadeReceitas: number;
    quantidadeDespesas: number;
    quantidadeAbertas: number;
    quantidadeVencidas: number;
    quantidadePagas: number;
    quantidadeRecebidas: number;
    totalReceitas: number;
    totalDespesas: number;
    totalAberto: number;
    totalVencido: number;
    totalPago: number;
    totalRecebido: number;
    saldo: number;
}

interface DadosRelatorio {
    filtros: FiltrosRelatorio;
    contas: Conta[];
    resumo: ResumoRelatorio;
}

export class RelatorioService {
    private contaRepository = AppDataSource.getRepository(Conta);
    private clienteOuFornecedorRepository = AppDataSource.getRepository(ClienteOuFornecedor);
    private planoDeContaRepository = AppDataSource.getRepository(PlanoDeConta);
    private usuarioRepository = AppDataSource.getRepository(Usuario);
    private validarData(data: string): boolean {

        if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            return false;
        }

        const partes = data.split("-");
        const ano = Number(partes[0]);
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);
        const dataObj = new Date(ano, mes - 1, dia);

        return (dataObj.getFullYear() === ano && dataObj.getMonth() === mes - 1 && dataObj.getDate() === dia);
    }

    private validarFiltros(filtros: FiltrosRelatorio): void {

        if (filtros.dataInicial && !this.validarData(filtros.dataInicial)) {
            throw new Error("A data inicial é inválida.");
        }

        if (filtros.dataFinal && !this.validarData(filtros.dataFinal)) {
            throw new Error("A data final é inválida.");
        }

        if (filtros.dataInicial && filtros.dataFinal && filtros.dataInicial > filtros.dataFinal) {
            throw new Error("A data inicial não pode ser maior que a data final.");
        }

        if (
            filtros.clienteOuFornecedorId !==
            undefined &&
            (
                !Number.isInteger(
                    filtros.clienteOuFornecedorId
                ) ||
                filtros.clienteOuFornecedorId <= 0
            )
        ) {
            throw new Error("Cliente ou fornecedor inválido.");
        }

        if (
            filtros.planoDeContaId !==
            undefined &&
            (
                !Number.isInteger(
                    filtros.planoDeContaId
                ) ||
                filtros.planoDeContaId <= 0
            )
        ) {
            throw new Error("Plano de contas inválido.");
        }

        if (
            filtros.usuarioId !==
            undefined &&
            (
                !Number.isInteger(
                    filtros.usuarioId
                ) ||
                filtros.usuarioId <= 0
            )
        ) {
            throw new Error("Usuário inválido.");
        }

        if (filtros.tipo !== undefined && filtros.tipo !== "receita" && filtros.tipo !== "despesa") {
            throw new Error("Tipo de conta inválido.");
        }

        if (
            filtros.status !== undefined &&
            filtros.status !== "aberto" &&
            filtros.status !== "vencido" &&
            filtros.status !== "pago" &&
            filtros.status !== "recebido"
        ) {
            throw new Error("Status da conta inválido.");
        }

        if (
            filtros.valorMinimo !==
            undefined &&
            (
                !Number.isFinite(
                    filtros.valorMinimo
                ) ||
                filtros.valorMinimo < 0
            )
        ) {
            throw new Error("O valor mínimo é inválido.");
        }

        if (
            filtros.valorMaximo !==
            undefined &&
            (
                !Number.isFinite(
                    filtros.valorMaximo
                ) ||
                filtros.valorMaximo < 0
            )
        ) {
            throw new Error("O valor máximo é inválido.");
        }

        if (
            filtros.valorMinimo !== undefined &&
            filtros.valorMaximo !== undefined &&
            filtros.valorMinimo >
            filtros.valorMaximo
        ) {
            throw new Error("O valor mínimo não pode ser maior que o valor máximo.");
        }

        const camposOrdenacao = ["data_vencimento", "descricao", "valor", "tipo", "status"];

        if (filtros.ordenarPor && !camposOrdenacao.includes(filtros.ordenarPor)) {
            throw new Error("Campo de ordenação inválido.");
        }

        if (filtros.ordem && filtros.ordem !== "asc" && filtros.ordem !== "desc") {
            throw new Error("Ordem de ordenação inválida.");
        }
    }

    async buscarContas(filtros: FiltrosRelatorio): Promise<Conta[]> {
        this.validarFiltros(filtros);

        const query = this.contaRepository
            .createQueryBuilder("conta")
            .leftJoinAndSelect("conta.clienteOuFornecedor", "clienteOuFornecedor")
            .leftJoinAndSelect("conta.planoDeConta", "planoDeConta")
            .leftJoinAndSelect("conta.usuario", "usuario");

        if (filtros.dataInicial) {
            query.andWhere("conta.data_vencimento >= :dataInicial", {
                dataInicial: filtros.dataInicial
            });
        }

        if (filtros.dataFinal) {
            query.andWhere("conta.data_vencimento <= :dataFinal", {
                dataFinal: filtros.dataFinal
            });
        }

        if (filtros.clienteOuFornecedorId !== undefined) {
            query.andWhere("clienteOuFornecedor.id = :clienteOuFornecedorId", {
                clienteOuFornecedorId:
                filtros.clienteOuFornecedorId
            });
        }

        if (filtros.planoDeContaId !== undefined) {
            query.andWhere("planoDeConta.id = :planoDeContaId", {
                planoDeContaId: filtros.planoDeContaId
            });
        }

        if (filtros.tipo) {
            query.andWhere("conta.tipo = :tipo", {
                tipo: filtros.tipo
            });
        }

        if (filtros.status) {
            query.andWhere("conta.status = :status", {
                status: filtros.status
            });
        }

        if (filtros.usuarioId !== undefined) {
            query.andWhere("usuario.id = :usuarioId", {
                usuarioId: filtros.usuarioId
            });
        }

        if (filtros.valorMinimo !== undefined) {
            query.andWhere("conta.valor >= :valorMinimo", {
                valorMinimo: filtros.valorMinimo
            });
        }

        if (filtros.valorMaximo !== undefined) {
            query.andWhere("conta.valor <= :valorMaximo", {
                valorMaximo: filtros.valorMaximo
            });
        }

        const ordenarPor = filtros.ordenarPor || "data_vencimento";
        const ordem = filtros.ordem === "desc" ? "DESC": "ASC";

        query.orderBy(`conta.${ordenarPor}`,ordem);

        return await query.getMany();
    }

    private calcularResumo(contas: Conta[]): ResumoRelatorio {
        const resumo: ResumoRelatorio = {
            totalContas:contas.length,
            quantidadeReceitas: 0,
            quantidadeDespesas: 0,
            quantidadeAbertas: 0,
            quantidadeVencidas: 0,
            quantidadePagas: 0,
            quantidadeRecebidas: 0,
            totalReceitas: 0,
            totalDespesas: 0,
            totalAberto: 0,
            totalVencido: 0,
            totalPago: 0,
            totalRecebido: 0,
            saldo: 0
        };

        for (const conta of contas) {
            const valor = Number(conta.valor);

            if (conta.tipo === "receita") {
                resumo.quantidadeReceitas++;
                resumo.totalReceitas += valor;
            }

            if (conta.tipo === "despesa") {
                resumo.quantidadeDespesas++;
                resumo.totalDespesas += valor;
            }

            switch (conta.status) {
                case "aberto":
                    resumo.quantidadeAbertas++;
                    resumo.totalAberto += valor;
                    break;

                case "vencido":
                    resumo.quantidadeVencidas++;
                    resumo.totalVencido += valor;
                    break;

                case "pago":
                    resumo.quantidadePagas++;
                    resumo.totalPago += valor;
                    break;

                case "recebido":
                    resumo.quantidadeRecebidas++;
                    resumo.totalRecebido += valor;
                    break;
            }
        }

        resumo.saldo = resumo.totalReceitas - resumo.totalDespesas;

        return resumo;
    }

    async gerarRelatorio(filtros: FiltrosRelatorio): Promise<DadosRelatorio> {
        const contas = await this.buscarContas(filtros);
        const resumo = this.calcularResumo(contas);

        return {filtros, contas, resumo};
    }

    async buscarOpcoes() {
        const [clientesFornecedores, planos, usuarios] = await Promise.all([
            this.clienteOuFornecedorRepository.find({
                order: {
                    nome: "ASC"
                }
            
            }),

            this.planoDeContaRepository.find({
                order: {
                    nome: "ASC"
                }
            }),

            this.usuarioRepository.find({
                select: [
                    "id",
                    "nome",
                    "email",
                    "role",
                    "status"
                ],
                order: {
                    nome: "ASC"
                }
            })
        ]);

        return {
            clientesFornecedores:clientesFornecedores.map((registro) => ({
                id: registro.id,
                nome: registro.nome,
                tipo: registro.tipo,
                status: registro.status
            })),

            planos: planos.map((plano) => ({
                id: plano.id,
                nome: plano.nome,
                status: plano.status
            })),

            usuarios: usuarios.map((usuario) => ({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
                status: usuario.status
            }))
        };
    }

    private formatarMoeda(valor: number): string {
        return new Intl.NumberFormat("pt-BR",{
            style: "currency",
            currency: "BRL"
        }
    ).format(
        valor
    );
    }

    private formatarData(data: Date): string {
        const texto = String(data).substring(0, 10);
        const partes = texto.split("-");

        if (partes.length !== 3) {
            return texto;
        }

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    private nomeStatus(status: StatusConta): string {
        switch (status) {
            case "aberto": return "Em aberto";
            case "vencido": return "Vencido";
            case "pago": return "Pago";
            case "recebido": return "Recebido";
            default: return status;
        }
    }

    private nomeTipo(tipo: TipoConta): string {
        return tipo === "receita" ? "Receita" : "Despesa";
    }

    async gerarPDF(filtros: FiltrosRelatorio): Promise<Buffer> {
        const relatorio = await this.gerarRelatorio(filtros);

        return new Promise((resolve, reject) => {
            const documento = new PDFDocument({
                size: "A4",
                margin: 35
            });

            const partes: Buffer[] = [];

            documento.on("data", (parte) => {
                partes.push(Buffer.from(parte));
            });
            
            documento.on("end", () => {
                resolve(Buffer.concat(partes));
            });
            
            documento.on("error", reject);
            
            const largura = documento.page.width - 70;
            
            documento.fontSize(20).font("Helvetica-Bold").text("SFCPR", {
                align: "center"
            });

            documento.moveDown(0.3).fontSize(15).font("Helvetica").text("Relatório de Contas", {
                align: "center"
            });
            
            documento.moveDown();
            
            documento.fontSize(9).font("Helvetica");

            let textoPeriodo = "Período: Todos";
            
            if (filtros.dataInicial || filtros.dataFinal) {
                textoPeriodo = `Período: ${
                    filtros.dataInicial ? this.formatarData(new Date(`${filtros.dataInicial}T00:00:00`)) : "início"
                } até ${
                    filtros.dataFinal ? this.formatarData(new Date(`${filtros.dataFinal}T00:00:00`)) : "fim"
                }`;
            }

            documento.text(textoPeriodo);
            
            documento.text(`Tipo: ${
                filtros.tipo ? this.nomeTipo(filtros.tipo) : "Todos"
            }`);
            
            documento.text(`Status: ${
                filtros.status ? this.nomeStatus(filtros.status) : "Todos"
            }`);
            
            documento.text(`Cliente/Fornecedor: ${relatorio.contas.length > 0 ? 
                (filtros.clienteOuFornecedorId ? 
                    (relatorio.contas[0].clienteOuFornecedor ?.nome || "Selecionado") : "Todos") : "Todos"

            }`);
            
            documento.text(`Plano de Contas: ${
                filtros.planoDeContaId ? (relatorio.contas[0] ?.planoDeConta ?.nome || "Selecionado") : "Todos"
            }`);
            
            documento.text(`Usuário: ${
                filtros.usuarioId ? (relatorio.contas[0] ?.usuario ?.nome || "Selecionado") : "Todos"
            }`);
            
            documento.moveDown();
            
            documento.fontSize(12).font("Helvetica-Bold").text("Resumo");
            
            documento.moveDown(0.4);
            
            documento.fontSize(9).font("Helvetica");
            
            documento.text(`Total de contas: ${
                relatorio.resumo.totalContas
            }`);
            
            documento.text(`Receitas: ${
                this.formatarMoeda(relatorio.resumo.totalReceitas)
            }`);
            
            documento.text(`Despesas: ${
                this.formatarMoeda(relatorio.resumo.totalDespesas)
            }`);
            
            documento.text(`Em aberto: ${
                this.formatarMoeda(relatorio.resumo.totalAberto)
            }`);
            
            documento.text(`Vencido: ${
                this.formatarMoeda(relatorio.resumo.totalVencido)
            }`);
            
            documento.text(`Pago: ${
                this.formatarMoeda(relatorio.resumo.totalPago)
            }`);
            
            documento.text(`Recebido: ${
                this.formatarMoeda(relatorio.resumo.totalRecebido)
            }`);
            
            documento.text(`Saldo: ${
                this.formatarMoeda(relatorio.resumo.saldo)
            }`);
            
            documento.moveDown();
            
            documento.fontSize(12).font("Helvetica-Bold").text("Contas");
            
            documento.moveDown(0.5);
            
            const colunas = {data: 45, tipo: 55, descricao: 145, valor: 75, status: 75};
            
            let y = documento.y;
            
            function desenharCabecalho() {
                documento.fontSize(8).font("Helvetica-Bold");

                let x = 35;

                documento.text("Data", x, y, {
                    width: colunas.data
                });
                
                x += colunas.data;
                
                documento.text("Tipo", x, y, {
                    width: colunas.tipo
                });
                
                x += colunas.tipo;
                
                documento.text("Descrição", x, y, {
                    width: colunas.descricao
                });
                
                x += colunas.descricao;
                
                documento.text("Valor", x, y, {
                    width: colunas.valor
                });
                
                x += colunas.valor;
                
                documento.text("Status", x, y, {
                    width: colunas.status
                });
                
                y += 18;
                
                documento.moveTo(35, y - 5).lineTo(35 + largura, y - 5).stroke();
            }
            
            desenharCabecalho();
            
            documento.font("Helvetica").fontSize(7);
            
            for (const conta of relatorio.contas) {
                if (y > 750) {
                    documento.addPage();
                    y = 35;
                    desenharCabecalho();
                }
                
                let x = 35;
                
                const data = this.formatarData(conta.data_vencimento);
                const tipo = this.nomeTipo(conta.tipo);
                const descricao = conta.descricao;
                const valor = this.formatarMoeda(Number(conta.valor));
                const status = this.nomeStatus(conta.status);
                
                documento.text(data, x, y, {
                    width: colunas.data
                });
                
                x += colunas.data;
                
                documento.text(tipo, x, y, {
                    width: colunas.tipo
                });
                
                x += colunas.tipo;
                
                documento.text(descricao, x, y, {
                    width: colunas.descricao, ellipsis: true
                });
                
                x += colunas.descricao;
                
                documento.text(valor, x, y, {
                    width: colunas.valor
                });
                
                x += colunas.valor;
                
                documento.text(status, x, y, {
                    width: colunas.status
                });
                
                y += 20;
                }

                if (relatorio.contas.length === 0) {
                    
                    documento.fontSize(9).text("Nenhuma conta encontrada com os filtros informados.", 35, y + 5);
                }

                documento.fontSize(7).font("Helvetica").text(`Relatório gerado em ${
                    new Date().toLocaleString("pt-BR")
                }`, 

                35, 
                805, 
                
                {
                    width: largura, align: "center"
                });
                
                documento.end();
            }
        );
    }

    async gerarExcel(filtros: FiltrosRelatorio): Promise<Buffer> {
        const relatorio = await this.gerarRelatorio(filtros);
        const workbook = new ExcelJS.Workbook();

        workbook.creator = "SFCPR";
        workbook.created = new Date();

        const planilha = workbook.addWorksheet("Relatório");

        planilha.mergeCells("A1:H1");
        planilha.getCell("A1").value = "SFCPR - RELATÓRIO DE CONTAS";
        planilha.getCell("A1").font = {bold: true, size: 16};
        planilha.getCell("A1").alignment = {horizontal: "center"};
        planilha.mergeCells("A2:H2");
        planilha.getCell("A2").value = `Gerado em ${new Date().toLocaleString("pt-BR")}`;
        planilha.getCell("A2").alignment = {horizontal: "center"};

        const linhaCabecalho = planilha.addRow([
            "Tipo",
            "Descrição",
            "Valor",
            "Cliente / Fornecedor",
            "Plano de Contas",
            "Vencimento",
            "Status",
            "Usuário"
        ]);

        linhaCabecalho.font = {bold: true};
        linhaCabecalho.alignment = {horizontal: "center"};

        for (const conta of relatorio.contas) {
            const linha = planilha.addRow([this.nomeTipo(conta.tipo),
                conta.descricao, Number(conta.valor),
                conta.clienteOuFornecedor?.nome || "-",
                conta.planoDeConta?.nome || "-",

                this.formatarData(conta.data_vencimento),
                this.nomeStatus(conta.status),

                conta.usuario?.nome || "-"
            ]);

            linha.getCell(3).numFmt = '"R$" #,##0.00';
        }

        planilha.getColumn(1).width = 14;
        planilha.getColumn(2).width = 35;
        planilha.getColumn(3).width = 18;
        planilha.getColumn(4).width = 30;
        planilha.getColumn(5).width = 25;
        planilha.getColumn(6).width = 18;
        planilha.getColumn(7).width = 18;
        planilha.getColumn(8).width = 25;

        planilha.autoFilter = {
            from: "A4",
            to: `H${
                Math.max(4, planilha.rowCount)
            }`
        };

        const resumo = workbook.addWorksheet("Resumo");

        resumo.getCell("A1").value = "RESUMO DO RELATÓRIO";
        resumo.getCell("A1").font = {bold: true, size: 16};

        const dadosResumo = [
            ["Total de contas", relatorio.resumo.totalContas],
            ["Quantidade de receitas", relatorio.resumo.quantidadeReceitas],
            ["Quantidade de despesas", relatorio.resumo.quantidadeDespesas],
            ["Quantidade em aberto", relatorio.resumo.quantidadeAbertas],
            ["Quantidade vencida", relatorio.resumo.quantidadeVencidas],
            ["Quantidade paga", relatorio.resumo.quantidadePagas],
            ["Quantidade recebida", relatorio.resumo.quantidadeRecebidas],
            ["Total de receitas", relatorio.resumo.totalReceitas],
            ["Total de despesas", relatorio.resumo.totalDespesas],
            ["Total em aberto", relatorio.resumo.totalAberto],
            ["Total vencido", relatorio.resumo.totalVencido],
            ["Total pago", relatorio.resumo.totalPago],
            ["Total recebido", relatorio.resumo.totalRecebido],
            ["Saldo", relatorio.resumo.saldo]
        ];

        for (const item of dadosResumo) {
            const linha = resumo.addRow(item);

            if (typeof item[1] === "number" && String(item[0]).startsWith("Total") || item[0] === "Saldo") {
                linha.getCell(2).numFmt = '"R$" #,##0.00';
            }
        }

        resumo.getColumn(1).width = 30;
        resumo.getColumn(2).width = 20;

        const buffer = await workbook.xlsx.writeBuffer();

        return Buffer.from(buffer);
    }
}