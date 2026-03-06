// Importar dependencias
require('dotenv').config();
const express = require('express');
const path = require('path'); 
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors'); // Importa cors
const app = express();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

// Conectar con MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Cambia según tu usuario de MySQL
    password: 'hola1234.',      // Cambia según tu contraseña
    database: 'gestion_viajes'
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Habilitar CORS
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Rutas del backend

// Registro de usuario
app.post('/api/register', (req, res) => {
    const { name, email, DNI, Telefono, password } = req.body;
  
    // Verificar si el usuario ya existe en la base de datos
    const checkQuery = 'SELECT email FROM usuarios WHERE email = ?';
    db.query(checkQuery, [email], (err, result) => {
      if (err) {
        console.error('Error en la consulta:', err);
        return res.status(500).json({ success: false, message: 'Error del servidor' });
      }
  
      if (result.length > 0) {
        // Si el usuario ya está registrado
        return res.status(400).json({ success: false, message: 'El usuario ya está registrado' });
      }
  
      // Insertar el nuevo usuario en la base de datos sin hashear la contraseña
      const insertQuery = 'INSERT INTO usuarios (name, email, DNI, Telefono, password, role) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(insertQuery, [name, email, DNI, Telefono, password, 'pasajero'], (err, result) => {
        if (err) {
          console.error('Error al insertar el usuario:', err);
          return res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
        }
  
        // Si el registro es exitoso
        return res.json({ success: true });
      });
    });
  });


// Inicio de sesión
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Consulta a la base de datos para verificar si el usuario existe
    const query = 'SELECT id, name, email, DNI, Telefono, role FROM usuarios WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, result) => {
        if (err) {
            console.error('Error en la autenticación:', err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        // Si el usuario fue encontrado en la base de datos
        if (result.length > 0) {
            const user = result[0]; // Obtener el usuario encontrado

            // Generar el token JWT con el ID del usuario y su rol
            const token = jwt.sign(
                { id: user.id, role: user.role }, // Payload del token
                'secreto_token',                  // Clave secreta para firmar el token
                { expiresIn: '1h' }               // El token expirará en 1 hora
            );

            // Devolver el token junto con los datos del usuario
            return res.json({
                success: true,
                token,                           // Token JWT
                userID: user.id,                 // ID del usuario
                name: user.name,                 // Nombre del usuario
                DNI: user.DNI,                    // DNI del usuario
                Telefono: user.Telefono,         // Telefono del usuario
                email: user.email,               // Email del usuario
                role: user.role                  // Rol del usuario
            });

        } else {
            // Si las credenciales son incorrectas
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    });
});



  // Middleware para verificar token y rol de administrador

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send('Token no proporcionado');
    }
    // Obtener el token sin el prefijo "Bearer"
    const bearerToken = token.split(' ')[1];

    // Verificar el token
    jwt.verify(bearerToken, 'secreto_token', (err, decoded) => {
        if (err) {
            return res.status(500).send('Error en la autenticación');
        }

        req.userId = decoded.id; // Almacenar el ID del usuario en la request
        req.userRole = decoded.role; // Almacenar el rol del usuario en la request
        next(); // Continuar con la ejecución de la ruta
    });
}


// Obtener lista de usuarios (solo administradores)
app.get('/api/users', verifyToken, (req, res) => {
    const query = 'SELECT id, name, email, DNI, Telefono, role FROM usuarios';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).send('Error al obtener usuarios');
        }

        res.json(results); // Retornar los usuarios en formato JSON
    });
});


// Actualizar rol de usuario (solo administradores)

app.put('/api/users/:id/role', verifyToken, (req, res) => {
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
            return res.status(500).json({ success: false, message: 'Error al actualizar rol' }); // Devolver JSON
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' }); // Devolver JSON
        }

        res.json({ success: true, message: 'Rol actualizado con éxito' }); // Devolver JSON
    });
});

  
// Ruta para crear un viaje
app.post('/api/viaje', (req, res) => {
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
});

//buscar pasajes
app.get('/api/viaje', (req, res) => {
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
});


