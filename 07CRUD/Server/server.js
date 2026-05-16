// framework para simplificar la creacion del servidor
const express = require('express');

// modulo para trabajar con rutas
const path = require('path');

// modulo para mysql
const mysql = require('mysql2');

// crear la aplicacion
const app = express();

// configurar puerto
const PORT = process.env.PORT || 3000;

// configurar lectura de json
app.use(express.json());

// configurar carpeta publica para archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// conexion a la base de datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'n0m3l0',
    database: 'pnt_practica1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// crear promesas para mysql
const db = pool.promise();

// middleware para mostrar las peticiones en consola
app.use((req, res, next) => {
    console.log(
        `[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`
    );
    next();
});

// ruta de prueba
app.get('/api', async (req, res) => {
    try{
        res.json({
            mensaje: 'Servidor funcionando correctamente'
        });
    }catch(error){
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// manejar errores cuando no exista la ruta
app.use((req, res) => {
    res.status(404).send('Archivo o ruta no encontrada');
});

// inicializar servidor
app.listen(PORT, () => {
    console.log('Servidor inicializado en el puerto: ' + PORT);
    console.log('Para salir presiona ctrl + c');
});