const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarPatogeno(datos) {
    const errores = [];
    if (!datos.nombre || datos.nombre.trim().length < 2) errores.push('El nombre del patógeno es obligatorio');
    if (!datos.tipo_cepa || datos.tipo_cepa.trim().length < 2) errores.push('El tipo de cepa es obligatorio');
    if (datos.stock_viales === undefined || isNaN(datos.stock_viales) || parseInt(datos.stock_viales) < 0) errores.push('El stock de viales debe ser un número válido');
    return errores;
}

router.get('/', async (req, res) => {
    try {
        const [patogenos] = await db.execute('SELECT * FROM patogenos ORDER BY id ASC');
        res.json({ status: 'success', data: patogenos, count: patogenos.length });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [patogenos] = await db.execute('SELECT * FROM patogenos WHERE id = ?', [req.params.id]);
        if (patogenos.length === 0) return res.status(404).json({ status: 'error', message: 'Patógeno no encontrado' });
        res.json({ status: 'success', data: patogenos[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const errores = validarPatogeno(req.body);
        if (errores.length > 0) return res.status(400).json({ status: 'error', message: errores.join('; ') });

        const { nombre, tipo_cepa, stock_viales } = req.body;
        const [resultado] = await db.execute(
            'INSERT INTO patogenos (nombre, tipo_cepa, stock_viales) VALUES (?, ?, ?)',
            [nombre.trim(), tipo_cepa.trim(), parseInt(stock_viales)]
        );

        const [nuevo] = await db.execute('SELECT * FROM patogenos WHERE id = ?', [resultado.insertId]);
        res.status(201).json({ status: 'success', data: nuevo[0] });
    } catch (error) {
        console.error("Error en POST patogenos:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const errores = validarPatogeno(req.body);
        if (errores.length > 0) return res.status(400).json({ status: 'error', message: errores.join('; ') });

        const { nombre, tipo_cepa, stock_viales } = req.body;
        await db.execute(
            'UPDATE patogenos SET nombre = ?, tipo_cepa = ?, stock_viales = ? WHERE id = ?',
            [nombre.trim(), tipo_cepa.trim(), parseInt(stock_viales), id]
        );

        const [actualizado] = await db.execute('SELECT * FROM patogenos WHERE id = ?', [id]);
        res.json({ status: 'success', data: actualizado[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [patogeno] = await db.execute('SELECT id, nombre FROM patogenos WHERE id = ?', [req.params.id]);
        if (patogeno.length === 0) return res.status(404).json({ status: 'error', message: 'Patógeno no encontrado' });

        await db.execute('DELETE FROM patogenos WHERE id = ?', [req.params.id]);
        res.json({ status: 'success', data: { mensaje: `Patógeno "${patogeno[0].nombre}" erradicado` } });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(409).json({ status: 'error', message: 'No se puede eliminar el patógeno porque existen experimentos asociados a él' });
        }
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;