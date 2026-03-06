// Conectar el formulario de registro con el backend
document.getElementById('registerForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Evitar la recarga de la página

  // Obtener los valores de los campos del formulario
  const name = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const DNI = document.getElementById('DNI').value;
  const Telefono = document.getElementById('Telefono').value;
  const password = document.getElementById('password').value;
  
  // Asignar rol por defecto como pasajero
  const role = 'pasajero'; // Todos los usuarios se registran como pasajeros por defecto

    // Validar formato de email
    if (!email.includes('@')) {
        mostrarMensaje('El email no es válido', 'red');
        return;
    }

    // Enviar solicitud al backend
    fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            email,
            DNI,
            Telefono,
            password
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            mostrarMensaje('Registro exitoso. Redirigiendo...', 'green');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            mostrarMensaje(data.message || 'Error en el registro', 'red');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje(error.message || 'Error en el registro. Por favor, intente nuevamente.', 'red');
    });
});

function mostrarMensaje(mensaje, color) {
    const confirmation = document.getElementById('confirmation');
    confirmation.textContent = mensaje;
    confirmation.style.color = color;
}

// Botón de volver al login
document.getElementById('logoutButton').addEventListener('click', function() {
    window.location.href = 'login.html';
});