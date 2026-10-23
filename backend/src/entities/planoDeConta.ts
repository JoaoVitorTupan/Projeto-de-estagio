import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity("plano_de_conta")
export class PlanoDeConta {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        nullable: false
    })
    nome: string;

    @Column({
        type: "varchar",
        nullable: false
    })
    descricao: string;

    @Column({
        type: "boolean",
        default: true
    })
    status: boolean;
}