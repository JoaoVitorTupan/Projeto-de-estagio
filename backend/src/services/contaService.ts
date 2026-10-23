import { Conta } from "../entities/conta";
import { ClienteOuFornecedor } from "../entities/clienteOuFornecedor";
import { PlanoDeConta } from "../entities/planoDeConta";
import { Usuario } from "../entities/usuario";
import contaRepository from "../repositories/contaRepository";
import { AppDataSource } from "../config/data-source";

export class ContaService {
    private clienteOuFornecedorRepository = AppDataSource.getRepository(ClienteOuFornecedor);
    private planoDeContaRepository = AppDataSource.getRepository(PlanoDeConta);
    private usuarioRepository = AppDataSource.getRepository(Usuario);
    private dataEstaVencida(data: Date | string): boolean {const dataTexto = String(data).substring(0, 10);
        
        const partes = dataTexto.split("-");

        if (partes.length !== 3) {
            return false;
        }

        const ano = Number(partes[0]);
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);

        if (!Number.isInteger(ano) || !Number.isInteger(mes) || !Number.isInteger(dia)) {
            return false;
        }

        const dataVencimento = new Date(ano, mes - 1, dia);

        if (Number.isNaN(dataVencimento.getTime())) {
            return false;
        }

        if (
            dataVencimento.getFullYear() !== ano ||
            dataVencimento.getMonth() !== mes - 1 ||
            dataVencimento.getDate() !== dia
        ) {
            return false;
        }

        dataVencimento.setHours(0, 0, 0, 0);

        const hoje = new Date();

        hoje.setHours(0, 0, 0, 0);

