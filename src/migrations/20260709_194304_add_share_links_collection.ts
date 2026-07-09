import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "share_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"article_id" integer NOT NULL,
  	"label" varchar,
  	"clicks" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "share_links_id" integer;
  
  ALTER TABLE "share_links" ADD CONSTRAINT "share_links_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_share_links_fk" FOREIGN KEY ("share_links_id") REFERENCES "public"."share_links"("id") ON DELETE cascade ON UPDATE no action;
  
  CREATE UNIQUE INDEX "share_links_key_idx" ON "share_links" USING btree ("key");
  CREATE INDEX "share_links_article_idx" ON "share_links" USING btree ("article_id");
  CREATE INDEX "share_links_updated_at_idx" ON "share_links" USING btree ("updated_at");
  CREATE INDEX "share_links_created_at_idx" ON "share_links" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_share_links_id_idx" ON "payload_locked_documents_rels" USING btree ("share_links_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_share_links_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "share_links_id";
  DROP TABLE "share_links" CASCADE;
  `)
}
