const path = require('path');

try {
  require('dotenv').config({
    path: path.join(__dirname, '../../../.env'),
    quiet: true,
  });
} catch {
  // dotenv não disponível em produção — variáveis vêm do Netlify
}
