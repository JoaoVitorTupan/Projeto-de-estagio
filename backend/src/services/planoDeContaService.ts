import PlanoDeContaRepository from "../repositories/planoDeContaRepository";
import { BadRequestError } from "../utils/api-erros";

interface CreatePlanoDeContaDTO {
    nome: string;
    descricao: string;
}

class PlanoDeContaService {

    async listar() {
        return await PlanoDeContaRepository.find();
    }

    async cadastrar(data: CreatePlanoDeContaDTO) {
        const {nome, descricao} = data;

        if (!nome || !descricao) {
            throw new BadRequestError("Nome e descrição são obrigatórios");
        }

        const planoDeContaExistente = await PlanoDeContaRepository.findOneBy({nome});

        if (planoDeContaExistente) {
            throw new BadRequestError("Já existe um plano de contas com esse nome");
        }

        const planoDeConta = PlanoDeContaRepository.create({nome, descricao, status: true});

        await PlanoDeContaRepository.save(planoDeConta);

        return planoDeConta;
    }

    async atualizar(id: number, data: Partial<CreatePlanoDeContaDTO>) {
        const planoDeConta = await PlanoDeContaRepository.findOneBy({id});

        if (!planoDeConta) {
            throw new BadRequestError("Plano de contas não encontrado");
        }

        if (data.nome !== undefined && !data.nome) {
            throw new BadRequestError("O nome é obrigatório");
        }

        if (data.descricao !== undefined && !data.descricao) {
            throw new BadRequestError("A descrição é obrigatória");
        }

        if (data.nome && data.nome !== planoDeConta.nome) {
            const planoDeContaExistente = await PlanoDeContaRepository.findOneBy({nome: data.nome});

            if (planoDeContaExistente) {
                throw new BadRequestError("Já existe um plano de contas com esse nome");
            }
        }

        Object.assign(planoDeConta, data);

        await PlanoDeContaRepository.save(planoDeConta);

        return planoDeConta;
    }

    async inativar(id: number) {
        const planoDeConta = await PlanoDeContaRepository.findOneBy({id});

        if (!planoDeConta) {
            throw new BadRequestError("Plano de contas não encontrado");
        }

        planoDeConta.status = false;

        await PlanoDeContaRepository.save(planoDeConta);

        return planoDeConta;
    }

    async reativar(id: number) {
        const planoDeConta = await PlanoDeContaRepository.findOneBy({id});

        if (!planoDeConta) {
            throw new BadRequestError("Plano de contas não encontrado");
        }

        planoDeConta.status = true;

        await PlanoDeContaRepository.save(planoDeConta);

        return planoDeConta;
    }
}

export default new PlanoDeContaService();