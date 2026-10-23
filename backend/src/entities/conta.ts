import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { Usuario } from "./usuario";
import { ClienteOuFornecedor } from "./clienteOuFornecedor";
import { PlanoDeConta } from "./planoDeConta";

export type TipoConta = "receita" | "despesa";
export type StatusConta = "aberto" | "pago" | "recebido" | "vencido";

@Entity("conta")
export class Conta {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: [
            "receita",
            "despesa"
        ]
    })
    tipo: TipoConta;

    @Column({
        type: "varchar"
    })
    descricao: string;

    @Column({
        type: "float"
    })
    valor: number;

    @Column({
        type: "enum",
        enum: [
            "aberto",
            "pago",
            "recebido",
            "vencido"
        ]
    })
    status: StatusConta;

    @Column({
        type: "date"
    })
    data_vencimento: Date;

    @ManyToOne(
        () => ClienteOuFornecedor
    )
    @JoinColumn({
        name: "cliente_ou_fornecedor_id"
    })
    clienteOuFornecedor: ClienteOuFornecedor;

    @ManyToOne(
        () => Usuario
    )
    @JoinColumn({
        name: "usuario_id"
    })
    usuario: Usuario;

    @ManyToOne(
        () => PlanoDeConta
    )
    @JoinColumn({
        name: "plano_de_conta_id"
    })
    planoDeConta: PlanoDeConta;
}