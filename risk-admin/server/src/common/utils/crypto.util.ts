import { createHash, createCipheriv, createDecipheriv } from 'crypto';

/**
 * 敏感信息加解密工具
 * 注意：以下 AES 为占位实现，生产环境应使用 KMS / 专用密钥管理服务，
 * 密钥与 IV 应从环境变量或密钥托管平台读取，禁止硬编码。
 * TODO: 替换为真实 AES-256-GCM + 密钥托管
 */
// 32 字节密钥（aes-256 要求），占位用，务必替换为安全密钥
const AES_KEY = Buffer.from('0123456789abcdef0123456789abcdef', 'utf8');
// 16 字节 IV（cbc 要求）
const AES_IV = Buffer.from('0123456789abcdef', 'utf8');

/** 身份证号 SHA256 哈希（用于去重与精确查询，不可逆） */
export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** AES 加密（占位实现） */
export function aesEncrypt(plain: string): string {
  const cipher = createCipheriv('aes-256-cbc', AES_KEY, AES_IV);
  let enc = cipher.update(plain, 'utf8', 'base64');
  enc += cipher.final('base64');
  return enc;
}

/** AES 解密（占位实现） */
export function aesDecrypt(encrypted: string): string {
  const decipher = createDecipheriv('aes-256-cbc', AES_KEY, AES_IV);
  let dec = decipher.update(encrypted, 'base64', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
