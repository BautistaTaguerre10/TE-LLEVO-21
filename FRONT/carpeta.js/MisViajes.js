let redirigido = false;  // Variable para controlar la redirección
let turno = {}; // Objeto para almacenar el turno recuperado del servidor

// Función para mostrar los turnos creados por el conductor
document.addEventListener('DOMContentLoaded', function () {
    // Obtener datos del usuario
    const userId = localStorage.getItem('userID');
    const userRole = localStorage.getItem('userRole');
    const itemsContainer = document.getElementById('itemsContainer');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const dateInput = document.getElementById('fecha');
    const showAllButton = document.getElementById('showAllButton');

    // Verificar si es conductor
    if (userRole !== 'conductor') {
        window.location.href = 'login.html';
        return;
    }

    // Función para obtener viajes del conductor
    function obtenerViajes(filtros = null) {
        let url = `http://localhost:3000/api/viajes/conductor?conductorId=${userId}`;
        
        if (filtros) {
            if (filtros.nombre) url += `&nombreTransporte=${encodeURIComponent(filtros.nombre)}`;
            if (filtros.fecha) url += `&fecha=${encodeURIComponent(filtros.fecha)}`;
        }
        
        console.log('URL de la petición:', url); // Para debug
        
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || 'Error en el servidor');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos:', data);
            // Asegurarnos de que data sea un array
            const viajes = Array.isArray(data) ? data : [];
            mostrarViajes(viajes);
        })
        .catch(error => {
            console.error('Error:', error);
            itemsContainer.innerHTML = `
                <div class="error-message">
                    Error al cargar los viajes: ${error.message}
                </div>`;
        });
    }

    // Eventos de búsqueda
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const nombre = searchInput.value.trim();
            const fecha = dateInput.value;

            if (!nombre && !fecha) {
                alert('Ingrese un nombre o fecha para buscar');
                return;
            }

            obtenerViajes({ nombre, fecha });
        });
    }

    if (showAllButton) {
        showAllButton.addEventListener('click', () => obtenerViajes());
    }

    // Función para mostrar viajes
    function mostrarViajes(viajes) {
        if (!itemsContainer) return;

        itemsContainer.innerHTML = '';
        
        if (!viajes || viajes.length === 0) {
            itemsContainer.innerHTML = `
                <div class="no-pasajeros">
                    No se encontraron viajes para las fechas especificadas.
                </div>`;
            return;
        }

        viajes.forEach(viaje => {
            const fechaCreacion = viaje.fecha.split('T')[0];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-container');

            itemDiv.innerHTML = `
                <h3><i class="fas fa-bus"></i> ${viaje.nombre_transporte}</h3>
                <div class="viaje-info-grid">
                    <div class="viaje-info-item">
                        <strong>Viaje ID:</strong> ${viaje.id}
                    </div>
                    <div class="viaje-info-item">
                        <strong>Fecha:</strong> ${fechaCreacion}
                    </div>
                    <div class="viaje-info-item">
                        <strong>Tipo de Viaje:</strong> ${obtenerTipoViaje(viaje.tipo_viaje)}
                    </div>
                    <div class="viaje-info-item">
                        <strong>Hora:</strong> ${viaje.hora}
                    </div>
                </div>
                
                <h4><i class="fas fa-users"></i> Pasajeros</h4>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>DNI</th>
                                <th>Teléfono</th>
                            </tr>
                        </thead>
                        <tbody id="pasajeros-${viaje.id}">
                            <tr><td colspan="5">Cargando pasajeros...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div class="botones-container">
                    <button class="modificar-btn" onclick="modificarViaje(${viaje.id})">
                        <i class="fas fa-edit"></i> Modificar
                    </button>
                    <button class="eliminar-btn" onclick="eliminarViaje(${viaje.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `;

            itemsContainer.appendChild(itemDiv);
            obtenerPasajeros(viaje.id);
        });
    }

    // Función para obtener pasajeros de un viaje
    function obtenerPasajeros(viajeId) {
        fetch(`http://localhost:3000/api/viajes/pasajeros?viajeId=${viajeId}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        return []; // Retornar array vacío si no hay pasajeros
                    }
                    throw new Error('Error al obtener pasajeros');
                }
                return response.json();
            })
            .then(pasajeros => {
                const tbody = document.getElementById(`pasajeros-${viajeId}`);
                if (!tbody) return;

                if (!pasajeros || pasajeros.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5">No hay pasajeros registrados</td></tr>';
                    return;
                }

                tbody.innerHTML = pasajeros.map(pasajero => `
                    <tr>
                        <td>${pasajero.pasajeroId}</td>
                        <td>${pasajero.name}</td>
                        <td>${pasajero.email}</td>
                        <td>${pasajero.DNI}</td>
                        <td>${pasajero.telefono}</td>
                    </tr>
                `).join('');
            })
            .catch(error => {
                console.error('Error:', error);
                const tbody = document.getElementById(`pasajeros-${viajeId}`);
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="5">Error al cargar pasajeros</td></tr>';
                }
            });
    }

    // Cargar viajes al inicio
    obtenerViajes();
});

//funcion para modificar un viaje 
function modificarViaje(viajeId) {
    const nuevaFecha = prompt('Nueva fecha (YYYY-MM-DD):');
    const nuevaHora = prompt('Nueva hora (HH:MM):');

    if (!nuevaFecha || !nuevaHora) return;

    fetch(`http://localhost:3000/api/viajes/${viajeId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fecha: nuevaFecha, hora: nuevaHora })
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al modificar');
        return data;
    })
    .then(() => {
        alert('Viaje modificado exitosamente');
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`Error al modificar el viaje: ${error.message}`);
    });
}


//funcion para eliminar viaje 
function eliminarViaje(viajeId) {
    if (!confirm('¿Confirmar eliminación del viaje?')) return;

    fetch(`http://localhost:3000/api/viajes/${viajeId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error al eliminar');
        return data;
    })
    .then(data => {
        alert(data.message || 'Viaje eliminado exitosamente');
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`Error al eliminar el viaje: ${error.message}`);
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

