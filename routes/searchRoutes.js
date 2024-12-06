import express from 'express';

// tabelas 
import StockHistory from '../modelos/StockHistory';
import Stocks from '../modelos/Stocks';

const router = express.Router();


router.get('/searchStocks', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'A query string não pode estar vazia.' });
    }

    try{
        const params = [`%${query}%`, `%${query}%`];

        const  resultado = await Stocks.procurarStocks(params)
        res.status(200).json(resultado)
    }catch(error){
        console.error('Erro no banco de dados:', error);
        res.status(500).json({erro:'Erro no servidor'})
    }




  
});

router.get('/stock-history/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        const dadosHistoricos = await StockHistory.buscarUltimos10DiasDoBanco(ticker)
     
        res.status(200).json(dadosHistoricos);
    } catch (error) {
        console.error('Erro ao buscar dados históricos:', error.message);
        res.status(500).json({ error: 'Erro ao buscar dados históricos.' });
    }
});

export default router;
