import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fork } from 'child_process';

// Importação de módulos personalizados
import searchRoutes from './routes/searchRoutes.js';

// Configuração de paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Verificar se o token da API Brapi está configurado
if (!process.env.BRAPI_TOKEN) {
    console.error('⚠️  Token da Brapi não configurado. Verifique o arquivo .env.');
    process.exit(1);
}

// Inicializar o app Express
const app = express();

// Configurar o servidor para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar rotas específicas da API
app.use('/api', searchRoutes);

// ========================
// Inicialização do Servidor
// ========================

// Porta configurada no arquivo .env ou padrão 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor principal rodando na porta ${PORT}`);

    // Inicia o servidor de autenticação (arquivo authApp.js)
    const authServer = fork('./authApp.js');
    authServer.on('message', (msg) => {
        console.log('Mensagem do authApp.js:', msg);
    });
});
