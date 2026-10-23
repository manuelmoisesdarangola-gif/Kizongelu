/**
 * @file lib/auth/password.ts
 * Hashing seguro de senhas com bcrypt (cost factor 12).
 */

import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

/**
 * Gera o hash de uma palavra-passe utilizando bcrypt com custo 12.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Valida uma palavra-passe plana contra o hash armazenado.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}
