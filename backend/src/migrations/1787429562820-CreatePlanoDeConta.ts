import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlanoDeConta1787429562820 implements MigrationInterface {
    name = 'CreatePlanoDeConta1787429562820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plano_de_conta" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "descricao" character varying NOT NULL, "ativo" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_3f0e2dbf9a5d31ea5f2d3c394ec" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "plano_de_conta"`);
    }

}
