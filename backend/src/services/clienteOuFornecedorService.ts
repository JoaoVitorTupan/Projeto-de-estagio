import ClienteOuFornecedorRepository from "../repositories/clienteOuFornecedorRepository";
import { BadRequestError } from "../utils/api-erros";

interface CreateClienteOuFornecedorDTO {
  tipo: "cliente" | "fornecedor";
  nome: string;
  cpf_cnpj: string;
  email?: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

class ClienteOuFornecedorService {
  async listar() {
    return ClienteOuFornecedorRepository.find();
  }

  async cadastrar(data: CreateClienteOuFornecedorDTO) {
    const {tipo, nome, cpf_cnpj} = data;

    if (!tipo || !nome || !cpf_cnpj) {
      throw new BadRequestError("Preencha os campos obrigatórios");
    }

    const existe = await ClienteOuFornecedorRepository.findOneBy({cpf_cnpj});

    if (existe) {
      throw new BadRequestError("CPF/CNPJ já cadastrado");
    }

    const clienteOuFornecedor = ClienteOuFornecedorRepository.create({...data, status: true});

    await ClienteOuFornecedorRepository.save(
      clienteOuFornecedor
    );

    return clienteOuFornecedor;
  }

  async atualizar(id: number, data: Partial<CreateClienteOuFornecedorDTO>) {
    const clienteOuFornecedor = await ClienteOuFornecedorRepository.findOneBy({id});

    if (!clienteOuFornecedor) {
      throw new BadRequestError("Cliente ou fornecedor não encontrado");
    }

    if (data.cpf_cnpj && data.cpf_cnpj !== clienteOuFornecedor.cpf_cnpj) {
      const existe = await ClienteOuFornecedorRepository.findOneBy({cpf_cnpj: data.cpf_cnpj});

      if (existe) {
        throw new BadRequestError("CPF/CNPJ já cadastrado");
      }
    }

    Object.assign(clienteOuFornecedor, data);

    await ClienteOuFornecedorRepository.save(clienteOuFornecedor);

    return clienteOuFornecedor;
  }

  async inativar(id: number) {
    const clienteOuFornecedor = await ClienteOuFornecedorRepository.findOneBy({id});

    if (!clienteOuFornecedor) {
      throw new BadRequestError("Cliente ou fornecedor não encontrado");
    }

    clienteOuFornecedor.status = false;

    await ClienteOuFornecedorRepository.save(clienteOuFornecedor);

    return clienteOuFornecedor;
  }
}

export default new ClienteOuFornecedorService();