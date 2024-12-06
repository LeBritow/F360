import mysql from "mysql";

const conexao = mysql.createConnection({
    host:"localhost",
    port:3306,
    user:admin,
    password:"finance360",
    database:"F360"
})

export default conexao;