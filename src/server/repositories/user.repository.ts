import "server-only";

import type {
  PoolClient,
  QueryResultRow,
} from "pg";

import { query } from "@/lib/db/query";

export interface LoginUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  imageUrl: string | null;
}

interface LoginUserRow
  extends QueryResultRow,
    LoginUser {}

interface InsertedUserRow extends QueryResultRow {
  id: string;
  email: string;
  name: string;
}

export interface NewUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export async function findUserByEmailForLogin(
  email: string,
): Promise<LoginUser | null> {
  const result = await query<LoginUserRow>(
    `SELECT
       id,
       email,
       name,
       password_hash AS "passwordHash",
       image_url AS "imageUrl"
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function insertUser(
  client: PoolClient,
  input: NewUserInput,
): Promise<{
  id: string;
  email: string;
  name: string;
}> {
  const result = await client.query<InsertedUserRow>(
    `INSERT INTO users (
       name,
       email,
       password_hash
     )
     VALUES ($1, $2, $3)
     RETURNING
       id,
       email,
       name`,
    [
      input.name,
      input.email,
      input.passwordHash,
    ],
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error(
      "User insertion did not return a user.",
    );
  }

  return user;
}