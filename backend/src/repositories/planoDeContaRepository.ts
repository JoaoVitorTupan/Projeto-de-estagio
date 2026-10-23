import { AppDataSource } from "../config/data-source";
import { PlanoDeConta } from "../entities/planoDeConta";

const PlanoDeContaRepository = AppDataSource.getRepository(PlanoDeConta);

export default PlanoDeContaRepository;