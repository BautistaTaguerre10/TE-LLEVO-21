//Middleware de autenticación
const jwt = require('jsonwebtoken');


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

module.exports = verifyToken;
