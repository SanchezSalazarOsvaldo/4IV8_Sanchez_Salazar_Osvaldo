const express = require('express');
const router = express.Router();
const db = require('../DB/database');

function validarExperimento(datos) {
    const errores = [];
    if (!datos.cientifico_id || parseInt(datos.cientifico_id) <= 0) errores.push('El ID del científico es obligatorio');
    if (!datos.patogeno_id || parseInt(datos.patogeno_id) <= 0) errores.push('El ID del patógeno es obligatorio');
    if (!datos.cantidad_dosis || parseInt(datos.cantidad_dosis) <= 0) errores.push('La cantidad de dosis debe ser mayor a 0');
    if (!datos.resultado_mutacion || datos.resultado_mutacion.trim() === '') errores.push('El resultado de la mutación es obligatorio');
    return errores;
}

router.get('/', async (req, res) => {
    try {
        const [experimentos] = await db.execute(`
            SELECT 
                e.id, 
                c.nombre AS cientifico_nombre, 
                p.nombre AS patogeno_nombre, 
                e.cantidad_dosis, 
                e.resultado_mutacion, 
                e.fecha
            FROM experimentos e
            INNER JOIN cientificos c ON e.cientifico_id = c.id
            INNER JOIN patogenos p ON e.patogeno_id = p.id
            ORDER BY e.fecha DESC
        `);
        res.json({ status: 'success', data: experimentos, count: experimentos.length });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.post('/', async (req, res) => {
    try {
        const errores = validarExperimento(req.body);
        if (errores.length > 0) return res.status(400).json({ status: 'error', message: errores.join('; ') });

        const { cientifico_id, patogeno_id, cantidad_dosis, resultado_mutacion } = req.body;

        const [resultado] = await db.execute(
            'INSERT INTO experimentos (cientifico_id, patogeno_id, cantidad_dosis, resultado_mutacion) VALUES (?, ?, ?, ?)',
            [parseInt(cientifico_id), parseInt(patogeno_id), parseInt(cantidad_dosis), resultado_mutacion.trim()]
        );

        res.status(201).json({ 
            status: 'success', 
            data: { id: resultado.insertId, mensaje: 'Sujeto de prueba inoculado exitosamente' }
        });
    } catch (error) {
        console.error("Error en POST experimentos:", error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [existente] = await db.execute('SELECT id FROM experimentos WHERE id = ?', [id]);
        if (existente.length === 0) return res.status(404).json({ status: 'error', message: 'Experimento no encontrado' });

        await db.execute('DELETE FROM experimentos WHERE id = ?', [id]);
        res.json({ status: 'success', data: { mensaje: `Registro de experimento erradicado` } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

module.exports = router;