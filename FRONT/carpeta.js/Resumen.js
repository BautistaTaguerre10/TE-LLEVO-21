document.addEventListener('DOMContentLoaded', function() {
    // Recuperar el turno_id y otros datos desde localStorage
    const userID = localStorage.getItem('userID'); 
    const email = localStorage.getItem('email'); 
    const nombreTransporte = localStorage.getItem('nombre_transporte');
    const tipoViaje = localStorage.getItem('tipo_viaje');
    const horaInicio = localStorage.getItem('hora_inicio');
    const asientosDisponibles = localStorage.getItem('asientos_disponibles');
    const precio = localStorage.getItem('precio');
    const viajeId = localStorage.getItem('viaje_id');
    const cargoServicio = precio * 0.1; // cargo por servicio
    const DNI = localStorage.getItem('DNI'); // Asegúrate de que el DNI esté en localStorage
    const fecha = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD

    // Verificar que todos los datos están disponibles
    if (!userID || !nombreTransporte || !tipoViaje || !horaInicio || !asientosDisponibles || !precio || !viajeId || !DNI) {
        console.error('Error: Falta uno o más datos necesarios.');
        return;
    }

    // Mostrar los datos en el HTML
    document.getElementById('nombre_transporte').textContent = nombreTransporte;
    document.getElementById('viaje_id').textContent = viajeId;
    document.getElementById('tipo_viaje').textContent = obtenerDescripcionTipoViaje(tipoViaje);
    document.getElementById('hora_inicio').textContent = horaInicio;
    document.getElementById('asientos_disponibles').textContent = asientosDisponibles;
    document.getElementById('precio').textContent = `ARS ${precio}`;
    document.getElementById('cargo_servicio').textContent = `ARS ${cargoServicio}`;
    document.getElementById('total').textContent = `ARS ${parseFloat(precio) + cargoServicio}`;

    // Cuando el usuario haga clic en "Reservar", enviar los datos al servidor
    document.getElementById('reservarBtn').addEventListener('click', function() {
        // Mostrar el modal de pago
        const modalPago = new bootstrap.Modal(document.getElementById('modalPago'));
        modalPago.show();
    });

    // Agregar evento para el botón de confirmar pago
    document.getElementById('confirmarPago').addEventListener('click', async function() {
        // Validar el formulario
        const form = document.getElementById('formPago');
        if (!form.checkValidity()) {
            alert('Por favor, complete todos los campos correctamente');
            return;
        }

        // Simular procesamiento de pago
        const modalPago = bootstrap.Modal.getInstance(document.getElementById('modalPago'));
        modalPago.hide();

        // Mostrar loading
        alert('Procesando pago...');

        // Preparar los datos de la reserva
        const datosReserva = {
            viaje_id: viajeId,
            pasajero_id: userID,
            nombre_transporte: nombreTransporte,
            tipo_viaje: tipoViaje,
            hora_inicio: horaInicio,
            asientos_disponibles: asientosDisponibles,
            precio: precio,
            DNI: DNI,
            fecha: fecha,
            metodo_pago: 'tarjeta' // Agregar método de pago
        };

        // Enviar los datos de la reserva al backend
        try {
            const response = await fetch('http://localhost:3000/api/reservas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosReserva)
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('¡Pago procesado y reserva creada exitosamente!');
                window.location.href = 'ReservasPasajero.html';
            } else {
                throw new Error(data.message || 'Error al crear la reserva');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar el pago: ' + error.message);
        }
    });

    // Agregar validaciones para los campos de tarjeta
    document.getElementById('numeroTarjeta').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '');
    });

    document.getElementById('fechaVencimiento').addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.slice(0,2) + '/' + value.slice(2);
        }
        this.value = value;
    });

    document.getElementById('cvv').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '');
    });
});

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

// Función para obtener la descripción del tipo de viaje
function obtenerDescripcionTipoViaje(tipo) {
    switch (tipo) {
        case 'ida':
            return 'Nueva Córdoba / Campus siglo 21';
        case 'vuelta':
            return 'Campus Siglo 21 / Nueva Córdoba';
        case 'ida_vuelta':
            return 'Viaje de ida y vuelta entre Nueva Córdoba y Campus siglo 21';
        default:
            return 'Tipo de viaje desconocido';
    }
}

