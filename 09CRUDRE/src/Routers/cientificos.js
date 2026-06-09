const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarCientifico(datos) {
    const errores = [];
    
    // Expresión regular: 3 letras mayúsculas, un guion, 3 números (ej: UMB-001)
    const regexCredencial = /^[A-Z]{3}-[0-9]{3}$/;

    if (!datos.nombre || datos.nombre.trim().length < 2 || datos.nombre.trim().length > 100) {
        errores.push('El nombre debe tener entre 2 y 100 caracteres');
    }
        
    if (!datos.codigo_credencial) {
        errores.push('El código de credencial es obligatorio');
    } else {
        // Forzamos mayúsculas en el backend antes de evaluar la estructura
        const codigoLimpio = datos.codigo_credencial.trim().toUpperCase();
        if (!regexCredencial.test(codigoLimpio)) {
            errores.push('El código de credencial debe tener el formato oficial en mayúsculas (ej: UMB-001)');
        }
    }
        
    if (!datos.edad || isNaN(datos.edad) || parseInt(datos.edad) < 18 || parseInt(datos.edad) > 120) {
        errores.push('La edad debe ser un número válido entre 18 y 120 años');
    }
        
    return errores;
}

router.get('/', async (req, res) => {
    try {
        const [cientificos] = await db.execute('SELECT * FROM cientificos ORDER BY id ASC');
        res.json({ status: 'success', data: cientificos, count: cientificos.length });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [cientificos] = await db.execute('SELECT * FROM cientificos WHERE id = ?', [req.params.id]);
        if (cientificos.length === 0) return res.status(404).json({ status: 'error', message: 'Científico no encontrado' });
        res.json({ status: 'success', data: cientificos[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        // 1. Aquí llamamos a la validación que hicimos
        const errores = validarCientifico(req.body);
        
        // 2. Si hay errores, mandamos el mensaje a tu frontend y NO avanzamos.
        // Esto es lo que hace que salga tu notificación roja.
        if (errores.length > 0) {
            return res.status(400).json({ status: 'error', message: errores.join('; ') });
        }

        // 3. Si todo está bien, guardamos en la base de datos
        const { nombre, codigo_credencial, edad } = req.body;
        const [resultado] = await db.execute(
            'INSERT INTO cientificos (nombre, codigo_credencial, edad) VALUES (?, ?, ?)',
            [nombre.trim(), codigo_credencial.trim().toUpperCase(), parseInt(edad)]
        );

        const [nuevo] = await db.execute('SELECT * FROM cientificos WHERE id = ?', [resultado.insertId]);
        res.status(201).json({ status: 'success', data: nuevo[0] });
    } catch (error) {
        // Tu manejo de errores de siempre
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ status: 'error', message: 'Ese código de credencial ya está registrado' });
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const errores = validarCientifico(req.body);
        if (errores.length > 0) return res.status(400).json({ status: 'error', message: errores.join('; ') });

        const { nombre, codigo_credencial, edad } = req.body;
        await db.execute(
            'UPDATE cientificos SET nombre = ?, codigo_credencial = ?, edad = ? WHERE id = ?',
            [nombre.trim(), codigo_credencial.trim(), parseInt(edad), id]
        );

        const [actualizado] = await db.execute('SELECT * FROM cientificos WHERE id = ?', [id]);
        res.json({ status: 'success', data: actualizado[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ status: 'error', message: 'Ese código de credencial ya está en uso' });
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [cientifico] = await db.execute('SELECT id, nombre FROM cientificos WHERE id = ?', [req.params.id]);
        if (cientifico.length === 0) return res.status(404).json({ status: 'error', message: 'Científico no encontrado' });

        await db.execute('DELETE FROM cientificos WHERE id = ?', [req.params.id]);
        res.json({ status: 'success', data: { mensaje: `Personal "${cientifico[0].nombre}" eliminado del sistema` } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;