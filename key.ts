import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Criar diretório keys se não existir
const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Salvar chave pública
const publicKeyPath = path.join(keysDir, 'public.pem');
fs.writeFileSync(publicKeyPath, publicKey);

// Salvar chave privada
const privateKeyPath = path.join(keysDir, 'private.pem');
fs.writeFileSync(privateKeyPath, privateKey);

console.log('✅ Chaves RSA geradas e salvas com sucesso!');
console.log(`📁 Chave pública: ${publicKeyPath}`);
console.log(`🔐 Chave privada: ${privateKeyPath}`);

console.log('\n--- CHAVE PÚBLICA ---');
console.log(publicKey);
console.log('\n--- CHAVE PRIVADA ---');
console.log(privateKey);
