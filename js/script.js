
const LS_DUENOS_KEY = 'duenosData';
const LS_MASCOTAS_KEY = 'mascotasData';


function obtenerDatos(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function guardarDatos(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


function validarAlfanumerico(valor) {
    return /^[a-zA-Z0-9]+$/.test(valor);
}

function validarAlfabetico(valor) {
    return /^[a-zA-Z\s]+$/.test(valor);
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefono(telefono) {
    return /^\d{8,15}$/.test(telefono);
}

function validarFechaNoFutura(fechaStr) {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    return fecha <= hoy;
}

function mostrarMensaje(idElemento, texto, tipo) {
    const el = document.getElementById(idElemento);
    if (!el) return;
    el.textContent = texto;
    el.className = `mensaje ${tipo}`;
}


function inicializarFormDueno() {
    const form = document.getElementById('form-dueno');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ident = form.identificacion.value.trim();
        const nombre = form.nombre.value.trim();
        const correo = form.correo.value.trim();
        const telefono = form.telefono.value.trim();
        const mensajeId = 'mensaje-duenos';
        
        if (!validarAlfanumerico(ident)) {
            return mostrarMensaje(mensajeId, 'Identificación debe ser alfanumérica.', 'error');
        }
        if (!validarAlfabetico(nombre)) {
            return mostrarMensaje(mensajeId, 'Nombre solo debe contener letras.', 'error');
        }
        if (!validarEmail(correo)) {
            return mostrarMensaje(mensajeId, 'Correo debe tener un formato válido.', 'error');
        }
        if (telefono && !validarTelefono(telefono)) {
            return mostrarMensaje(mensajeId, 'Teléfono debe tener entre 8 y 15 dígitos.', 'error');
        }
        
        const duenos = obtenerDatos(LS_DUENOS_KEY);
        
        if (duenos.some(d => d.identificacion === ident)) {
            return mostrarMensaje(mensajeId, 'Error: Ya existe un dueño con esta identificación.', 'error');
        }

        const nuevoDueno = {
            identificacion: ident,
            nombre: nombre,
            correo: correo,
            telefono: telefono,
            direccion: form.direccion.value.trim(),
        };

        duenos.push(nuevoDueno);
        guardarDatos(LS_DUENOS_KEY, duenos);
        
        mostrarMensaje(mensajeId, `Dueño ${nombre} registrado con éxito.`, 'exito');
        form.reset();
    });
}


function cargarDuenoSelect() {
    const select = document.getElementById('duenoAsignado');
    if (!select) return;

    const duenos = obtenerDatos(LS_DUENOS_KEY);
    select.innerHTML = '<option value="">-- Seleccione un Dueño --</option>';

    if (duenos.length === 0) {
        select.innerHTML = '<option value="">No hay dueños registrados</option>';
        return;
    }

    duenos.forEach(dueno => {
        const option = document.createElement('option');
        option.value = dueno.identificacion;
        option.textContent = `${dueno.nombre} (${dueno.identificacion})`;
        select.appendChild(option);
    });
}

function inicializarFormMascota() {
    const form = document.getElementById('form-mascota');
    if (!form) return;

    cargarDuenoSelect();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const idMascota = form.idMascota.value.trim();
        const nombreMascota = form.nombreMascota.value.trim();
        const fechaNacimiento = form.fechaNacimiento.value;
        const mensajeId = 'mensaje-mascotas';

        if (!validarAlfanumerico(idMascota)) {
            return mostrarMensaje(mensajeId, 'ID Mascota debe ser alfanumérico.', 'error');
        }
        if (!validarAlfabetico(nombreMascota)) {
            return mostrarMensaje(mensajeId, 'Nombre de Mascota solo debe contener letras.', 'error');
        }
        if (!validarFechaNoFutura(fechaNacimiento)) {
            return mostrarMensaje(mensajeId, 'La fecha de nacimiento no puede ser futura.', 'error');
        }

        const mascotas = obtenerDatos(LS_MASCOTAS_KEY);
        
        if (mascotas.some(m => m.idMascota === idMascota)) {
            return mostrarMensaje(mensajeId, 'Error: Ya existe una mascota con este ID.', 'error');
        }
        
        const nuevaMascota = {
            idMascota: idMascota,
            nombreMascota: nombreMascota,
            tipoMascota: form.tipoMascota.value,
            fechaNacimiento: fechaNacimiento,
            duenoAsignado: form.duenoAsignado.value, 
        };

        mascotas.push(nuevaMascota);
        guardarDatos(LS_MASCOTAS_KEY, mascotas);
        
        mostrarMensaje(mensajeId, `Mascota ${nombreMascota} registrada con éxito.`, 'exito');
        form.reset();
        cargarDuenoSelect(); 
    });
}


function renderizarListado() {
    const tablaBody = document.querySelector('#tabla-listado tbody');
    if (!tablaBody) return;

    const mascotas = obtenerDatos(LS_MASCOTAS_KEY);
    const duenos = obtenerDatos(LS_DUENOS_KEY);

    tablaBody.innerHTML = ''; 

    if (mascotas.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Aún no hay mascotas registradas.</td></tr>';
        return;
    }

    mascotas.forEach(mascota => {
        const dueno = duenos.find(d => d.identificacion === mascota.duenoAsignado);
        const nombreDueno = dueno ? dueno.nombre : 'Dueño NO ENCONTRADO';

        const fila = document.createElement('tr');
        
        let tdDueno = document.createElement('td');
        tdDueno.textContent = nombreDueno;
        fila.appendChild(tdDueno);
        
        let tdMascota = document.createElement('td');
        tdMascota.textContent = mascota.nombreMascota;
        fila.appendChild(tdMascota);

        let tdTipo = document.createElement('td');
        tdTipo.textContent = mascota.tipoMascota;
        fila.appendChild(tdTipo);

        let tdFecha = document.createElement('td');
        tdFecha.textContent = mascota.fechaNacimiento;
        fila.appendChild(tdFecha);

        tablaBody.appendChild(fila);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('form-dueno')) {
        inicializarFormDueno();
    } else if (document.getElementById('form-mascota')) {
        inicializarFormMascota();
    } else if (document.getElementById('tabla-listado')) {
        renderizarListado();
    }
});