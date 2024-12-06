class Tabelas{
    init(conexao){
        this.conexao = conexao;
        this.criarDividendos()
        this.criarInvestimento()
        this.criarStockHistoria()
        this.criarStock()
    }
    criarDividendos(){
        const sql = `CREATE TABLE dividends (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        empresa VARCHAR(255) NOT NULL,
                        data DATE NOT NULL,
                        valor DECIMAL(10, 2) NOT NULL
                    );`
        this.conexao.query(sql,erro=>{
            if(erro){
                console.log(erro);
                
            }else{
                console.log("Tabela dividends criada com sucesso !!");
                
            }
        })
    }
    criarInvestimento(){
        const sql = `CREATE TABLE investments (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        ticker VARCHAR(20) NOT NULL,
                        value DECIMAL(10, 2) NOT NULL,
                        quantity INT NOT NULL
                    );`
        this.conexao.query(sql,erro=>{
            if(erro){
                console.log(erro);
                
            }else{
                console.log("Tabela Investimentos criada com sucesso !!");
                
            }
        })
    }
    criarStockHistoria(){
        const sql = `CREATE TABLE stock_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    ticker VARCHAR(20) NOT NULL,
                    date DATE NOT NULL,
                    open_price DECIMAL(10, 2) NOT NULL,
                    close_price DECIMAL(10, 2) NOT NULL,
                    high_price DECIMAL(10, 2) NOT NULL,
                    low_price DECIMAL(10, 2) NOT NULL,
                    volume BIGINT NOT NULL,
                    long_name VARCHAR(255),
                    change_percent DECIMAL(5, 2),
                    earnings_per_share DECIMAL(10, 2)
                );`
        this.conexao.query(sql,erro=>{
            if(erro){
                console.log(erro);
                
            }else{
                console.log("Tabela stock_history criada com sucesso !!");
                
            }
        })
        
    }
    criarStock(){
        const sql = `CREATE TABLE stocks (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        ticker VARCHAR(20) NOT NULL
                    );`
        this.conexao.query(sql,erro=>{
            if(erro){
                console.log(erro);
                
            }else{
                console.log("Tabela Stock criada com sucesso !!");
                
            }
        })
    }


}

export default new Tabelas;