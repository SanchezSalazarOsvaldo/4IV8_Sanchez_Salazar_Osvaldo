const app = require('express')();
const mysql = require('mysql2');
const path = require('path');

const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'n0m3l0',
    database:'pnt_practica1'
});

app.use(require('express').static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log('Servidor iniciado en puerto ' + PORT));