const mysql = require('mysql');
const connection = mysql.createConnection({
    user:process.env.USER,
    password:process.env.PASSWORD,
    host:process.env.HOST,
    port:process.env.DB_PORT,
    database:process.env.DATABASE
})
connection.connect((err)=>{
    if(err)
    console.log("Cannot connect"+err)
    else
    console.log("DB is up")
})
module.exports = connection;