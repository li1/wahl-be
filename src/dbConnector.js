"use strict";

import { Pool } from "pg";

const pool = new Pool({
  user: "malte",
  host: "127.0.0.1",
  port: 5432,
  database: "wahl",
  passwort: ""
});

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

console.log("Gruezi")

export const shutdown = async () => {
  console.log("Shutting down");
  await pool.end();
  console.log("Shut down.");
}

export const query = (text, params) => pool.query(text, params)
