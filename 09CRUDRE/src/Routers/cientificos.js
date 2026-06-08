const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarCientifico(datos) {
    const errores = [];
    if (!datos.nombre || datos.nombre.trim().length < 2) errores.push('El nombre es obligatorio');
    if (!datos.codigo_credencial || datos.codigo_credencial.trim().length < 4) errores.push('El código de credencial debe tener al menos 4 caracteres');
    if (!datos.edad || isNaN(datos.edad) || parseInt(datos.edad) < 18) errores.push('La edad debe ser un número válido mayor o igual a 18');
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
        const errores = validarCientifico(req.body);
        if (errores.length > 0) return res.status(400).json({ status: 'error', message: errores.join('; ') });

        const { nombre, codigo_credencial, edad } = req.body;
        const [resultado] = await db.execute(
            'INSERT INTO cientificos (nombre, codigo_credencial, edad) VALUES (?, ?, ?)',
            [nombre.trim(), codigo_credencial.trim(), parseInt(edad)]
        );

        const [nuevo] = await db.execute('SELECT * FROM cientificos WHERE id = ?', [resultado.insertId]);
        res.status(201).json({ status: 'success', data: nuevo[0] });
    } catch (error) {
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