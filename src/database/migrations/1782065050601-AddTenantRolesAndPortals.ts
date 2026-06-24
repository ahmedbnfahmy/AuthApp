import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantRolesAndPortals1782065050601 implements MigrationInterface {
  name = 'AddTenantRolesAndPortals1782065050601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD "customDomain" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD CONSTRAINT "UQ_tenants_customDomain" UNIQUE ("customDomain")`,
    );

    await queryRunner.query(`
      CREATE TABLE "moderator_portals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "slug" character varying(100) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_moderator_portals_tenant_slug" UNIQUE ("tenantId", "slug"),
        CONSTRAINT "PK_moderator_portals" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "moderator_portals"
      ADD CONSTRAINT "FK_moderator_portals_tenant"
      FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(
      `UPDATE "tenant_users" SET "role" = 'customer' WHERE "role" = 'member'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_users" ALTER COLUMN "role" SET DEFAULT 'customer'`,
    );
    await queryRunner.query(`
      ALTER TABLE "tenant_users"
      ADD CONSTRAINT "CHK_tenant_users_role"
      CHECK ("role" IN ('admin', 'moderator', 'cashier', 'customer'))
    `);

    await queryRunner.query(
      `ALTER TABLE "tenant_users" ADD "portalId" uuid`,
    );
    await queryRunner.query(`
      ALTER TABLE "tenant_users"
      ADD CONSTRAINT "FK_tenant_users_portal"
      FOREIGN KEY ("portalId") REFERENCES "moderator_portals"("id")
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenant_users" DROP CONSTRAINT "FK_tenant_users_portal"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_users" DROP COLUMN "portalId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_users" DROP CONSTRAINT "CHK_tenant_users_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_users" ALTER COLUMN "role" SET DEFAULT 'member'`,
    );

    await queryRunner.query(
      `ALTER TABLE "moderator_portals" DROP CONSTRAINT "FK_moderator_portals_tenant"`,
    );
    await queryRunner.query(`DROP TABLE "moderator_portals"`);

    await queryRunner.query(
      `ALTER TABLE "tenants" DROP CONSTRAINT "UQ_tenants_customDomain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP COLUMN "customDomain"`,
    );
  }
}