        return (dataVencimento < hoje);
    }

    private definirStatusAutomatico(dataVencimento: Date | string): "aberto" | "vencido" {
        if (this.dataEstaVencida(dataVencimento)) {
            return "vencido";
        }
        return "aberto";
    }

    private statusFinalizado(status: Conta["status"]): boolean {
        return (status === "pago" || status === "recebido");
    }

    private validarStatusPorTipo(tipo: Conta["tipo"], status: Conta["status"]): void {
        if (tipo === "despesa" && status === "recebido") {
            throw new Error("Uma despesa não pode ser marcada como recebida.");
        }

        if (tipo === "receita" && status === "pago") {
            throw new Error("Uma receita não pode ser marcada como paga.");
        }
    }

    private validarDataVencimento(data: Date | string): void {
        if (!data) {
            throw new Error("A data de vencimento é obrigatória.");
        }

        const dataTexto = String(data).substring(0, 10);
        const partes = dataTexto.split("-");

        if (partes.length !== 3) {
            throw new Error("A data de vencimento é inválida.");
        }

        const ano = Number(partes[0]);
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);

        if (!Number.isInteger(ano) || !Number.isInteger(mes) || !Number.isInteger(dia)) {
            throw new Error("A data de vencimento é inválida.");
        }

        const dataValida = new Date(ano, mes - 1, dia);

        if (
            Number.isNaN(dataValida.getTime()) ||
            dataValida.getFullYear() !== ano ||
            dataValida.getMonth() !== mes - 1 ||
            dataValida.getDate() !== dia
        ) {
            throw new Error("A data de vencimento é inválida.");
        }
    }

    private async atualizarStatusAutomatico(conta: Conta): Promise<void> {
        if (this.statusFinalizado(conta.status)) {
            return;
        }

        const statusAutomatico = this.definirStatusAutomatico(conta.data_vencimento);

        if (conta.status !== statusAutomatico) {
            conta.status = statusAutomatico;
            await contaRepository.save(conta);
        }
    }

    async listar(): Promise<Conta[]> {
        const contas = await contaRepository.find({relations: ["clienteOuFornecedor", "usuario", "planoDeConta"]});
        let houveAlteracao = false;

        for (const conta of contas) {
            if (this.statusFinalizado(conta.status)) {
                continue;
            }

            const statusAutomatico = this.definirStatusAutomatico(conta.data_vencimento);

            if (conta.status !== statusAutomatico) {
                conta.status = statusAutomatico;
                houveAlteracao = true;
            }
        }

        if (houveAlteracao) {
            await contaRepository.save(contas);
        }

        return contas;
    }

    async buscarPorId(id: number): Promise<Conta> {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID da conta inválido.");
        }

        const conta = await contaRepository.findOne({where: {id}, 
            relations: ["clienteOuFornecedor", "usuario", "planoDeConta"]});

        if (!conta) {
            throw new Error("Conta não encontrada.");
        }

        await this.atualizarStatusAutomatico(conta);

        return conta;
    }

    async cadastrar(dados: Partial<Conta> & {
            cliente_ou_fornecedor_id?: number;
            plano_de_conta_id?: number;
        },

        usuarioLogado: {
            id: number;
        }

    ): Promise<Conta> {

        if (!usuarioLogado || !Number.isInteger(Number(usuarioLogado.id)) || Number(usuarioLogado.id) <= 0) {
            throw new Error("Usuário autenticado inválido.");
        }

        const usuarioId = Number(usuarioLogado.id);
        const usuario = await this.usuarioRepository.findOne({where: {id: usuarioId}});

        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }

        if (!dados.tipo) {
            throw new Error("O tipo da conta é obrigatório.");
        }

        if (dados.tipo !== "receita" && dados.tipo !== "despesa") {
            throw new Error("O tipo da conta é inválido.");
        }

        if (!dados.descricao || !dados.descricao.trim()) {
            throw new Error("A descrição da conta é obrigatória.");
        }

        if (dados.valor === undefined || dados.valor === null || String(dados.valor).trim() === "") {
            throw new Error("O valor da conta é obrigatório.");
        }

        const valor = Number(dados.valor);

        if (!Number.isFinite(valor) || valor <= 0) {
            throw new Error("O valor da conta deve ser maior que zero.");
        }

        if (!dados.data_vencimento) {
            throw new Error("A data de vencimento é obrigatória.");
        }

        this.validarDataVencimento(dados.data_vencimento);

        const status = this.definirStatusAutomatico(dados.data_vencimento);

        if (dados.cliente_ou_fornecedor_id === undefined || dados.cliente_ou_fornecedor_id === null) {
            throw new Error("O cliente ou fornecedor é obrigatório.");
        }

        const clienteOuFornecedorId = Number(dados.cliente_ou_fornecedor_id);

        if (!Number.isInteger(clienteOuFornecedorId) || clienteOuFornecedorId <= 0) {
            throw new Error("Cliente ou fornecedor inválido.");
        }

        const clienteOuFornecedor = await this.clienteOuFornecedorRepository.findOne({
            where: {id: clienteOuFornecedorId}
        });

        if (!clienteOuFornecedor) {
            throw new Error(
                "Cliente ou fornecedor não encontrado."
            );
        }

        if (!clienteOuFornecedor.status) {
            throw new Error("O cliente ou fornecedor selecionado está inativo e não pode ser utilizado em uma nova conta.");
        }

        if (dados.plano_de_conta_id === undefined || dados.plano_de_conta_id === null) {
            throw new Error("O plano de contas é obrigatório.");
        }

        const planoDeContaId = Number(dados.plano_de_conta_id);

        if (!Number.isInteger(planoDeContaId) || planoDeContaId <= 0) {
            throw new Error("Plano de contas inválido.");
        }

        const planoDeConta = await this.planoDeContaRepository.findOne({where: {id: planoDeContaId}});

        if (!planoDeConta) {
            throw new Error("Plano de contas não encontrado.");
        }

        if (planoDeConta.status !== true) {
            throw new Error(
                "O plano de contas selecionado está inativo e não pode ser utilizado em uma nova conta."
            );
        }

        const conta = contaRepository.create({
            tipo: dados.tipo,
            descricao: dados.descricao.trim(),
            valor: valor,
            status: status,
            data_vencimento: dados.data_vencimento,
            clienteOuFornecedor: clienteOuFornecedor,
            planoDeConta: planoDeConta,
            usuario: usuario
        });

        const contaSalva = await contaRepository.save(conta);

        return await this.buscarPorId(contaSalva.id);
    }

    async atualizar(id: number, dados: Partial<Conta> & {
        cliente_ou_fornecedor_id?: number; 
        plano_de_conta_id?: number;
    }
    
    ): Promise<Conta> {

        const conta = await this.buscarPorId(id);

        if (this.statusFinalizado(conta.status)) {
            throw new Error("Contas pagas ou recebidas não podem ser editadas.");
        }

        if (dados.tipo !== undefined) {
            if (dados.tipo !== "receita" && dados.tipo !== "despesa") {
                throw new Error("O tipo da conta é inválido.");
            }

            conta.tipo = dados.tipo;
        }

        if (dados.descricao !== undefined) {
            if (!dados.descricao.trim()) {
                throw new Error("A descrição da conta não pode ser vazia.");
            }

            conta.descricao = dados.descricao.trim();
        }

        if (dados.valor !== undefined) {
            const valor = Number(dados.valor);

            if (!Number.isFinite(valor) || valor <= 0) {
                throw new Error("O valor da conta deve ser maior que zero.");
            }

            conta.valor = valor;
        }

        if (dados.status !== undefined) {
            if (
                dados.status !== "pago" &&
                dados.status !== "recebido" &&
                dados.status !== "aberto" &&
                dados.status !== "vencido"
            ) {
                throw new Error("O status da conta é inválido.");
            }

            if (dados.status === "aberto" || dados.status === "vencido") {
                throw new Error("Os status aberto e vencido são definidos automaticamente pela data de vencimento.");
            }

            this.validarStatusPorTipo(conta.tipo, dados.status);
            conta.status = dados.status;
        }

        if (dados.data_vencimento !== undefined) {
            if (!dados.data_vencimento) {
                throw new Error("A data de vencimento não pode ser vazia.");
            }

            this.validarDataVencimento(dados.data_vencimento);
            conta.data_vencimento = dados.data_vencimento;

            if (!this.statusFinalizado(conta.status)) {
                conta.status = this.definirStatusAutomatico(conta.data_vencimento);
            }
        }

        if (dados.cliente_ou_fornecedor_id !== undefined) {
            const clienteOuFornecedorId = Number(dados.cliente_ou_fornecedor_id);

            if (!Number.isInteger(clienteOuFornecedorId) || clienteOuFornecedorId <= 0) {
                throw new Error("Cliente ou fornecedor inválido.");
            }

            const clienteOuFornecedor = await this.clienteOuFornecedorRepository.findOne({
                where: {id: clienteOuFornecedorId}
            });

            if (!clienteOuFornecedor) {
                throw new Error("Cliente ou fornecedor não encontrado.");
            }

            if (!clienteOuFornecedor.status) {
                throw new Error("O cliente ou fornecedor selecionado está inativo e não pode ser utilizado em uma conta.");
            }

            conta.clienteOuFornecedor = clienteOuFornecedor;
        }

        if (dados.plano_de_conta_id !== undefined) {
            const planoDeContaId = Number(dados.plano_de_conta_id);

            if (!Number.isInteger(planoDeContaId) || planoDeContaId <= 0) {
                throw new Error("Plano de contas inválido.");
            }

            const planoDeConta = await this.planoDeContaRepository.findOne({
                where: {id: planoDeContaId}
            });

            if (!planoDeConta) {
                throw new Error("Plano de contas não encontrado.");
            }

            if (planoDeConta.status !== true) {
                throw new Error("O plano de contas selecionado está inativo e não pode ser utilizado em uma conta.");
            }

            conta.planoDeConta = planoDeConta;
        }

        await contaRepository.save(conta);

        return await this.buscarPorId(conta.id);
    }

    async marcarComoPago(id: number): Promise<Conta> {

        const conta = await this.buscarPorId(id);

        if (conta.tipo !== "despesa") {
            throw new Error("Somente despesas podem ser marcadas como pagas.");
        }

        if (conta.status === "pago") {
            throw new Error("A conta já está marcada como paga.");
        }

        if (conta.status === "recebido") {
            throw new Error("Uma conta recebida não pode ser marcada como paga.");
        }

        conta.status = "pago";

        await contaRepository.save(conta);

        return await this.buscarPorId(conta.id);
    }

    async marcarComoRecebido(id: number): Promise<Conta> {
        const conta = await this.buscarPorId(id);

        if (conta.tipo !== "receita") {
            throw new Error("Somente receitas podem ser marcadas como recebidas.");
        }

        if (conta.status === "recebido") {
            throw new Error(
                "A conta já está marcada como recebida."
            );
        }

        if (conta.status === "pago") {
            throw new Error("Uma conta paga não pode ser marcada como recebida.");
        }

        conta.status = "recebido";

        await contaRepository.save(conta);

        return await this.buscarPorId(conta.id);
    }

    async excluir(id: number): Promise<void> {
        const conta = await this.buscarPorId(id);

        if (this.statusFinalizado(conta.status)) {
            throw new Error("Contas pagas ou recebidas não podem ser excluídas.");
        }

        await contaRepository.remove(conta);
    }
}