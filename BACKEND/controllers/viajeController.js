//Controladores de viajes

const db = require('../config/database');


// Ruta para crear un viaje
exports.crearViaje = (req, res) => {
    // Destructurar los datos recibidos en el cuerpo de la solicitud
    const { userId, nombre_transporte, tipo_viaje, fecha, hora, asientos_disponibles, precio } = req.body;

    // Validar que todos los campos necesarios están presentes
    if (!userId || !nombre_transporte || !tipo_viaje || !fecha || !hora || !asientos_disponibles || !precio) {
        return res.status(400).json({ message: 'Faltan datos requeridos para crear el viaje' });
    }

    // Consulta SQL para insertar un nuevo turno
    const query = `
        INSERT INTO viajes (conductor_id, nombre_transporte, tipo_viaje, fecha, hora, asientos_disponibles, precio)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Ejecutar la consulta SQL
    db.query(query, [userId, nombre_transporte, tipo_viaje, fecha, hora, asientos_disponibles, precio], (err, result) => {
        if (err) {
            console.error('Error al crear el viaje:', err);
            return res.status(500).json({ message: 'Error al crear el viaje' });
        }


        // Responder con éxito si el turno se creó correctamente
        res.status(200).json({ success: true, message: 'Viaje creado exitosamente', turnoId: result.insertId });
    });
};

//buscar pasajes
exports.buscarPasajes = (req, res) => {
    const { fecha, tipo_viaje } = req.query;

    const sql = `
        SELECT * FROM viajes 
        WHERE fecha = ? 
        AND tipo_viaje = ? 
        AND asientos_disponibles > 0
    `;

    db.query(sql, [fecha, tipo_viaje], (err, results) => {
        if (err) {
            console.error("Error al ejecutar la consulta:", err);  // Agregar log para revisar el error
            return res.status(500).json({ message: 'Error en la búsqueda de pasajes' });
        }

        res.json(results);
    });
};


// Ruta para obtener los pasajeros registrados en un viaje específico
exports.obtenerPasajeros = (req, res) => {
    // Extraer el valor de turnoId desde la consulta de la solicitud
    const viajeId = req.query.viajeId;

    // Verificar si el viajeId no está presente o es inválido
    if (!viajeId) {
        console.error('El parámetro viajeId no está presente');
        return res.status(400).json({ error: 'Debe proporcionar un turnoId' });
    }

    // Consulta a la base de datos para obtener los pasajeros asociados con el turno
    const query = `
        SELECT usuarios.id AS pasajeroId, usuarios.name, usuarios.email, usuarios.DNI, usuarios.telefono
        FROM reservas
        JOIN usuarios ON reservas.pasajero_id = usuarios.id
        WHERE reservas.viaje_id = ? `;

    db.query(query, [viajeId], (err, results) => {
        if (err) {
            console.error('Error al obtener los pasajeros registrados:', err);
            return res.status(500).json({ error: 'Error al obtener los pasajeros registrados' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron pasajeros registrados para este turno.' });
        }

        // Responder con los resultados
        res.json(results);
    });
};

// Ruta para buscar los viajes creados por un conductor
exports.buscarViajesPorConductor = (req, res) => {
    try {
        const conductorId = req.query.conductorId;
        const nombreTransporte = req.query.nombreTransporte;
        const fecha = req.query.fecha;

        if (!conductorId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Debe proporcionar un conductorId' 
            });
        }

        // Construir la consulta SQL base
        let query = 'SELECT * FROM viajes WHERE conductor_id = ?';
        let queryParams = [conductorId];

        // Agregar filtros si se proporcionan
        if (nombreTransporte && fecha) {
            query += ' AND nombre_transporte LIKE ? AND DATE(fecha) = ?';
            queryParams.push(`%${nombreTransporte}%`, fecha);
        } else if (nombreTransporte) {
            query += ' AND nombre_transporte LIKE ?';
            queryParams.push(`%${nombreTransporte}%`);
        } else if (fecha) {
            query += ' AND DATE(fecha) = ?';
            queryParams.push(fecha);
        }

        // Agregar ordenamiento
        query += ' ORDER BY fecha DESC';

        console.log('Query:', query); // Para debug
        console.log('Params:', queryParams); // Para debug

        db.query(query, queryParams, (err, results) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al buscar los viajes',
                    error: err.message 
                });
            }

            // Enviar resultados incluso si está vacío
            return res.status(200).json(results);
        });

    } catch (error) {
        console.error('Error inesperado:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};


//  ruta para modificación de viaje 
exports.modificarViaje = (req, res) => {
    const viajeId = parseInt(req.params.viajeId);
    const { fecha, hora } = req.body;

    // Validar los campos recibidos
    if (!fecha || !hora) {
        return res.status(400).send('Fecha y hora son requeridos');
    }

    // Ejecutar la consulta de actualización
    db.query(
        'UPDATE viajes SET fecha = ?, hora = ? WHERE id = ?',
        [fecha, hora, viajeId],
        (err, result) => {
            if (err) {
                console.error('Error al modificar el viaje:', err);
                return res.status(500).send('Hubo un error al modificar el viaje');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Viaje no encontrado');
            }

            res.json({ message: 'Viaje modificado exitosamente' });
        }
    );
};


//funcion para eliminar un viaje
exports.eliminarViaje = (req, res) => {
    const { viajeId } = req.params;

    const query = 'DELETE FROM viajes WHERE id = ?';
    db.query(query, [viajeId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el viaje:', err);
            return res.status(500).json({ message: 'Error al eliminar el viaje' });
        }

        res.status(200).json({ success: true, message: 'Viaje eliminado exitosamente' });
    });
};

exports.obtenerViajesConductor = async (req, res) => {
    try {
        const { conductorId, fecha, nombreTransporte } = req.query;
        
        let query = `
            SELECT v.*, u.name as conductor_nombre 
            FROM viajes v 
            LEFT JOIN usuarios u ON v.conductor_id = u.id 
            WHERE v.conductor_id = ?
        `;
        
        const params = [conductorId];

        if (fecha) {
            query += ' AND DATE(v.fecha) = ?';
            params.push(fecha);
        }

        if (nombreTransporte) {
            query += ' AND v.nombre_transporte LIKE ?';
            params.push(`%${nombreTransporte}%`);
        }

        query += ' ORDER BY v.fecha DESC';

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener los viajes',
                    error: err.message
                });
            }

            return res.status(200).json({
                success: true,
                viajes: results
            });
        });
    } catch (error) {
        console.error('Error inesperado:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
