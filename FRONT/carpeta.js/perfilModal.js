document.addEventListener('DOMContentLoaded', function() {
    console.log('Modal script cargado');
    
    // Imprimir todos los datos almacenados en localStorage
    console.log('Datos almacenados en localStorage:');
    console.log('ID:', localStorage.getItem('userID'));
    console.log('Nombre:', localStorage.getItem('userName'));
    console.log('Email:', localStorage.getItem('userEmail'));
    console.log('DNI:', localStorage.getItem('userDNI'));
    console.log('Teléfono:', localStorage.getItem('userPhone'));
    console.log('Rol:', localStorage.getItem('userRole'));

    const userData = {
        id: localStorage.getItem('userID'),
        nombre: localStorage.getItem('name'),
        email: localStorage.getItem('email'),
        dni: localStorage.getItem('DNI'),
        telefono: localStorage.getItem('Telefono'),
        rol: localStorage.getItem('userRole')
    };

    console.log('Datos completos del usuario:', userData);
    cargarModalPerfil(userData);
});

function cargarModalPerfil(userData) {
    const modalHTML = `
    <div class="modal fade" id="perfilModal" tabindex="-1" aria-labelledby="perfilModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="perfilModalLabel">Mi Perfil</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="profile-container">
                        <div class="profile-header">
                            <img src="../img/usuario.png" alt="Foto de perfil" class="profile-image">
                        </div>
                        <div class="profile-info">
                            <div class="info-item">
                                <span class="info-label">Nombre de usuario</span>
                                <span class="info-value" id="modalName">${userData.nombre || ''}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Correo electrónico</span>
                                <span class="info-value" id="modalEmail">${userData.email || ''}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">DNI</span>
                                <span class="info-value" id="modalDNI">${userData.dni || ''}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Teléfono</span>
                                <span class="info-value" id="modalTelefono">${userData.telefono || ''}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Rol</span>
                                <span class="info-value" id="modalUserRole">${userData.rol || ''}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="modalCambiar" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#cambiarPasswordModal">
                        Cambiar Contraseña
                    </button>
                    <button id="modalLogoutButton" class="btn btn-danger">Cerrar sesión</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div class="modal fade" id="cambiarPasswordModal" tabindex="-1" aria-labelledby="cambiarPasswordModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="cambiarPasswordModalLabel">Cambiar Contraseña</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="changePasswordForm">
                        <div class="mb-3">
                            <label for="currentPassword" class="form-label">Contraseña Actual:</label>
                            <input type="password" class="form-control" id="currentPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="newPassword" class="form-label">Nueva Contraseña:</label>
                            <input type="password" class="form-control" id="newPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña:</label>
                            <input type="password" class="form-control" id="confirmPassword" required>
                        </div>
                        <div id="message" class="alert" style="display: none;"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="cambiarPassword()">Guardar Cambios</button>
                </div>
            </div>
        </div>
    </div>`;

    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
        modalContainer.innerHTML = modalHTML;
    }

    // Configurar botón de logout
    const logoutButton = document.getElementById('modalLogoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

// Función para cambiar la contraseña
function cambiarPassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const userId = localStorage.getItem('userID');

    if (newPassword !== confirmPassword) {
        mostrarMensaje('Las contraseñas no coinciden', 'danger');
        return;
    }

    fetch('http://localhost:3000/api/auth/cambiarPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: userId,
            currentPassword: currentPassword,
            newPassword: newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje('Contraseña cambiada exitosamente', 'success');
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('cambiarPasswordModal')).hide();
            }, 2000);
        } else {
            mostrarMensaje(data.message || 'Error al cambiar la contraseña', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarMensaje('Error al cambiar la contraseña', 'danger');
    });
}

function mostrarMensaje(mensaje, tipo) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = mensaje;
    messageElement.className = `alert alert-${tipo}`;
    messageElement.style.display = 'block';
}
 