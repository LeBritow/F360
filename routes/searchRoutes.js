import express from 'express';
import sqlite3 from 'sqlite3';
import { buscarUltimos10DiasDoBanco } from '../database/dataService.js';

const router = express.Router();
const db = new sqlite3.Database('./database/db.db');

router.get('/searchStocks', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query string vazia' });
    }

    const sql = `
        SELECT ticker, name
        FROM stocks
        WHERE ticker LIKE ? OR name LIKE ?
        LIMIT 10
    `;
    const params = [`%${query}%`, `%${query}%`];

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Erro no banco de dados:', err);
            return res.status(500).json({ error: 'Erro no servidor' });
        }
        res.json(rows);
    });
});

router.get('/stock-history/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
        const dadosHistoricos = await buscarUltimos10DiasDoBanco(ticker);
        res.json(dadosHistoricos);
    } catch (error) {
        console.error('Erro ao buscar dados históricos:', error.message);
        res.status(500).json({ error: 'Erro ao buscar dados históricos.' });
    }
});

export default router;
