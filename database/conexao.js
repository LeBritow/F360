import mysql from "mysql";

const conexao = mysql.createConnection({
    host:"finance.c32gek62eawj.us-east-1.rds.amazonaws.com",
    port:3306,
    user:admin,
    password:"finance360",
    database:"F360"
})

export default conexao;