// Ruta para crear la reserva
app.post('/api/reserva', (req, res) => {
    const { viaje_id, pasajero_id, nombre_transporte, tipo_viaje, hora_inicio, asientos_disponibles, precio } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!viaje_id || !pasajero_id || !nombre_transporte || !tipo_viaje || !hora_inicio || !asientos_disponibles || !precio) {
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
                const mensajeConductor = `El pasajero con ID ${pasajero_id} ha reservado un asiento en el Viaje ${viaje_id}, nombre de transporte: ${nombre_transporte}.`;
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

                        /* Enviar correo al pasajero con los detalles de la reserva
                        enviarCorreoReserva(email, req.body);*/

                        // Responder con éxito si la reserva se creó y los asientos se actualizaron correctamente
                        res.status(200).json({ success: true, message: 'Reserva creada exitosamente y asientos actualizados', reservaId: result.insertId });
                    });
                });
            });
        });
    });
});



// Ruta para obtener las reservas de un pasajero
app.get('/api/reserva/porPasajero', (req, res) => {
    const pasajeroId = req.query.pasajeroId;

    if (!pasajeroId) {
        return res.status(400).json({ message: 'El ID del pasajero es requerido.' });
    }

    // Consulta para obtener las reservas del pasajero
    const query = 'SELECT * FROM reservas WHERE pasajero_id = ?';
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

});

//funcion para eliminar reserva  
app.delete('/api/reserva/:reservaId', (req, res) => {
    const { reservaId } = req.params;

    const query = 'DELETE FROM reservas WHERE id = ?';
    db.query(query, [reservaId], (err, result) => {
        if (err) {
            console.error('Error al eliminar la reserva:', err);
            return res.status(500).json({ message: 'Error al eliminar la reserva' });
        }

        res.status(200).json({ success: true, message: 'Reserva eliminada exitosamente' });
    });
});



//funcion cambiar contraseña 
app.post('/api/cambiarPassword', (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    // Verificar la contraseña actual
    const query = 'SELECT password FROM usuarios WHERE id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error al verificar la contraseña actual:', err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        const user = result[0];

        // Comparar la contraseña actual
        if (user.password !== currentPassword) {
            return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
        }

        // Actualizar la contraseña a la nueva
        const updateQuery = 'UPDATE usuarios SET password = ? WHERE id = ?';
        db.query(updateQuery, [newPassword, userId], (err, result) => {
            if (err) {
                console.error('Error al actualizar la contraseña:', err);
                return res.status(500).json({ success: false, message: 'Error al actualizar la contraseña' });
            }

            res.status(200).json({ success: true, message: 'Contraseña cambiada exitosamente' });
        });
    });
});

// Ruta para obtener los pasajeros registrados en un viaje específico
app.get('/api/reserva/porViaje', (req, res) => {
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
});

// Ruta para buscar los viajes creados por un conductor
app.get('/api/viajes', (req, res) => {
    const conductorId = req.query.conductorId; // ID del conductor 
    const nombreTransporte = req.query.nombreTransporte; // Nombre del transporte 
    const fecha = req.query.fecha; // Fecha de creación del viaje 

    if (!conductorId) {
        return res.status(400).json({ error: 'Debe proporcionar un conductorId' });
    }

    // Construir la consulta SQL con los parámetros proporcionados
    let query = `SELECT * FROM viajes WHERE conductor_id = ?`;
    let queryParams = [conductorId];

    // Agregar filtros si se proporcionan en la consulta
    if (nombreTransporte) {
        query += ` AND nombre_transporte LIKE ?`;
        queryParams.push(`%${nombreTransporte}%`);
    }

    if (fecha) {
        query += ` AND DATE(fecha) = ?`;
        queryParams.push(fecha);
    }

    // Ejecutar la consulta con los parámetros adecuados
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error al buscar los viajes:', err);
            return res.status(500).json({ error: 'Error al buscar los viajes' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron viajes con los criterios proporcionados.' });
        }

        res.json(results);
    });
});


//  ruta para modificación de viaje 
app.put('/api/viajes/:viajeId', (req, res) => {
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
});


//funcion para eliminar un viaje
app.delete('/api/viajes/:viajeId', (req, res) => {
    const { viajeId } = req.params;

    const query = 'DELETE FROM viajes WHERE id = ?';
    db.query(query, [viajeId], (err, result) => {
        if (err) {
            console.error('Error al eliminar el viaje:', err);
            return res.status(500).json({ message: 'Error al eliminar el viaje' });
        }

        res.status(200).json({ success: true, message: 'Viaje eliminado exitosamente' });
    });
});


// enviar obtener las notificaciones del usuario: 
app.get('/api/notificaciones/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = 'SELECT * FROM notificaciones WHERE user_id = ? ORDER BY fecha_creacion DESC';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error al obtener las notificaciones:', err);
            return res.status(500).json({ message: 'Error al obtener las notificaciones' });
        }

        res.status(200).json(result);
    });
});





