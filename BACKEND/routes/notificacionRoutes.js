//Rutas de notificaciones

const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');


// Rutas para notificaciones
router.get('/:userId', notificacionController.obtenerNotificaciones);
module.exports = router;