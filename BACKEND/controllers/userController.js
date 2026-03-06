//Controladores de usuarios

const db = require('../config/database');



// Obtener lista de usuarios (solo administradores)
exports.obtenerUsuarios = (req, res) => {
    try {
        const query = 'SELECT id, name, email, DNI, Telefono, role FROM usuarios';

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error al obtener usuarios:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error al obtener usuarios',
                    error: err.message
                });
            }

            // Verificar si results es undefined o null
            if (!results) {
                return res.status(500).json({
                    success: false,
                    message: 'No se obtuvieron resultados de la base de datos'
                });
            }

            return res.status(200).json({
                success: true,
                users: results
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

// Obtener usuario por ID
exports.obtenerUsuarioPorId = (req, res) => {
    const userId = req.params.id;
    
    const query = 'SELECT id, name, email, DNI, Telefono, role FROM usuarios WHERE id = ?';
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener usuario:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al obtener usuario' 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({
            success: true,
            user: results[0]
        });
    });
};

// Actualizar rol de usuario (solo administradores)
exports.actualizarRol = (req, res) => {
    const userId = req.params.id;
    const { newRole } = req.body;

    // Validar que el nuevo rol sea válido
    const validRoles = ['pasajero', 'conductor', 'administrador'];
    if (!validRoles.includes(newRole)) {
        return res.status(400).json({ success: false, message: 'Rol no válido' }); // Devolver JSON en lugar de texto plano
    }

    const query = 'UPDATE usuarios SET role = ? WHERE id = ?';
    db.query(query, [newRole, userId], (err, result) => {
        if (err) {
            console.error('Error al actualizar rol de usuario:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al actualizar rol' 
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Rol actualizado con éxito' 
        });
    });
};

// Actualizar información de usuario
exports.actualizarUsuario = (req, res) => {
    const userId = req.params.id;
    const { 
        name, email, DNI, Telefono, role,
        // Campos adicionales para conductor
        modeloVehiculo, anioVehiculo, matricula,
        licenciaConducir, permisoOperacion, registroVehiculo 
    } = req.body;

    // Validar datos básicos requeridos
    if (!name || !email || !DNI || !Telefono) {
        return res.status(400).json({
            success: false,
            message: 'Los campos básicos son requeridos'
        });
    }

    // Si el rol es conductor, validar campos adicionales
    if (role === 'conductor') {
        if (!modeloVehiculo || !anioVehiculo || !matricula || 
            !licenciaConducir || !permisoOperacion || !registroVehiculo) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos del conductor son requeridos'
            });
        }
    }

    // Construir la consulta SQL según el rol
    let query;
    let values;

    if (role === 'conductor') {
        query = `
            UPDATE usuarios 
            SET name = ?, email = ?, DNI = ?, Telefono = ?, role = ?,
                modeloVehiculo = ?, anioVehiculo = ?, matricula = ?,
                licenciaConducir = ?, permisoOperacion = ?, registroVehiculo = ?
            WHERE id = ?
        `;
        values = [name, email, DNI, Telefono, role,
                 modeloVehiculo, anioVehiculo, matricula,
                 licenciaConducir, permisoOperacion, registroVehiculo,
                 userId];
    } else {
        query = `
            UPDATE usuarios 
            SET name = ?, email = ?, DNI = ?, Telefono = ?, role = ?,
                modeloVehiculo = NULL, anioVehiculo = NULL, matricula = NULL,
                licenciaConducir = NULL, permisoOperacion = NULL, registroVehiculo = NULL
            WHERE id = ?
        `;
        values = [name, email, DNI, Telefono, role, userId];
    }

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar usuario:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
    });
};

// Eliminar usuario
exports.eliminarUsuario = (req, res) => {
    const userId = req.params.id;

    // Primero eliminar las reservas asociadas
    const deleteReservasQuery = 'DELETE FROM reservas WHERE pasajero_id = ?';
    
    db.query(deleteReservasQuery, [userId], (err) => {
        if (err) {
            console.error('Error al eliminar reservas:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar las reservas del usuario'
            });
        }

        // Después eliminar el usuario
        const deleteUserQuery = 'DELETE FROM usuarios WHERE id = ?';
        
        db.query(deleteUserQuery, [userId], (err, result) => {
            if (err) {
                console.error('Error al eliminar usuario:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar usuario'
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Usuario y sus reservas eliminados exitosamente'
            });
        });
    });
};

// Buscar usuario por DNI
exports.buscarPorDNI = (req, res) => {
    const dni = req.params.dni;
    
    const query = 'SELECT id, name, email, DNI, Telefono, role FROM usuarios WHERE DNI = ?';
    
    db.query(query, [dni], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al buscar usuario' 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }

        res.json({
            success: true,
            users: results
        });
    });
};