// =========================================================
// CEREBRO DE LA OPERACIÓN (app.js)
// =========================================================

const notificacionDiv = document.getElementById('notificacion');

// 1. SISTEMA DE ALERTAS
function mostrarNotificacion(mensaje, tipo = 'exito') {
    notificacionDiv.textContent = mensaje;
    notificacionDiv.className = `notificacion ${tipo}`;
    notificacionDiv.style.display = 'block';
    // Ocultar después de 4 segundos
    setTimeout(() => { notificacionDiv.style.display = 'none'; }, 4000);
}

// 2. FETCH CENTRALIZADO CON MANEJO DE ERRORES DE RED
async function fetchAPI(url, opciones = {}) {
    const met = opciones.method || 'GET';
    document.getElementById('api-metodo').textContent = met;
    document.getElementById('api-url').textContent = url;
    const uiCodigo = document.getElementById('api-codigo');

    try {
        const respuesta = await fetch(url, opciones);
        const data = await respuesta.json();
        
        // Actualizar terminal visual
        uiCodigo.textContent = respuesta.status;
        uiCodigo.className = `badge ${respuesta.ok ? 'badge-success' : 'badge-error'}`;
        
        return { ok: respuesta.ok, status: respuesta.status, data };
    } catch (error) {
        uiCodigo.textContent = 'FAIL';
        uiCodigo.className = 'badge badge-error';
        mostrarNotificacion('Fallo crítico de conexión con el mainframe.', 'error');
        console.error('Umbrella Error:', error);
        return { ok: false, data: { status: 'error', message: 'Servidor inaccesible' } };
    }
}

// 3. UTILIDAD PARA BLOQUEAR BOTONES (Anti-Spam)
function procesandoFormulario(botonId, cargando) {
    const btn = document.getElementById(botonId);
    if (cargando) {
        btn.disabled = true;
        btn.dataset.textoOriginal = btn.textContent;
        btn.textContent = 'Procesando...';
        btn.style.opacity = '0.5';
    } else {
        btn.disabled = false;
        btn.textContent = btn.dataset.textoOriginal;
        btn.style.opacity = '1';
    }
}

// 4. NAVEGACIÓN SPA
function cambiarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`seccion-${seccion}`).style.display = 'block';
    document.querySelector(`button[onclick="cambiarSeccion('${seccion}')"]`).classList.add('active');
    
    if (seccion === 'experimentos') cargarExperimentos();
}

// =========================================================
// MÓDULOS CRUD
// =========================================================

// --- CIENTÍFICOS ---
async function cargarCientificos() {
    const res = await fetchAPI('/api/cientificos');
    if (!res.ok) return mostrarNotificacion(res.data.message, 'error');
    
    const tbody = document.getElementById('tbody-cientificos');
    tbody.innerHTML = res.data.data.map(c => `
        <tr>
            <td>${c.id}</td><td>${c.nombre}</td><td>${c.codigo_credencial}</td><td>${c.edad}</td>
            <td><button class="btn-eliminar" onclick="eliminarCientifico(${c.id})">Erradicar</button></td>
        </tr>
    `).join('');
    document.getElementById('tabla-cientificos').style.display = 'table';
    document.getElementById('contador-cientificos').textContent = res.data.count;
    document.getElementById('carga-cientificos').style.display = 'none';
}

