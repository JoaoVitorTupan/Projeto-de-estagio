import {Column, Entity, PrimaryGeneratedColumn, CreateDateColumn} from "typeorm";

@Entity('usuario')
export class Usuario {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    nome: string;

    @Column({ type: 'text', unique: true })
    email: string;

    @Column({ type: 'text' })
    senha: string;

    @Column({
        type: 'enum',
        enum: ['administrador', 'financeiro', 'gestor'],
        default: 'financeiro'
    })
    role: string;

    @CreateDateColumn({
        type: 'timestamp'
    })
    criado_em: Date;

    @Column({
        type: 'boolean',
        default: true
    })
    status: boolean;
}