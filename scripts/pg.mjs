// Local rootless Postgres for development.
// Swap DATABASE_URL for a Neon pooled string to move off this.
import EmbeddedPostgres from "embedded-postgres";

const pg = new EmbeddedPostgres({
  databaseDir: "./.pgdata",
  user: "postgres",
  password: "postgres",
  port: 5433,
  persistent: true,
});

const fresh = !(await import("node:fs")).existsSync("./.pgdata");
if (fresh) await pg.initialise();
await pg.start();

if (fresh) {
  await pg.createDatabase("legalbridge");
  console.log("created database legalbridge");
}

console.log("postgres ready on 5433");

const shutdown = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
