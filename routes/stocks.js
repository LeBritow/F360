import StockHistory from "../modelos/StockHistory"
import express from "express"

const router = express.Router()

// Buscar informações de uma ação específica
router.get('/api/stock-info/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        // Buscar os últimos 10 dias de dados no banco
        const dadosDoBanco = await StockHistory.buscarUltimos10DiasDoBanco(ticker);

        if (dadosDoBanco && dadosDoBanco.length > 0) {
            return res.status(200).json(dadosDoBanco);
        }

        // Caso não estejam no banco, buscar da API Brapi
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

        // Salvar ou atualizar os dados no banco
        await StockHistory.salvarOuAtualizarDadosComTransacao(ticker, stockInfo);

        // Enviar dados formatados para o cliente
        res.status(200).json({
            ticker: stockInfo.symbol,
            date: stockInfo.regularMarketTime,
            open_price: stockInfo.regularMarketOpen || 'N/A',
            close_price: stockInfo.regularMarketPrice || 'N/A',
            high_price: stockInfo.regularMarketDayHigh || 'N/A',
            low_price: stockInfo.regularMarketDayLow || 'N/A',
            change_percent: stockInfo.regularMarketChangePercent || 'N/A',
            volume: stockInfo.regularMarketVolume || 'N/A',
            long_name: stockInfo.longName || 'Não disponível',
            logourl: stockInfo.logourl || 'N/A',
            earnings_per_share: stockInfo.earningsPerShare || 'N/A',
        });
    } catch (error) {
        console.error('Erro ao buscar ou salvar dados:', error.message);
        res.status(500).json({ error: 'Erro ao buscar ou salvar dados da ação' });
    }
});

// Rota para ranking das ações com maiores valores de fechamento
router.get('/api/ranking/maiores-valores', async (req, res) => {
    try {
        const resultado = await StockHistory.maioresValores()
        res.status(200).json(resultado)
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para ranking baseado nos maiores lucros por ação (EPS)
router.get('/api/ranking/earnings', async (req, res) => {
    try {
        const resultado = await StockHistory.earnings()
        res.status(200).json(resultado)
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para ranking das ações com maior volume (receita)
router.get('/api/ranking/receitas', async (req, res) => {
    try {
        const resultado = await StockHistory.receitas()

        res.status(200).json(resultado)
       
    } catch (error) {
        res.status(500).send('Erro interno no servidor');
    }
});

export default route;