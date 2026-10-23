import { AppDataSource } from "../config/data-source";
import { ClienteOuFornecedor } from "../entities/clienteOuFornecedor";

const ClienteOuFornecedorRepository = AppDataSource.getRepository(ClienteOuFornecedor);

export default ClienteOuFornecedorRepository;