document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerBtn = document.getElementById('registerBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Corregir la ruta de la API - debe ser /api/auth/login
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        // Permitir CORS
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('Datos recibidos del backend:', data);

                if (data.success && data.token) {
                    // Guardar datos en localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userID', data.userID);
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('name', data.name);
                    localStorage.setItem('email', data.email);
                    localStorage.setItem('DNI', data.DNI);
                    localStorage.setItem('Telefono', data.Telefono);

                    // Redirigir según el rol
                    switch(data.role) {
                        case 'pasajero':
                            window.location.href = 'ReservasPasajero.html';
                            break;
                        case 'conductor':
                            window.location.href = 'Turnoconductor.html';
                            break;
                        case 'administrador':
                            window.location.href = 'Admin.html';
                            break;
                        default:
                            alert('Rol no reconocido');
                    }
                } else {
                    // Mostrar mensaje de error más descriptivo
                    alert(data.message || 'Error en el inicio de sesión');
                }
            } catch (error) {
                console.error('Error en la solicitud de login:', error);
                alert('Error de conexión con el servidor');
            }
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            window.location.href = 'Registro.html';
        });
    }

    // Función para verificar si el usuario ya está autenticado
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (token && userRole) {
            // Redirigir si ya está autenticado
            switch(userRole) {
                case 'pasajero':
                    window.location.href = 'ReservasPasajero.html';
                    break;
                case 'conductor':
                    window.location.href = 'Turnoconductor.html';
                    break;
                case 'administrador':
                    window.location.href = 'Admin.html';
                    break;
            }
        }
    }

    // Verificar estado de autenticación al cargar la página
    checkAuthStatus();
});




