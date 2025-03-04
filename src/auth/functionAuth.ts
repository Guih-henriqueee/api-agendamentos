import { Buffer } from 'node:buffer';

/**
 * Função para gerar o token de autenticação em base64.
 * 
 * @param email - O e-mail do usuário.
 * @param id - O ID único do usuário.
 * @param cpf - O CPF do usuário.
 * @returns O token gerado.
 */
export function GetAuth(email: string, id: string, cpf: string): string {
  // Criando um dado único para ser codificado no token
  const data = `${cpf}:${email}:${id}`;
  
  // Codificando o dado em base64
  const token = Buffer.from(data).toString('base64');
  
  return token;
}

/**
 * Função para validar o token.
 * 
 * @param token - O token enviado na requisição.
 * @param email - O e-mail do usuário.
 * @param id - O ID único do usuário.
 * @param cpf - O CPF do usuário.
 * @returns Boolean indicando se o token é válido ou não.
 */
export function validateToken(token: string, email: string, id: string, cpf: string): boolean {
  // Decodificando o token em base64
  const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
  
  // Separando o CPF, email e ID
  const [decodedCpf, decodedEmail, decodedId] = decodedToken.split(':');
  
  // Validando se o CPF, email e ID do token são iguais aos fornecidos
  return decodedCpf === cpf && decodedEmail === email && decodedId === id;
}
