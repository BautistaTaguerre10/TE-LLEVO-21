//Controladores de reservas
const db = require('../config/database');

// Ruta para crear la reservaz
exports.crearReserva = (req, res) => {
    const { viaje_id, pasajero_id, nombre_transporte, tipo_viaje, hora_inicio, asientos_disponibles, precio, DNI, fecha } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!viaje_id || !pasajero_id || !nombre_transporte || !tipo_viaje || !hora_inicio || !asientos_disponibles || !precio ) {
        return res.status(400).json({ message: 'Faltan datos requeridos para crear la reserva' });
    }

    // Paso 1: Verificar si hay asientos disponibles para el turno
    const queryCheckAsientos = 'SELECT asientos_disponibles, conductor_id FROM viajes WHERE id = ?';
    db.query(queryCheckAsientos, [viaje_id], (err, result) => {
        if (err) {
            console.error('Error al verificar los asientos disponibles:', err);
            return res.status(500).json({ message: 'Error al verificar los asientos disponibles' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'El viaje no existe' });
        }

        const asientosDisponibles = result[0].asientos_disponibles;
        const conductorId = result[0].conductor_id;

        // Verificar si hay asientos disponibles
        if (asientosDisponibles < 1) {
            return res.status(400).json({ message: 'No hay asientos disponibles para este viaje' });
        }

        // Paso 2: Crear la reserva si hay asientos disponibles
        const queryInsertReserva = 'INSERT INTO reservas (pasajero_id, viaje_id, nombre_transporte, tipo_viaje, hora_inicio, asientos_disponibles, precio) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(queryInsertReserva, [pasajero_id, viaje_id, nombre_transporte, tipo_viaje, hora_inicio, asientos_disponibles, precio], (err, result) => {
            if (err) {
                console.error('Error al crear la reserva:', err);
                return res.status(500).json({ message: 'Error al crear la reserva' });
            }

            // Crear una notificación para el pasajero
            const mensajePasajero = `Has realizado una reserva para el transporte: "${nombre_transporte}" hora de viaje: ${hora_inicio} `;
            const queryNotificacionPasajero = 'INSERT INTO notificaciones (user_id, mensaje) VALUES (?, ?)';
            db.query(queryNotificacionPasajero, [pasajero_id, mensajePasajero], (err, result) => {
                if (err) {
                    console.error('Error al crear la notificación para el pasajero:', err);
                    return res.status(500).json({ message: 'Error al crear la notificación para el pasajero' });
                }

                // Paso 3: Crear una notificación para el conductor
                const mensajeConductor = `El pasajero con DNI ${DNI} se ha registrado para tu viaje programado el ${fecha}, a las: ${hora_inicio} en el Transporte: ${nombre_transporte}.`;
                const queryNotificacionConductor = 'INSERT INTO notificaciones (user_id, mensaje) VALUES (?, ?)';
                db.query(queryNotificacionConductor, [conductorId, mensajeConductor], (err, result) => {
                    if (err) {
                        console.error('Error al crear la notificación para el conductor:', err);
                        return res.status(500).json({ message: 'Error al crear la notificación para el conductor' });
                    }

                    // Paso 4: Actualizar los asientos disponibles en la tabla de turnos
                    const queryUpdateAsientos = 'UPDATE viajes SET asientos_disponibles = asientos_disponibles - 1 WHERE id = ?';
                    db.query(queryUpdateAsientos, [viaje_id], (err, updateResult) => {
                        if (err) {
                            console.error('Error al actualizar los asientos disponibles:', err);
                            return res.status(500).json({ message: 'Error al actualizar los asientos disponibles' });
                        }

                        // Responder con éxito si la reserva se creó y los asientos se actualizaron correctamente
                        res.status(200).json({ success: true, message: 'Reserva creada exitosamente y asientos actualizados', reservaId: result.insertId });
                    });
                });
            });
        });
    });
};



// Ruta para obtener las reservas de un pasajero
exports.obtenerReservasPorPasajero = (req, res) => {
    const pasajeroId = req.query.pasajeroId;

    if (!pasajeroId) {
        return res.status(400).json({ message: 'El ID del pasajero es requerido.' });
    }

    // Consulta para obtener las reservas del pasajero, ordenadas por fecha de creación
    const query = 'SELECT * FROM reservas WHERE pasajero_id = ? ORDER BY fecha_reserva DESC';
    db.query(query, [pasajeroId], (err, results) => {
        if (err) {
            console.error('Error al obtener las reservas:', err);
            return res.status(500).json({ message: 'Error al obtener las reservas.' });
        }

        if (results.length === 0) {
            return res.status(200).json([]); // Si no hay reservas, devolvemos un array vacío
        }

        res.status(200).json(results); // Devolvemos las reservas
    });
};

//funcion para eliminar reserva  
exports.eliminarReserva = (req, res) => {
    const { reservaId } = req.params;

    const query = 'DELETE FROM reservas WHERE id = ?';
    db.query(query, [reservaId], (err, result) => {
        if (err) {
            console.error('Error al eliminar la reserva:', err);
            return res.status(500).json({ message: 'Error al eliminar la reserva' });
        }

        res.status(200).json({ success: true, message: 'Reserva eliminada exitosamente' });
    });
};