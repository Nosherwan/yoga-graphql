import knex from "knex";
import type { Knex } from "knex";
const TEST_QUERY = "SELECT 1";
const connection = process.env.DB_URL;
const client = "pg";

console.log(
  "🎻 Connection String found as environment variable: ",
  typeof connection === "string" && connection !== "",
);

function createStore(): Knex<any, unknown[]> {
  const store = knex({
    client,
    connection,
    debug: true,
  });

  store
    .raw(TEST_QUERY)
    .then(() => console.log("🗜 ✅ SQL connected."))
    .catch((e: any) => {
      console.log("🗜 ❗️ SQL not connected.");
      console.error(e);
    });

  return store;
}

const store = createStore();

export { store };
