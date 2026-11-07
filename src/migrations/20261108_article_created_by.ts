import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Adds articles.created_by_id: the CMS user who created the article.
// Used for writer edit permissions (the `author` field points to Authors, not users).
// Existing articles keep NULL, so only editors/admins can edit them.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_by_id integer REFERENCES users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS articles_created_by_idx ON articles (created_by_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS articles_created_by_idx;
    ALTER TABLE articles DROP COLUMN IF EXISTS created_by_id;
  `)
}
