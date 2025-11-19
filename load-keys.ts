import * as fs from 'fs';
import * as path from 'path';

// Função para carregar as chaves salvas
function loadKeys() {
  const keysDir = path.join(__dirname, 'keys');
  const publicKeyPath = path.join(keysDir, 'public.pem');
  const privateKeyPath = path.join(keysDir, 'private.pem');

  // Verificar se os arquivos existem
  if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
    throw new Error('❌ Chaves não encontradas! Execute primeiro: npx ts-node key.ts');
  }

  // Carregar as chaves
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  return { publicKey, privateKey };
}

// Exemplo de uso
try {
  const { publicKey, privateKey } = loadKeys();
  
  console.log('✅ Chaves carregadas com sucesso!');
  console.log('\n--- CHAVE PÚBLICA ---');
  console.log(publicKey);
  console.log('\n--- CHAVE PRIVADA ---');
  console.log(privateKey);
} catch (error) {
  console.error(error.message);
}

export { loadKeys };
