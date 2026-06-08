const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de la aplicación
app.use(cors());
app.use(express.json());

// Logger de consola estilo Umbrella Terminals
app.use((req, res, next) => {
    console.log(`[UMBRELLA-MAINFRAME][${new Date().toLocaleTimeString()}] ${req.method} -> ${req.url}`);
    next();
});

// Servir archivos estáticos de la interfaz
app.use(express.static(path.join(__dirname, 'public')));

// Importación de Routers desde la carpeta src/
const cientificosRouter = require('./src/Routers/cientificos');
const patogenosRouter = require('./src/src/Routers/patogenos');
const experimentosRouter = require('./src/Routers/experimentos');
const bowsRouter = require('./src/Routers/bows');

// Registro de Endpoints del Negocio
app.use('/api/cientificos', cientificosRouter);
app.use('/api/patogenos', patogenosRouter);
app.use('/api/experimentos', experimentosRouter);
app.use('/api/bows', bowsRouter);

// Ruta de diagnóstico del mainframe
app.get('/api', (req, res) => {
    res.json({
        status: 'success',
        message: 'SISTEMA CENTRAL DE INVESTIGACIÓN UMBRELLA CORP. EN LÍNEA',
        mainframe_nodes: {
            cientificos: '/api/cientificos',
            patogenos: '/api/patogenos',
            experimentos: '/api/experimentos',
            bows: '/api/bows'
        }
    });
});

// Captura de rutas no autorizadas en la API
app.use('/api/*path', (req, res) => {
    res.status(404).json({ 
        status: 'error', 
        message: 'ACCESO DENEGADO. Protocolo de red no registrado en la base de datos de la colmena.' 
    });
});

// Manejador global de excepciones críticas
app.use((err, req, res, next) => {
    console.error('ALERTA ROJA EN EL CÓDIGO:', err.message);
    res.status(500).json({ 
        status: 'error', 
        message: 'Fallo de contención crítico en el servidor local.' 
    });
});

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`   SISTEMA INFORMÁTICO UMBRELLA CORP. EN LÍNEA        `);
    console.log(`   Acceso concedido en el puerto local: ${PORT}       `);
    console.log(`=======================================================`);
});