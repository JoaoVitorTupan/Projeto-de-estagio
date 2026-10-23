import {Entity, PrimaryGeneratedColumn, Column,} from "typeorm";

export type Tipo = "cliente" | "fornecedor";

@Entity("cliente_ou_fornecedor")
export class ClienteOuFornecedor {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: ["cliente", "fornecedor"]
    })
    tipo: Tipo;

    @Column({
        type: "varchar"
    })
    nome: string;

    @Column({
        type: "varchar",
        unique: true
    })
    cpf_cnpj: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    email: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    telefone: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    cep: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    logradouro: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    numero: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    complemento: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    bairro: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    cidade: string;

    @Column({
        type: "varchar",
        nullable: true
    })
    uf: string;

    @Column({
        default: true
    })
    status: boolean;
}