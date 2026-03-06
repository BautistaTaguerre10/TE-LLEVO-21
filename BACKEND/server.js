// Importar dependencias
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const viajeRoutes = require('./routes/viajeRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/viajes', viajeRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/notificaciones', notificacionRoutes);

// Puerto
const PORT = process.env.PORT || 3001;

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`URL local: http://localhost:${PORT}`);
});






















 
