import conexao from "../database/conexao";

class User{
    registrar(email, password) {
        return new Promise(async (resolve, reject) => {
            conexao.beginTransaction(async (err) => {
                if (err) return reject(err);

                try {
                    // Verifica se o email já existe
                    const [existingUsers] = await this.executarQuery(
                        `SELECT * FROM users WHERE email = ?`,
                        [email]
                    );
                    if (existingUsers.length > 0) {
                        // E-mail já existe, faz rollback
                        await this.rollbackTransaction();
                        return reject({ status: 400, message: 'E-mail já registrado.' });
                    }

                    // Insere o novo usuário
                    await this.executarQuery(
                        `INSERT INTO users (email, password) VALUES (?, ?)`,
                        [email, password]
                    );

                    // Faz commit da transação
                    conexao.commit((commitErr) => {
                        if (commitErr) {
                            return reject(commitErr);
                        }
                        resolve({ status: 201, message: 'Usuário registrado com sucesso!' });
                    });
                } catch (error) {
                    // Erro durante a execução, faz rollback
                    await this.rollbackTransaction();
                    reject(error);
                }
            });
        });
    }
    
    login(email,password){
        
        return new Promise((resolve,rejec))
            conexao.query('SELECT * FROM users WHERE email = ?', [email],(erro,resultado)=>{
                if(erro){
                    reject(erro)
                }else{
                    resolve(resultado)
                }
            }); 
            
            
           
        
        
                    
    };
    
     // Função utilitária para executar queries com Promises
     executarQuery(sql, params) {
        return new Promise((resolve, reject) => {
            conexao.query(sql, params, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            });
        });
    }
    // Função para rollback
    rollbackTransaction() {
        return new Promise((resolve, reject) => {
            conexao.rollback(() => {
                resolve();
            });
        });
    }
}

export default new User;

