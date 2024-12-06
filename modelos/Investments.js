import conexao from "../database/conexao";

class Investments{
    sessaoInvestimento(id){
        const sql = `SELECT * FROM investments WHERE user_id = ?`
        return new Promise((resolve,reject)=>{
            conexao.query(sql, [id],(erro,resultado)=>{
                if(erro){
                    reject(erro)  
                }else{
                    resolve(resultado)
                }
            })
        })
        
    }
    adicionarInvestimento(userId, ticker, value, quantity){
        const sql = ` INSERT INTO investments (user_id, ticker, value, quantity) VALUES (?, ?, ?, ?)`
        return new Promise((resolve,reject)=>{
            conexao.query(sql, [userId, ticker, value, quantity],(erro,resultado)=>{
                if(erro){
                    reject(erro)  
                }else{
                    resolve(resultado)
                }
            })
        })
    }
    atualizarInvestimento(ticker, value, quantity, id, userId){
        const sql = `UPDATE investments SET ticker = ?, value = ?, quantity = ? WHERE id = ? AND user_id = ?`;
        return new Promise((resolve,reject)=>{
            conexao.query(sql, [ticker, value, quantity, id, userId],(erro,resultado)=>{
                if(erro){
                    reject(erro)  
                }else{
                    resolve(resultado)
                }
            })
        })
    }
    deletarInvestimento(id, userId){
        const sql = `DELETE FROM investments WHERE id = ? AND user_id = ?`
        return new Promise((resolve,reject)=>{
            conexao.query(sql, [id,userId],(erro,resultado)=>{
                if(erro){
                    reject(erro)  
                }else{
                    resolve(resultado)
                }
            })
        })
    }
}
export default new Investments;