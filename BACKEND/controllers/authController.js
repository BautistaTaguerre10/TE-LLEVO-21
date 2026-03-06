//Controladores de autenticación
const db = require('../config/database');
const jwt = require('jsonwebtoken');


// Controlador para registro de usuarios
exports.register = (req, res) => {
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
  };


// Controlador para login sin token
exports.login = (req, res) => {
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
};

// Controlador para cambiar contraseña
exports.cambiarPassword = (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    const query = 'SELECT password FROM usuarios WHERE id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error al verificar la contraseña actual:', err);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        const user = result[0];
        if (user.password !== currentPassword) {
            return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
        }

        const updateQuery = 'UPDATE usuarios SET password = ? WHERE id = ?';
        db.query(updateQuery, [newPassword, userId], (err, result) => {
            if (err) {
                console.error('Error al actualizar la contraseña:', err);
                return res.status(500).json({ success: false, message: 'Error al actualizar la contraseña' });
            }

            res.status(200).json({ success: true, message: 'Contraseña cambiada exitosamente' });
        });
    });
};

