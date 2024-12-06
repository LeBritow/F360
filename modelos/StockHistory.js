import conexao from "../database/conexao";

class StockHistory{
     // Buscar os últimos 10 dias de dados do banco
     async buscarUltimos10DiasDoBanco(ticker) {
        const sql = `
            SELECT * FROM stock_history
            WHERE ticker = ?
            ORDER BY date DESC
            LIMIT 10
        `;
        return this.executarQuery(sql, [ticker]);
    }

    // Salvar ou atualizar os dados com transação
    salvarOuAtualizarDadosComTransacao(ticker, stockInfo) {
        return new Promise((resolve, reject) => {
            conexao.beginTransaction(async (err) => {
                if (err) return reject(err);

                try {
                    // Extrair a data da API
                    const dataDaApi = stockInfo.regularMarketTime
                        ? stockInfo.regularMarketTime.split('T')[0]
                        : null;

                    if (!dataDaApi) {
                        throw new Error('A API não forneceu uma data válida.');
                    }

                    // Verificar se os dados do dia já estão no banco
                    const sqlCheckHoje = `
                        SELECT * FROM stock_history WHERE ticker = ? AND date = ?
                    `;
                    const registrosHoje = await this.executarQuery(sqlCheckHoje, [ticker, dataDaApi]);

                    if (registrosHoje.length > 0) {
                        console.log(`Dados para ${ticker} na data ${dataDaApi} já encontrados no banco.`);
                        conexao.commit((commitErr) => {
                            if (commitErr) return conexao.rollback(() => reject(commitErr));
                            resolve({ dados: registrosHoje[0], atualizado: false });
                        });
                        return;
                    }

                    // Inserir os dados no banco
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
                    await this.executarQuery(sqlInsert, [
                        ticker,
                        dataDaApi,
                        stockInfo.regularMarketOpen || null,
                        stockInfo.regularMarketPrice || null,
                        stockInfo.regularMarketDayHigh || null,
                        stockInfo.regularMarketDayLow || null,
                        stockInfo.regularMarketVolume || null,
                        stockInfo.longName || null,
                        stockInfo.regularMarketChangePercent || null,
                        stockInfo.earningsPerShare || null,
                    ]);

                    // Confirmar transação
                    conexao.commit((commitErr) => {
                        if (commitErr) return conexao.rollback(() => reject(commitErr));
                        console.log(`Dados inseridos no banco para ${ticker} na data ${dataDaApi}.`);
                        resolve({ dados: stockInfo, atualizado: true });
                    });
                } catch (error) {
                    // Reverter transação em caso de erro
                    conexao.rollback(() => {
                        console.error('Erro durante a transação:', error.message);
                        reject(error);
                    });
                }
            });
        });
    }

    
    buscarDadosDoBanco(ticker) {
        return new Promise((resolve, reject) => {
            const data = obterUltimaDataValida();
            const sql = `
                SELECT * FROM stock_history
                WHERE ticker = ? AND date = ?
            `;
        
            conexao.query(sql, [ticker, data], (erro, resultado) => {
                if (erro) {
                    console.error('Erro ao buscar dados no banco:', erro.message);
                    return reject(erro);
                }
                // Caso não encontre nenhuma linha, retornamos null
                resolve(resultado && resultado.length > 0 ? resultado[0] : null);
            });
        });
    }


    maioresValores(){
            const sql = `
                    SELECT ticker, MAX(close_price) AS valor
                    FROM stock_history
                    GROUP BY ticker
                    ORDER BY valor DESC
                    LIMIT 5;
            `;
        return new Promise((resolve,reject)=>{
            conexao.query(sql,(erro,resultado)=>{
                if(erro){
                    reject(erro);
                    
                }else{
                    resolve(resultado)
                }
            })
        })
    }

        earnings(){
            const sql = `
                SELECT ticker, long_name, earnings_per_share
                FROM stock_history
                WHERE earnings_per_share IS NOT NULL
                ORDER BY earnings_per_share DESC
                LIMIT 5;
            `;
            return new Promise((resolve,reject)=>{
                conexao.query(sql,(erro,resultado)=>{
                    if(erro){
                        reject(erro);
                
                    }else{
                        resolve(resultado)
                    }
                })
            })
        }   

        receitas(){
            const sql = `
                SELECT ticker, long_name, MAX(volume) AS receita
                FROM stock_history
                GROUP BY ticker
                ORDER BY receita DESC
                LIMIT 5;
            `;
            return new Promise((resolve,reject)=>{
                conexao.query(sql,(erro,resultado)=>{
                    if(erro){
                        reject(erro);
                
                    }else{
                        resolve(resultado)
                    }
                })
            })
        }   

    // Função utilitária para executar queries com Promises
    executarQuery(sql, params) {
        return new Promise((resolve, reject) => {
            conexao.query(sql, params, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }
}



export default new StockHistory;