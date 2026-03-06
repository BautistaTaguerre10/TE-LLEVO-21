//Controladores de notificaciones
const db = require('../config/database');


// enviar obtener las notificaciones del usuario: 
exports.obtenerNotificaciones = (req, res) => {
    const userId = req.params.userId;

    const query = 'SELECT * FROM notificaciones WHERE user_id = ? ORDER BY fecha_creacion DESC';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error al obtener las notificaciones:', err);
            return res.status(500).json({ message: 'Error al obtener las notificaciones' });
        }

        res.status(200).json(result);
    });
};