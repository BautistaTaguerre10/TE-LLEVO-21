let redirigido = false;  // Variable para controlar la redirección

document.addEventListener('DOMContentLoaded', function () {
    // Obtener userId y userRole desde localStorage
    const userId = localStorage.getItem('userID');
    const userRole = localStorage.getItem('userRole');
    const itemsContainer = document.getElementById('itemsContainer');
    const tituloPagina = document.getElementById('tituloPagina');

    // Imprimir los valores para depuración
    console.log('userId:', userId);
    console.log('userRole:', userRole);

    if (!userId || !userRole) {
        console.error('Error: No se pudo obtener el userId o userRole');
        return;
    }

    if (userRole === 'pasajero') {
        tituloPagina.textContent = 'MIS RESERVAS';

        // Modificar la ruta para obtener reservas ordenadas por fecha de creación (últimos viajes)
        fetch(`http://localhost:3000/api/reservas/porPasajero?pasajeroId=${userId}&ordenarPor=fechaCreacion&orden=desc`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data); // Para depuración

                if (!data || data.length === 0) {
                    itemsContainer.innerHTML = `
                        <div class="no-actividades">
                            No tienes reservas registradas
                        </div>`;
                          // Extraer solo la fecha de la cadena completa (antes de la 'T')
                const fechaCreacion = data.fecha.split('T')[0];
                } else {
                    itemsContainer.innerHTML = data.map(reserva => `
                        <div class="item-container">
                            <h3>Reserva #${reserva.id}</h3>
                            
                            <div class="item-info">
                                <div class="info-grupo">
                                    <label>Nombre del Transporte</label>
                                    <span>${reserva.nombre_transporte}</span>
                                </div>
                                <div class="info-grupo">
                                    <label>Número de Viaje</label>
                                    <span>${reserva.viaje_id}</span>
                                </div>
                                <div class="info-grupo">
                                    <label>Tipo de Viaje:</label>
                                     <span></span> ${obtenerTipoViaje(reserva.tipo_viaje)}
                                </div>
                                <div class="info-grupo">
                                    <label>Hora de Salida</label>
                                    <span>${reserva.hora_inicio}</span>
                                </div>
                                <div class="info-grupo">
                                    <label>Asientos Disponibles</label>
                                    <span>${reserva.asientos_disponibles}</span>
                                </div>
                                <div class="info-grupo">
                                    <label>Precio Base</label>
                                    <span>ARS ${reserva.precio}</span>
                                </div>
                                <div class="info-grupo">
                                    <label>Cargo por Servicio</label>
                                    <span>ARS ${reserva.precio * 0.1}</span>
                                </div>
                                <div class="info-grupo">
                                    <label>Total</label>
                                    <span>ARS ${parseFloat(reserva.precio) + (reserva.precio * 0.1)}</span>
                                </div>
                            </div>

                            <div class="botones-container">
                                <button class="eliminar-btn" onclick="eliminarReserva(${reserva.id})">
                                    <i class="fas fa-times"></i>
                                    Cancelar Reserva
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            })
            .catch(error => {
                console.error('Error al obtener las reservas:', error);
                itemsContainer.innerHTML = `
                    <div class="error-message">
                        Hubo un error al cargar tus reservas. Por favor, intenta nuevamente.
                    </div>`;
            });
    } else {
        itemsContainer.innerHTML = `
            <div class="error-message">
                Error: No se ha podido determinar el rol del usuario.
            </div>`;
    }
});

// Modificar la función eliminarReserva para actualizar los asientos disponibles
function eliminarReserva(reservaId, viajeId) {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        fetch(`http://localhost:3000/api/reservas/${reservaId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ viaje_id: viajeId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cancelar la reserva');
            }
            return response.json();
        })
        .then(data => {
            alert('Reserva cancelada exitosamente');
            location.reload(); // Recargar la página para actualizar la lista
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al cancelar la reserva.');
        });
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

// Función para obtener el tipo de viaje basado en el valor de la base de datos
function obtenerTipoViaje(tipo) {
    switch (tipo) {
        case 'ida':
            return 'Nueva Córdoba / Campus siglo 21';
        case 'vuelta':
            return 'Campus Siglo 21 / Nueva Córdoba';
        case 'ida_vuelta':
            return 'Los dos viajes';
        default:
            return 'Tipo de viaje desconocido';
    }
}