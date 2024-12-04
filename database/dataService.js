import { format, subDays, isWeekend } from 'date-fns';
import db from './db.js';

export function obterUltimaDataValida(data = new Date()) {
    while (isWeekend(data)) {
        data = subDays(data, 1);
    }
    return format(data, 'yyyy-MM-dd');
}

export async function buscarUltimos10DiasDoBanco(ticker) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT * FROM stock_history
            WHERE ticker = ?
            ORDER BY date DESC
            LIMIT 10
        `;
        db.all(sql, [ticker], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar últimos 10 dias:', err.message);
                return reject(err);
            }
            resolve(rows || []);
        });
    });
}

export async function salvarOuAtualizarDados(ticker, stockInfo) {
    return new Promise((resolve, reject) => {
        const dataDaApi = stockInfo.regularMarketTime
            ? stockInfo.regularMarketTime.split('T')[0] 
            : null;

        if (!dataDaApi) {
            console.error('Erro: A API da Brapi não retornou uma data válida.');
            return reject(new Error('A API não forneceu uma data válida.'));
        }

        const dataHoje = obterUltimaDataValida();

        const sqlCheckHoje = `
            SELECT * FROM stock_history WHERE ticker = ? AND date = ?
        `;
        const sqlCheckAnterior = `
            SELECT * FROM stock_history WHERE ticker = ? AND date < ?
            ORDER BY date DESC LIMIT 1
        `;

        db.get(sqlCheckHoje, [ticker, dataDaApi], (err, rowHoje) => {
            if (err) {
                console.error('Erro ao verificar o histórico de hoje:', err.message);
                return reject(err);
            }

            if (rowHoje) {
                console.log(`Dados para ${ticker} na data ${dataDaApi} já encontrados no banco.`);
                return resolve({ dados: rowHoje, atualizado: false });
            }

            const sqlInsert = `
                INSERT INTO stock_history (
                    ticker, 
                    date, 
                    open_price, 
                    close_price, 
                    high_price, 
                    low_price, 
                    volume,
                    long_name,                    
                    change_percent,
                    earnings_per_share
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.run(sqlInsert, [
                ticker,
                dataDaApi, // Usa a data da API
                stockInfo.regularMarketOpen || null,
                stockInfo.regularMarketPrice || null,
                stockInfo.regularMarketDayHigh || null,
                stockInfo.regularMarketDayLow || null,
                stockInfo.regularMarketVolume || null,
                stockInfo.longName || null,
                stockInfo.regularMarketChangePercent || null,
                stockInfo.earningsPerShare || null
            ], (err) => {
                if (err) {
                    console.error('Erro ao inserir dados no banco:', err.message);
                    return reject(err);
                }
                console.log(`Dados inseridos no banco para ${ticker} na data ${dataDaApi}.`);
                resolve({ dados: stockInfo, atualizado: true });
            });
        });
    });
}

export async function buscarDadosDoBanco(ticker) {
    return new Promise((resolve, reject) => {
        const data = obterUltimaDataValida();
        const sql = `
            SELECT * FROM stock_history
            WHERE ticker = ? AND date = ?
        `;
        db.get(sql, [ticker, data], (err, row) => {
            if (err) {
                console.error('Erro ao buscar dados no banco:', err.message);
                return reject(err);
            }
            resolve(row || null);
        });
    });
}