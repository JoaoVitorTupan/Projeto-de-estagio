import { MigrationInterface, QueryRunner } from "typeorm";

export class AtualizacaoClienteOuFornecedor1786652402387 implements MigrationInterface {
    name = 'AtualizacaoClienteOuFornecedor1786652402387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" DROP COLUMN "endereco"`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" ADD "cep" character varying`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" ADD "logradouro" character varying`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" ADD "numero" character varying`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" ADD "complemento" character varying`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" ADD "bairro" character varying`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" ADD "cidade" character varying`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" ADD "uf" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" DROP COLUMN "uf"`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" DROP COLUMN "cidade"`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" DROP COLUMN "bairro"`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" DROP COLUMN "complemento"`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" DROP COLUMN "numero"`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" DROP COLUMN "logradouro"`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" DROP COLUMN "cep"`);
        await queryRunner.query(`ALTER TABLE "cliente_ou_fornecedor" ADD "endereco" character varying`);
    }

}
