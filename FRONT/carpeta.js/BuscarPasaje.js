// Mensaje de prueba para verificar que el archivo se carga
console.log('=== ARCHIVO BUSCARPASAJE.JS CARGADO CORRECTAMENTE (v1) ===');

let redirigido = false;  // Variable para controlar la redirección

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Cargado - Iniciando script de búsqueda');
    
    // Obtener userId y userRole desde localStorage
    const userId = localStorage.getItem('userID');
    const userRole = localStorage.getItem('userRole');
    const name = localStorage.getItem('name');

    // Imprimir los valores de userId y userRole para depuración
    console.log('userId:', userId);
    console.log('userRole:', userRole);

    // Verificar si el usuario está logueado y es conductor
    if (!userId || !userRole || userRole !== 'pasajero') {
        console.log('Redirigiendo a login porque:', {
            userId: !userId ? 'userId no está definido' : 'userId está definido',
            userRole: !userRole ? 'userRole no está definido' : `userRole: ${userRole}`,
            reason: userRole !== 'pasajero' ? 'El rol no es pasajero' : 'El rol es pasajero'
        });

        // Si el usuario no está logueado o no es conductor, redirigir al login
        if (!redirigido) {
            redirigido = true;  // Asegurar que solo se redirige una vez
            window.location.href = 'login.html';
        }
        return;
    }

    // Continuar si el usuario es un conductor
    console.log('Usuario autenticado y con rol de pasajero.');
    // Mostrar los datos en el HTML
    document.getElementById('name').textContent = name;

    // Agregar el evento de búsqueda al formulario
    const formulario = document.getElementById('buscarPasajesForm');
    console.log('Formulario encontrado:', formulario);
    
    formulario.addEventListener('submit', function (event) {
        console.log('Formulario enviado - Iniciando búsqueda');
        event.preventDefault();
        
        const fecha = document.getElementById('fecha').value;
        const tipo_viaje = document.getElementById('tipo_viaje').value;
        
        console.log('Buscando viajes con fecha:', fecha, 'y tipo:', tipo_viaje);

        // Actualizar la URL para que coincida con la ruta del backend
        fetch(`http://localhost:3000/api/viajes/buscar?fecha=${fecha}&tipo_viaje=${tipo_viaje}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('Respuesta recibida:', response);
                if (!response.ok) {
                    if (response.status === 404) {
                        return { viajes: [] };
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos recibidos:', data);
                const resultadosDiv = document.getElementById('resultados');
                resultadosDiv.innerHTML = '';  // Limpiar resultados previos

                if (!data || data.length === 0) {
                    console.log('No se encontraron viajes');
                    resultadosDiv.innerHTML = '<p class="no-resultados">No se encontraron pasajes.</p>';
                } else {
                    console.log(`Se encontraron ${data.length} viajes`);
                    data.forEach(viaje => {
                        console.log('Procesando viaje:', viaje);
                        console.log('Asientos disponibles:', viaje.asientos_disponibles);
                        const fechaCreacion = viaje.fecha.split('T')[0];
                        // Para pruebas: considerar lleno si hay menos de 5 asientos
                        const estaLleno = parseInt(viaje.asientos_disponibles) < 5;
                        console.log('¿Está lleno?:', estaLleno);

                        const viajeDiv = document.createElement('div');
                        viajeDiv.classList.add('resultado-item');
                        
                        viajeDiv.innerHTML = `
                            <div class="resultado-header">
                                <div class="viaje-info">
                                    <h3><i class="fas fa-bus"></i> ${viaje.nombre_transporte}</h3>
                                    <div class="ruta">
                                        <i class="fas fa-route"></i>
                                        <span>Tipo de Viaje:</span> ${obtenerTipoViaje(viaje.tipo_viaje)}
                                    </div>
                                </div>
                                <div class="precio">
                                    <span class="monto">$${viaje.precio}</span>
                                    <span class="etiqueta">por persona</span>
                                </div>
                            </div>

                            <div class="resultado-detalles">
                                <div class="detalle-item">
                                    <i class="fas fa-calendar"></i>
                                    <div class="detalle-info">
                                        <span class="etiqueta">Fecha</span>
                                        <span class="valor">${fechaCreacion}</span>
                                    </div>
                                </div>
                                <div class="detalle-item">
                                    <i class="fas fa-clock"></i>
                                    <div class="detalle-info">
                                        <span class="etiqueta">Hora</span>
                                        <span class="valor">${viaje.hora}</span>
                                    </div>
                                </div>
                                <div class="detalle-item">
                                    <i class="fas fa-chair"></i>
                                    <div class="detalle-info">
                                        <span class="etiqueta">Asientos</span>
                                        <span class="valor" style="color: ${estaLleno ? '#dc3545' : 'inherit'}; font-weight: ${estaLleno ? 'bold' : 'normal'}">
                                            ${estaLleno ? '¡VIAJE LLENO!' : `${viaje.asientos_disponibles} disponibles`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="resultado-footer">
                                ${estaLleno ? 
                                    `<div style="background-color: #ffebeb; color: #dc3545; border: 2px solid #dc3545; padding: 15px; border-radius: 10px; text-align: center; margin: 10px 0; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: bold; font-size: 1.1em;">
                                        <i class="fas fa-exclamation-circle" style="font-size: 1.3em;"></i>
                                        Lo sentimos, este viaje está lleno
                                    </div>` :
                                    `<button class="btn-reservar" onclick="guardarDatos('${viaje.id}','${viaje.nombre_transporte}', '${viaje.tipo_viaje}', '${viaje.hora}', ${viaje.asientos_disponibles}, ${viaje.precio})">
                                        <i class="fas fa-ticket-alt"></i>
                                        Reservar Ahora
                                    </button>`
                                }
                            </div>
                        `;

                        resultadosDiv.appendChild(viajeDiv);
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al buscar viajes. Por favor, intente nuevamente.');
            });
    });

});
    // Función para guardar los datos del turno en localStorage
    
    function guardarDatos(viajeId, nombre_transporte, tipo_viaje, hora, asientos_disponibles, precio) {
        // Guardar los datos del turno en localStorage
        try {
            localStorage.setItem('viaje_id', viajeId);
            localStorage.setItem('nombre_transporte', nombre_transporte);
            localStorage.setItem('tipo_viaje', tipo_viaje);
            localStorage.setItem('hora_inicio', hora);
            localStorage.setItem('asientos_disponibles', asientos_disponibles);
            localStorage.setItem('precio', precio);
        
            // Verificar que los datos se han guardado correctamente
            console.log('Turno guardado en localStorage:', {
                turno_id: localStorage.getItem('viaje_id'),
                nombre_transporte: localStorage.getItem('nombre_transporte'),
                tipo_viaje: localStorage.getItem('tipo_viaje'),
                hora_inicio: localStorage.getItem('hora_inicio'),
                asientos_disponibles: localStorage.getItem('asientos_disponibles'),
                precio: localStorage.getItem('precio')
            });
    
            // Redirigir a la página de resumen o de reserva si todo es correcto
            window.location.href = "Resumen.html";
        } catch (error) {
            console.error('Error al guardar los datos del viaje:', error);
            alert('Ocurrió un error al guardar los datos de la reserva. Inténtalo de nuevo.');
        }
    }

    function redirigirMenu(section) {
        // Obtener el rol del usuario desde localStorage
        const userRole = localStorage.getItem('userRole');
    
        // Verificar el rol del usuario y redirigir a la sección correspondiente
        if (userRole === 'pasajero') {
            if (section === 'Buscar') {
                window.location.href = 'ReservasPasajero.html';  // Redirigir a la página de reservas de pasajero
            } else if (section === 'Actividad') {
                window.location.href = 'Actividad.html';  // Redirigir a la página de actividad del pasajero
            } else if (section === 'Notificaciones') {
                window.location.href = 'Notificaciones.html';  // Redirigir a la página de notificaciones del pasajero
            } 
        } else if (userRole === 'conductor') {
            if (section === 'Buscar') {
                window.location.href = 'Turnoconductor.html';  // Redirigir a la página del conductor
            } else if (section === 'Actividad') {
                window.location.href = 'MisViajes.html';  // Redirigir a la página de actividad del conductor
            } else if (section === 'Notificaciones') {
                window.location.href = 'Notificaciones.html';  // Redirigir a la página de notificaciones del conductor
            } 
        } else {
            // Si no se puede determinar el rol, redirigir al login
            window.location.href = 'login.html';
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
