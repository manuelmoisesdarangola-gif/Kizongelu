import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const distPath = path.resolve(__dirname, 'dist');

// Garante que a pasta dist existe caso a build ainda não tenha sido executada
if (!fs.existsSync(distPath) || !fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log('[Kizongelu] Pasta dist não encontrada. A executar compilação inicial (npm run build)...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.error('[Kizongelu] Erro durante compilação:', err);
  }
}

// Health check para balanceadores de carga e Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Servir ficheiros estáticos da build do Vite
app.use(
  express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// Fallback universal para Single Page Application (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Erro: Ficheiro index.html não encontrado no servidor.');
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[Kizongelu] Servidor de produção ativo em http://${HOST}:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[Kizongelu] Encerrando servidor (SIGTERM)...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Kizongelu] Encerrando servidor (SIGINT)...');
  server.close(() => process.exit(0));
});
