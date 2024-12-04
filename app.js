import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import searchRoutes from './routes/searchRoutes.js'; // Outras rotas específicas
import { buscarDadosDoBanco, salvarOuAtualizarDados } from './database/dataService.js';
import fetch from 'node-fetch';
import { obterUltimaDataValida } from './database/dataService.js';
import db from './database/db.js';
import { fork } from 'child_process';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

if (!process.env.BRAPI_TOKEN) {
    console.error('⚠️  Token da Brapi não configurado. Verifique o arquivo .env.');
    process.exit(1);
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', searchRoutes);

app.get('/api/stock-info/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        // Busca no banco de dados
        const dadosDoBanco = await buscarDadosDoBanco(ticker);

        if (dadosDoBanco) {
            return res.json(dadosDoBanco);
        }

        const response = await fetch(`https://brapi.dev/api/quote/${ticker}`, {
            headers: {
                Authorization: `Bearer ${process.env.BRAPI_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na API da Brapi: ${response.status}`);
        }

        const brapiData = await response.json();
        const stockInfo = brapiData.results[0];

        if (!stockInfo) {
            throw new Error('Nenhum dado encontrado para o ticker na API da Brapi');
        }

        res.json({
            ticker: stockInfo.symbol,
            date: obterUltimaDataValida(),
            open_price: stockInfo.regularMarketOpen || 'N/A',
            close_price: stockInfo.regularMarketPrice || 'N/A',
            high_price: stockInfo.regularMarketDayHigh || 'N/A',
            low_price: stockInfo.regularMarketDayLow || 'N/A',
            change_percent: stockInfo.regularMarketChangePercent || 'N/A',
            volume: stockInfo.regularMarketVolume || 'N/A',
            long_name: stockInfo.longName || 'Não disponível',
            logourl: stockInfo.logourl || 'N/A',
            earnings_per_share : stockInfo.earningsPerShare || 'N/A',
        });

        await salvarOuAtualizarDados(ticker, stockInfo);
    } catch (error) {
        console.error('Erro ao buscar ou salvar dados:', error.message);
        res.status(500).json({ error: 'Erro ao buscar ou salvar dados da ação' });
    }
});

app.get('/api/ranking/maiores-valores', async (req, res) => {
    try {
        const sql = `
            SELECT ticker, MAX(close_price) as valor 
            FROM stock_history 
            GROUP BY ticker 
            ORDER BY valor DESC 
            LIMIT 5;
        `;
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor ao consultar banco' });
            }
            res.json(rows);
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/api/ranking/earnings', async (req, res) => {
    try {
        const sql = `
            SELECT ticker, long_name, earnings_per_share
            FROM stock_history
            WHERE earnings_per_share IS NOT NULL
            ORDER BY earnings_per_share DESC
            LIMIT 5
        `;
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        res.json(rows);
    } catch (error) {
        res.status(500).send('Erro interno no servidor');
    }
});

app.get('/api/ranking/receitas', async (req, res) => {
    try {
        const sql = `
            SELECT ticker, long_name, MAX(volume) as receita
            FROM stock_history
            GROUP BY ticker
            ORDER BY receita DESC
            LIMIT 5
        `;
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
        res.json(rows);
    } catch (error) {
        res.status(500).send('Erro interno no servidor');
    }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor principal rodando na porta ${PORT}`);

    // Inicia o servidor de autenticação (authApp.js)
    const authServer = fork('./authApp.js');
    authServer.on('message', (msg) => {
        console.log('Mensagem do authApp.js:', msg);
    });
});