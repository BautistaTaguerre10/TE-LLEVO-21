//Utilidades para envío de correos


/*
// Configurar Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Correo desde el cual se enviarán los emails
        pass: process.env.EMAIL_PASS   // Contraseña del correo
    }
});

// Función para enviar el correo con los datos de la reserva
function enviarCorreoReserva(pasajeroEmail, reserva) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: pasajeroEmail,
        subject: 'Detalles de su Reserva de Transporte',
        html: `
            <h1>Reserva Confirmada</h1>
            <p>Estimado/a pasajero,</p>
            <p>Le confirmamos los detalles de su reserva:</p>
            <ul>
                <li><strong>Transporte:</strong> ${reserva.nombre_transporte}</li>
                <li><strong>Fecha del Viaje:</strong> ${reserva.fecha}</li>
                <li><strong>Hora de Salida:</strong> ${reserva.hora_inicio}</li>
                <li><strong>Tipo de Viaje:</strong> ${reserva.tipo_viaje}</li>
            </ul>
            <p>Gracias por usar nuestro servicio.</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
        } else {
            console.log('Correo enviado:', info.response);
        }
    });
}*/