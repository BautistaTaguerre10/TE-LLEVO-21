const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');

// Rutas para usuarios
router.get('/', verifyToken, userController.obtenerUsuarios);
router.get('/:id', verifyToken, userController.obtenerUsuarioPorId);
router.get('/buscar/:dni', userController.buscarPorDNI);
router.put('/:id/role', verifyToken, userController.actualizarRol);
router.put('/:id', verifyToken, userController.actualizarUsuario);
router.delete('/:id', verifyToken, userController.eliminarUsuario);

module.exports = router;
