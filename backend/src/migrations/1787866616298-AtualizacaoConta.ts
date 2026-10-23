import { MigrationInterface, QueryRunner } from "typeorm";

export class AtualizacaoConta1787866616298 implements MigrationInterface {
    name = 'AtualizacaoConta1787866616298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plano_de_conta" RENAME COLUMN "ativo" TO "status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plano_de_conta" RENAME COLUMN "status" TO "ativo"`);
    }

}
