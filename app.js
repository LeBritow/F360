import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fork } from 'child_process';

// Importação de conexões e tabelas
import conexao from './database/conexao.js';
import Tabelas from './database/Tabelas.js';

// Importação de rotas
import searchRoutes from './routes/searchRoutes.js';
import stocks from './routes/stocks.js';



// Configuração de variáveis de ambiente
dotenv.config();

// Porta configurada no arquivo .env ou padrão 3000
const PORT = process.env.PORT || 3000;

// Inicializar o app Express
const app = express();

// Configuração de paths (para compatibilidade com ESModules)
const __filename = fileURLToPath(import.meta.url);


const __dirname = path.dirname(__filename);

// Verificar se o token da API Brapi está configurado
if (!process.env.BRAPI_TOKEN) {
    console.error('⚠️  Token da Brapi não configurado. Verifique o arquivo .env.');
    process.exit(1);
}

// Configurar o middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar o middleware para interpretar JSON no corpo das requisições
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar ao banco de dados e inicializar tabelas
conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao banco de dados:', erro);
        process.exit(1); // Finaliza o processo caso ocorra um erro
    } else {
        console.log('Conexão com o banco de dados estabelecida.');
        Tabelas.init(conexao); // Inicializar tabelas
    }
});

// Configurar rotas específicas da API
app.use('/api',searchRoutes);
app.use("/",stocks)


// Inicialização do Servidor Principal
app.listen(PORT, () => {
    console.log(`Servidor principal rodando na porta ${PORT}`);

    // Iniciar o servidor de autenticação (authApp.js)
    const authServerPath = path.join(__dirname, 'authApp.js');
    const authServer = fork(authServerPath);

    authServer.on('message', (msg) => {
        console.log('Mensagem do authApp.js:', msg);
    });

    authServer.on('error', (error) => {
        console.error('Erro no servidor de autenticação:', error.message);
    });
});
