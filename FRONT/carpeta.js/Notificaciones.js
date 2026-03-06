// obtener y Mostrar las Notificaciones:
document.addEventListener('DOMContentLoaded', function () {
    const userId = localStorage.getItem('userID');
    const notificacionesLista = document.getElementById('notificacionesLista');

    if (!userId) {
        console.error('Error: No se pudo obtener el userID desde localStorage.');
        notificacionesLista.innerHTML = '<p class="error-message">Error: No se pudo identificar el usuario.</p>';
        return;
    }

    // Obtener las notificaciones del usuario
    fetch(`http://localhost:3000/api/notificaciones/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Notificaciones recibidas:', data); // Para depuración

        if (!data || data.length === 0) {
            notificacionesLista.innerHTML = `
                <div class="notificacion-vacia">
                    <p>No tienes notificaciones pendientes.</p>
                </div>`;
        } else {
            notificacionesLista.innerHTML = data.map(notificacion => `
                <div class="notificacion">
                    <p class="notificacion-mensaje">${notificacion.mensaje}</p>
                    <p class="notificacion-fecha">
                        <small>${formatearFecha(notificacion.fecha_creacion)}</small>
                    </p>
                </div>
            `).join('');
        }
    })
    .catch(error => {
        console.error('Error al obtener las notificaciones:', error);
        notificacionesLista.innerHTML = `
            <div class="error-message">
                <p>Hubo un error al cargar las notificaciones. Por favor, intenta nuevamente.</p>
                <p>Error: ${error.message}</p>
            </div>`;
    });
});

// Función auxiliar para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return 'Fecha no disponible';
    
    return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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