document.getElementById('form-cientifico').addEventListener('submit', async (e) => {
    e.preventDefault();
    procesandoFormulario('btn-guardar-cientifico', true);

    const payload = {
        nombre: document.getElementById('cientifico-nombre').value,
        codigo_credencial: document.getElementById('cientifico-codigo').value,
        edad: document.getElementById('cientifico-edad').value
    };

    const res = await fetchAPI('/api/cientificos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    procesandoFormulario('btn-guardar-cientifico', false);

    if (!res.ok) {
        mostrarNotificacion(res.data.message, 'error');
    } else {
        mostrarNotificacion('Personal autorizado y registrado con éxito');
        cargarCientificos();
        e.target.reset();
    }
});

async function eliminarCientifico(id) {
    if(!confirm('¿Estás seguro de erradicar a este sujeto del sistema?')) return;
    const res = await fetchAPI(`/api/cientificos/${id}`, { method: 'DELETE' });
    if (!res.ok) mostrarNotificacion(res.data.message, 'error');
    else {
        mostrarNotificacion(res.data.data.mensaje);
        cargarCientificos();
    }
}

// --- PATÓGENOS ---
async function cargarPatogenos() {
    const res = await fetchAPI('/api/patogenos');
    if (!res.ok) return;

    const tbody = document.getElementById('tbody-patogenos');
    tbody.innerHTML = res.data.data.map(p => `
        <tr>
            <td>${p.id}</td><td>${p.nombre}</td><td>${p.tipo_cepa}</td><td>${p.stock_viales}</td>
            <td><button class="btn-eliminar" onclick="eliminarPatogeno(${p.id})">Incinerar</button></td>
        </tr>
    `).join('');
    document.getElementById('tabla-patogenos').style.display = 'table';
    document.getElementById('contador-patogenos').textContent = res.data.count;
    document.getElementById('carga-patogenos').style.display = 'none';
}

document.getElementById('form-patogeno').addEventListener('submit', async (e) => {
    e.preventDefault();
    procesandoFormulario('btn-guardar-patogeno', true);

    const payload = {
        nombre: document.getElementById('patogeno-nombre').value,
        tipo_cepa: document.getElementById('patogeno-cepa').value,
        stock_viales: document.getElementById('patogeno-stock').value
    };

    const res = await fetchAPI('/api/patogenos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    procesandoFormulario('btn-guardar-patogeno', false);

    if (!res.ok) mostrarNotificacion(res.data.message, 'error');
    else {
        mostrarNotificacion('Muestra biológica almacenada');
        cargarPatogenos();
        e.target.reset();
    }
});

async function eliminarPatogeno(id) {
    if(!confirm('¿Incinerar todas las muestras de este patógeno?')) return;
    const res = await fetchAPI(`/api/patogenos/${id}`, { method: 'DELETE' });
    if (!res.ok) mostrarNotificacion(res.data.message, 'error'); // Mostrará error si hay experimentos asociados
    else {
        mostrarNotificacion(res.data.data.mensaje);
        cargarPatogenos();
    }
}

// --- EXPERIMENTOS ---
async function cargarExperimentos() {
    const res = await fetchAPI('/api/experimentos');
    if (!res.ok) return;

    const tbody = document.getElementById('tbody-experimentos');
    
    // Cargar selects para el formulario
    const cRes = await fetchAPI('/api/cientificos');
    const pRes = await fetchAPI('/api/patogenos');
    
    if (cRes.ok) {
        document.getElementById('experimento-cientifico').innerHTML = `<option value="">-- Seleccionar --</option>` + 
            cRes.data.data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
    if (pRes.ok) {
        document.getElementById('experimento-patogeno').innerHTML = `<option value="">-- Seleccionar --</option>` + 
            pRes.data.data.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
    }

    tbody.innerHTML = res.data.data.map(e => `
        <tr>
            <td>${e.id}</td><td>${e.cientifico_nombre}</td><td>${e.patogeno_nombre}</td>
            <td>${e.cantidad_dosis}</td><td>${e.resultado_mutacion}</td><td>${new Date(e.fecha).toLocaleString()}</td>
            <td><button class="btn-eliminar" onclick="eliminarExperimento(${e.id})">Purgar</button></td>
        </tr>
    `).join('');
    document.getElementById('tabla-experimentos').style.display = 'table';
    document.getElementById('contador-experimentos').textContent = res.data.count;
    document.getElementById('carga-experimentos').style.display = 'none';
}

document.getElementById('form-experimento').addEventListener('submit', async (e) => {
    e.preventDefault();
    procesandoFormulario('btn-registrar-experimento', true);

    const payload = {
        cientifico_id: document.getElementById('experimento-cientifico').value,
        patogeno_id: document.getElementById('experimento-patogeno').value,
        cantidad_dosis: document.getElementById('experimento-dosis').value,
        resultado_mutacion: document.getElementById('experimento-resultado').value
    };

    const res = await fetchAPI('/api/experimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    procesandoFormulario('btn-registrar-experimento', false);

    if (!res.ok) mostrarNotificacion(res.data.message, 'error');
    else {
        mostrarNotificacion('Experimento registrado en bitácora');
        cargarExperimentos();
        e.target.reset();
    }
});

async function eliminarExperimento(id) {
    if(!confirm('¿Borrar registro de este experimento? Esto no se puede deshacer.')) return;
    const res = await fetchAPI(`/api/experimentos/${id}`, { method: 'DELETE' });
    if (!res.ok) mostrarNotificacion(res.data.message, 'error');
    else {
        mostrarNotificacion(res.data.data.mensaje);
        cargarExperimentos();
    }
}

// --- B.O.W.S ---

// 5. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    cargarCientificos();
    cargarPatogenos();
    // Los experimentos se cargan cuando se abre la pestaña para tener los selects actualizados
});