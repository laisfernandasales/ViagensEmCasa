import argon2 from 'argon2';

/**
 * Gera um código de verificação de 6 caracteres (letras, números e símbolos).
 * @returns O código de verificação gerado.
 */
export function generateVerificationCode(length = 6): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }
  return code;
}

/**
 * Gera um hash para o código de verificação fornecido usando Argon2.
 * @param code - O código de verificação a ser hashed.
 * @returns O hash do código de verificação.
 */
export async function saltAndHashVerificationCode(code: string): Promise<string> {
  try {
    return await argon2.hash(code);
  } catch (err) {
    console.error('Error hashing verification code:', err);
    throw err;
  }
}

/**
 * Verifica se o código de verificação fornecido corresponde ao hash armazenado.
 * @param hash - O hash armazenado do código de verificação.
 * @param code - O código de verificação fornecido pelo usuário.
 * @returns Verdadeiro se o código corresponder ao hash, falso caso contrário.
 */
export async function verifyVerificationCode(hash: string, code: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, code);
  } catch (err) {
    console.error('Error verifying verification code:', err);
    throw err;
  }
}
