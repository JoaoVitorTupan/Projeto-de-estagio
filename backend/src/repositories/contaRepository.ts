import { AppDataSource } from "../config/data-source";
import { Conta } from "../entities/conta";

const contaRepository = AppDataSource.getRepository(Conta);

export default contaRepository;