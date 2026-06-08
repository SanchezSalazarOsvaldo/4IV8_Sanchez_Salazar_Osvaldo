const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarBow(datos) {
    const errores = [];
    if (!datos.nombre || datos.nombre.trim().length < 2) errores.push('El nombre de la B.O.W. es obligatorio');
    if (!datos.virus_base || datos.virus_base.trim().length < 2) errores.push('El virus base es obligatorio');
    if (!datos.informacion || datos.informacion.trim().length < 5) errores.push('La información del espécimen es obligatoria');
    return errores;
}

router.get('/', async (req, res) => {
    try {
        const [bows] = await db.execute('SELECT * FROM bows ORDER BY id ASC');
        res.json({ status: 'success', data: bows, count: bows.length });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [bows] = await db.execute('SELECT * FROM bows WHERE id = ?', [req.params.id]);
        if (bows.length === 0) return res.status(404).json({ status: 'error', message: 'B.O.W. no encontrada' });
        res.json({ status: 'success', data: bows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const errores = validarBow(req.body);
        if (errores.length > 0) return res.status(400).json({ status: 'error', message: errores.join('; ') });

        const { nombre, virus_base, informacion, imagen_url } = req.body;
        const [resultado] = await db.execute(
            'INSERT INTO bows (nombre, virus_base, informacion, imagen_url) VALUES (?, ?, ?, ?)',
            [nombre.trim(), virus_base.trim(), informacion.trim(), imagen_url ? imagen_url.trim() : null]
        );

        const [nueva] = await db.execute('SELECT * FROM bows WHERE id = ?', [resultado.insertId]);
        res.status(201).json({ status: 'success', data: nueva[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const errores = validarBow(req.body);
        if (errores.length > 0) return res.status(400).json({ status: 'error', message: errores.join('; ') });

        const { nombre, virus_base, informacion, imagen_url } = req.body;
        await db.execute(
            'UPDATE bows SET nombre = ?, virus_base = ?, informacion = ?, imagen_url = ? WHERE id = ?',
            [nombre.trim(), virus_base.trim(), informacion.trim(), imagen_url ? imagen_url.trim() : null, id]
        );

        const [actualizada] = await db.execute('SELECT * FROM bows WHERE id = ?', [id]);
        res.json({ status: 'success', data: actualizada[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [bow] = await db.execute('SELECT id, nombre FROM bows WHERE id = ?', [req.params.id]);
        if (bow.length === 0) return res.status(404).json({ status: 'error', message: 'B.O.W. no encontrada' });

        await db.execute('DELETE FROM bows WHERE id = ?', [req.params.id]);
        res.json({ status: 'success', data: { mensaje: `Espécimen "${bow[0].nombre}" erradicado` } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;