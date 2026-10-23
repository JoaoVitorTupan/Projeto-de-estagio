import { MigrationInterface, QueryRunner } from "typeorm";

export class CriarConta1787529700478 implements MigrationInterface {
    name = 'CriarConta1787529700478'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."conta_tipo_enum" AS ENUM('receita', 'despesa')`);
        await queryRunner.query(`CREATE TYPE "public"."conta_status_enum" AS ENUM('aberto', 'pago', 'recebido', 'vencido')`);
        await queryRunner.query(`CREATE TABLE "conta" ("id" SERIAL NOT NULL, "tipo" "public"."conta_tipo_enum" NOT NULL, "descricao" character varying NOT NULL, "valor" double precision NOT NULL, "status" "public"."conta_status_enum" NOT NULL, "data_vencimento" date NOT NULL, "cliente_ou_fornecedor_id" integer, "usuario_id" integer, "plano_de_conta_id" integer, CONSTRAINT "PK_2b1224e0238deb008a6f232f992" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "conta" ADD CONSTRAINT "FK_1dc2ae90badf3cf426076ef6c29" FOREIGN KEY ("cliente_ou_fornecedor_id") REFERENCES "cliente_ou_fornecedor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conta" ADD CONSTRAINT "FK_38c65f5f74b7700aaa50963ea4a" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conta" ADD CONSTRAINT "FK_972af07f6ca7e81cc1be2588f49" FOREIGN KEY ("plano_de_conta_id") REFERENCES "plano_de_conta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conta" DROP CONSTRAINT "FK_972af07f6ca7e81cc1be2588f49"`);
        await queryRunner.query(`ALTER TABLE "conta" DROP CONSTRAINT "FK_38c65f5f74b7700aaa50963ea4a"`);
        await queryRunner.query(`ALTER TABLE "conta" DROP CONSTRAINT "FK_1dc2ae90badf3cf426076ef6c29"`);
        await queryRunner.query(`DROP TABLE "conta"`);
        await queryRunner.query(`DROP TYPE "public"."conta_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."conta_tipo_enum"`);
    }

}
