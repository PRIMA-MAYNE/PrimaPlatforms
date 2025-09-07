import { neon } from "@neondatabase/serverless";

export function getNeonClient() {
  const url =
    (typeof process !== "undefined" &&
      process.env &&
      process.env.NEON_DATABASE_URL) ||
    "";
  if (!url) {
    throw new Error("NEON_DATABASE_URL is not set");
  }
  return neon(url);
}

export async function testNeonConnection() {
  const sql = getNeonClient();
  const result = await sql`select 1 as ok`;
  return result?.[0]?.ok === 1;
}
