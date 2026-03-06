// Supongamos que el token JWT está almacenado en localStorage
const token = localStorage.getItem('token');

// Función para obtener la lista de usuarios (requiere autenticación con token)
function fetchUsers() {
    fetch('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Enviando el token en el header
        }
    })
        .then(response => response.json())
        .then(data => {
            displayUsers(data);
            updateUserSelect(data);
        })
        .catch(error => {
            console.error('Error al obtener usuarios:', error);
        });
}

// Variable global para almacenar el ID del usuario que se está editando
let usuarioEditandoId = null;

async function fetchUsuarios() {
    try {
        const response = await fetch('http://localhost:3000/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        const tbody = document.getElementById('userTableBody');
        tbody.innerHTML = '';

        data.users.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.name}</td>
                <td>${usuario.email}</td>
                <td>${usuario.DNI}</td>
                <td>${usuario.Telefono}</td>
                <td>${usuario.role}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="abrirModalEditar(${usuario.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarEliminar(${usuario.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        alert('Error al cargar la lista de usuarios');
    }
}

// Función para buscar por DNI
async function buscarPorDNI() {
    const dni = document.getElementById('searchDNI').value.trim();
    if (!dni) {
        alert('Por favor ingrese un DNI para buscar');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/users/buscar/${dni}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Usuario no encontrado');
        }

        actualizarTablaUsuarios(data.users);
    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        alert(`Error al buscar usuarios: ${error.message}`);
    }
}

// Función para actualizar la tabla de usuarios
function actualizarTablaUsuarios(usuarios) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.name}</td>
            <td>${usuario.email}</td>
            <td>${usuario.DNI}</td>
            <td>${usuario.Telefono}</td>
            <td>${usuario.role}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="abrirModalEditar(${usuario.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="confirmarEliminar(${usuario.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función para abrir el modal de edición
async function abrirModalEditar(id) {
    usuarioEditandoId = id;
    try {
        const response = await fetch(`http://localhost:3000/api/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        if (data.success) {
            // Llenar el formulario con los datos del usuario
            document.getElementById('nombre').value = data.user.name;
            document.getElementById('email').value = data.user.email;
            document.getElementById('dni').value = data.user.DNI;
            document.getElementById('telefono').value = data.user.Telefono;
            document.getElementById('rol').value = data.user.role;

            // Si es conductor, llenar campos adicionales
            if (data.user.role === 'conductor') {
                document.getElementById('modeloVehiculo').value = data.user.modeloVehiculo || '';
                document.getElementById('anioVehiculo').value = data.user.anioVehiculo || '';
                document.getElementById('matricula').value = data.user.matricula || '';
                document.getElementById('licenciaConducir').value = data.user.licenciaConducir || '';
                document.getElementById('permisoOperacion').value = data.user.permisoOperacion || '';
                document.getElementById('registroVehiculo').value = data.user.registroVehiculo || '';
                toggleConductorFields();
            }

            // Abrir el modal
            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        alert('Error al cargar los datos del usuario');
    }
}

// Función para guardar cambios
async function guardarCambios() {
    if (!usuarioEditandoId) return;

    const rol = document.getElementById('rol').value;
    let userData = {
        name: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        DNI: document.getElementById('dni').value,
        Telefono: document.getElementById('telefono').value,
        role: rol
    };

    if (rol === 'conductor') {
        const camposConductor = {
            modeloVehiculo: document.getElementById('modeloVehiculo').value,
            anioVehiculo: document.getElementById('anioVehiculo').value,
            matricula: document.getElementById('matricula').value,
            licenciaConducir: document.getElementById('licenciaConducir').value,
            permisoOperacion: document.getElementById('permisoOperacion').value,
            registroVehiculo: document.getElementById('registroVehiculo').value
        };

        // Validar campos del conductor
        for (let [campo, valor] of Object.entries(camposConductor)) {
            if (!valor) {
                alert(`El campo ${campo} es obligatorio para conductores`);
                return;
            }
        }

        userData = { ...userData, ...camposConductor };
    }

    try {
        const response = await fetch(`http://localhost:3000/api/users/${usuarioEditandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            alert('Usuario actualizado exitosamente');
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            modal.hide();
            fetchUsuarios(); // Recargar la lista de usuarios
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        alert('Error al actualizar el usuario');
    }
}

// Función para mostrar/ocultar campos de conductor
function toggleConductorFields() {
    const rol = document.getElementById('rol').value;
    const conductorFields = document.getElementById('conductorFields');
    conductorFields.style.display = rol === 'conductor' ? 'block' : 'none';
}

function confirmarEliminar(id) {
    if (confirm('¿Está seguro que desea eliminar este usuario?')) {
        eliminarUsuario(id);
    }
}

async function eliminarUsuario(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Usuario y sus reservas eliminados exitosamente');
            fetchUsuarios();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario');
    }
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchUsuarios();
    
    // Agregar evento para la búsqueda por DNI cuando se presiona Enter
    document.getElementById('searchDNI').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarPorDNI();
        }
    });
});

// Cargar usuarios cuando la página se inicie
document.addEventListener('DOMContentLoaded', fetchUsuarios);

// Función para actualizar el dropdown con los usuarios disponibles
function updateUserSelect(users) {
    const userSelect = document.getElementById('userSelect');
    userSelect.innerHTML = ''; // Limpiar opciones anteriores

    users.forEach(user => {
        let option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userSelect.appendChild(option);
    });
}

// Asignar el nuevo rol al usuario seleccionado
function assignRole() {
    const userId = document.getElementById('userSelect').value;
    const newRole = document.getElementById('newRole').value;

    fetch(`http://localhost:3000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`, // Enviando el token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newRole })
    })
        .then(response => response.json())
        .then(data => {
            const confirmation = document.getElementById('confirmation');
            if (data.success) {
                fetchUsers(); // Actualizar la lista de usuarios
                confirmation.textContent = "Rol actualizado con éxito";
                confirmation.style.color = 'green';
            } else {
                confirmation.textContent = "Error al actualizar el rol";
                confirmation.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error al asignar rol:', error);
        });
}

// Añadir evento al botón de asignar rol
document.getElementById('assignRoleBtn').addEventListener('click', assignRole);

// Inicializar la tabla de usuarios al cargar la página
fetchUsers();




// Función para cerrar sesión
document.getElementById('logoutButton').addEventListener('click', function() {
    // Borrar los datos de localStorage
    localStorage.removeItem('userID');
    localStorage.removeItem('userRole');
  
    // Redirigir al usuario a la página de login
    window.location.href = 'login.html';
});

