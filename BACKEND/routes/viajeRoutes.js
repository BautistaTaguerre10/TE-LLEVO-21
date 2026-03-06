//Rutas de viajes

const express = require('express');
const router = express.Router();
const viajeController = require('../controllers/viajeController');

// Rutas para viajes (sin verificación de token por ahora)
router.post('/', viajeController.crearViaje);
router.get('/buscar', viajeController.buscarPasajes);
router.get('/pasajeros', viajeController.obtenerPasajeros);
router.get('/conductor', viajeController.buscarViajesPorConductor);
router.put('/:viajeId', viajeController.modificarViaje);
router.delete('/:viajeId', viajeController.eliminarViaje);

module.exports = router;