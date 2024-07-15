import argon2 from 'argon2';

/**
 * Gera um hash para a senha fornecida usando Argon2.
 * @param password - A senha a ser hashed.
 * @returns O hash da senha.
 */
export async function saltAndHashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch (err) {
    console.error('Error hashing password:', err);
    throw err;
  }
}

/**
 * Verifica se a senha fornecida corresponde ao hash armazenado.
 * @param hash - O hash armazenado da senha.
 * @param password - A senha fornecida pelo usuário.
 * @returns Verdadeiro se a senha corresponder ao hash, falso caso contrário.
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error('Error verifying password:', err);
    throw err;
  }
}