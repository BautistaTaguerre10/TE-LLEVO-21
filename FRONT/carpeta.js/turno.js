document.addEventListener('DOMContentLoaded', function() {
    // Obtener datos del usuario
    const userId = localStorage.getItem('userID');
    const userRole = localStorage.getItem('userRole');
    const name = localStorage.getItem('name');

    // Verificar si es conductor
    if (!userId || userRole !== 'conductor') {
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar nombre del conductor
    const nameElement = document.getElementById('name');
    if (nameElement) {
        nameElement.textContent = name;
    }

    // Configurar el formulario de creación de viaje
    const turnoForm = document.getElementById('turnoForm');
    if (turnoForm) {
        turnoForm.addEventListener('submit', crearViaje);
    }

    // Configurar el modal
    configurarModal();
});

// Función para crear un viaje
async function crearViaje(event) {
    event.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const formData = {
        userId: localStorage.getItem('userID'),
        nombre_transporte: document.getElementById('nombre_transporte').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        asientos_disponibles: document.getElementById('asientos_disponibles').value,
        tipo_viaje: document.getElementById('tipo_viaje').value,
        precio: document.getElementById('precio').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/viajes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Respuesta del servidor:', data);

        if (data.success) {
            mostrarConfirmacion({
                success: true,
                message: 'Viaje creado exitosamente'
            });
            guardarDatosViaje(data.viajeId, formData);
            setTimeout(() => {
                window.location.href = 'MisViajes.html';
            }, 2000);
        } else {
            mostrarConfirmacion({
                success: false,
                message: data.message || 'Error al crear el viaje'
            });
        }
    } catch (error) {
        console.error('Error al crear viaje:', error);
        mostrarConfirmacion({
            success: false,
            message: 'Error de conexión con el servidor'
        });
    }
}

// Función para mostrar confirmación
function mostrarConfirmacion(data) {
    const confirmation = document.getElementById('confirmation');
    if (confirmation) {
        confirmation.textContent = data.message;
        confirmation.style.color = data.success ? '#28a745' : '#dc3545';
        confirmation.style.fontWeight = 'bold';
    }
    
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = "block";
        
        // Auto cerrar el modal después de 3 segundos si fue exitoso
        if (data.success) {
            setTimeout(() => {
                cerrarModal();
            }, 3000);
        }
    }
}

// Función para guardar datos del viaje
function guardarDatosViaje(viajeId, formData) {
    const datosViaje = {
        viaje_id: viajeId,
        nombre_transporte: formData.nombre_transporte,
        fecha: formData.fecha,
        tipo_viaje: formData.tipo_viaje,
        hora_inicio: formData.hora,
        asientos_disponibles: formData.asientos_disponibles,
        precio: formData.precio
    };

    Object.entries(datosViaje).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });
}

// Función para configurar el modal
function configurarModal() {
    const modal = document.getElementById('confirmationModal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) {
        closeBtn.onclick = cerrarModal;
    }

    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        if (event.target === modal) {
            cerrarModal();
        }
    };
}

// Función para cerrar el modal
function cerrarModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = "none";
    }

    const form = document.getElementById('turnoForm');
    if (form) {
        form.reset();
    }
}

function redirigirMenu(section) {
    // Obtener el rol del usuario desde localStorage
    const userRole = localStorage.getItem('userRole');

    // Definir las rutas para cada rol y sección
    const routes = {
        pasajero: {
            Buscar: 'ReservasPasajero.html',
            Actividad: 'Actividad.html', 
            Notificaciones: 'Notificaciones.html',
        },
        conductor: {
            Buscar: 'Turnoconductor.html',
            Actividad: 'MisViajes.html',
            Notificaciones: 'Notificaciones.html', 
        },
     
    };

    // Validar que el rol y la sección existan
    if (!userRole || !routes[userRole]) {
        console.error('Rol de usuario no válido o no encontrado');
        window.location.href = 'login.html';
        return;
    }

    // Obtener la ruta correspondiente
    const route = routes[userRole][section];
    
    if (!route) {
        console.error('Sección no válida');
        return;
    }

    // Redirigir a la página correspondiente
    try {
        window.location.href = route;
    } catch (error) {
        console.error('Error al redirigir:', error);
        alert('Hubo un error al cambiar de página. Por favor intente nuevamente.');
    }
}

// Validaciones de formulario
function validarFormulario() {
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const asientos = document.getElementById('asientos_disponibles').value;
    const precio = document.getElementById('precio').value;

    // Validar fecha
    const fechaActual = new Date();
    const fechaSeleccionada = new Date(fecha);
    if (fechaSeleccionada < fechaActual) {
        alert('La fecha no puede ser anterior a hoy');
        return false;
    }

    // Validar hora
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(hora)) {
        alert('Formato de hora inválido');
        return false;
    }

    // Validar asientos
    if (asientos < 1 || asientos > 50) {
        alert('El número de asientos debe estar entre 1 y 50');
        return false;
    }

    // Validar precio
    if (precio <= 0) {
        alert('El precio debe ser mayor a 0');
        return false;
    }

    return true;
}