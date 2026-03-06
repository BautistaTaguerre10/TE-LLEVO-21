//Rutas de reservas

const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
//const verifyToken = require('../middleware/auth');

// Rutas para reservas
router.post('/', reservaController.crearReserva);
router.get('/porPasajero', reservaController.obtenerReservasPorPasajero);
router.delete('/:reservaId', reservaController.eliminarReserva);

module.exports = router;