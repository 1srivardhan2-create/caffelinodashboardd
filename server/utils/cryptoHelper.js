const crypto = require('crypto');

// ENCRYPTION_KEY must be exactly 32 bytes (256 bits) for aes-256-cbc.
// If not provided in the environment, we use a default one for dev purposes,
// but in production it must be set.
const algorithm = 'aes-256-cbc';
const rawKey = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
const key = crypto.createHash('sha256').update(String(rawKey)).digest('base64').substring(0, 32);

/**
 * Encrypts a plain text string.
 * @param {string} text - The text to encrypt.
 * @returns {string} - The encrypted text formatted as iv:encryptedData
 */
function encrypt(text) {
  if (!text) return text;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts an encrypted string.
 * @param {string} text - The encrypted text formatted as iv:encryptedData.
 * @returns {string} - The decrypted plain text.
 */
function decrypt(text) {
  if (!text) return text;
  
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // Probably not encrypted
    
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt
};
