import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782065050600 implements MigrationInterface {
    name = 'InitialSchema1782065050600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "domainSlug" character varying(100) NOT NULL, "status" character varying NOT NULL DEFAULT 'active', CONSTRAINT "UQ_76cfa4f266ec4be3d5ddd9d2ffe" UNIQUE ("domainSlug"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tenant_users" ("tenantId" uuid NOT NULL, "userId" uuid NOT NULL, "role" character varying(50) NOT NULL DEFAULT 'member', CONSTRAINT "PK_8fa3e63dcfe2fe25531f8849e45" PRIMARY KEY ("tenantId", "userId"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "passwordHash" character varying(255) NOT NULL, "isGlobalAdmin" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD CONSTRAINT "FK_b60b5094f416190c9b3103cba2a" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_users" ADD CONSTRAINT "FK_5c0a747551be06a29ac8196037e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP CONSTRAINT "FK_5c0a747551be06a29ac8196037e"`);
        await queryRunner.query(`ALTER TABLE "tenant_users" DROP CONSTRAINT "FK_b60b5094f416190c9b3103cba2a"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "tenant_users"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
    }

}
