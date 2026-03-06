CREATE DATABASE gestion_viajes;
USE gestion_viajes;


CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    DNI VARCHAR(35) UNIQUE NOT NULL,
    Telefono VARCHAR(35) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('pasajero', 'conductor', 'administrador') NOT NULL DEFAULT 'pasajero',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE  viajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conductor_id INT NOT NULL,
    nombre_transporte VARCHAR(100) NOT NULL,
    tipo_viaje ENUM('ida', 'vuelta', 'ida_vuelta') NOT NULL,
    hora TIME NOT NULL,
    fecha DATE NOT NULL,
    asientos_disponibles INT NOT NULL, 
	asientos_totales INT,
    ocupacion_calculada DOUBLE DEFAULT 0.0,
	precio double NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conductor_id) REFERENCES usuarios(id) ON DELETE CASCADE 
);

CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pasajero_id INT NOT NULL,
	nombre_transporte VARCHAR(255) NOT NULL,    
    tipo_viaje ENUM('ida', 'vuelta', 'ida_vuelta') NOT NULL,
    hora_inicio TIME NOT NULL,                  
    asientos_disponibles INT NOT NULL,          
    precio double NOT NULL,
    viaje_id INT NOT NULL,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('confirmada', 'cancelada') DEFAULT 'confirmada',
    FOREIGN KEY (pasajero_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE 
);

CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


set SQL_SAFE_UPDATES=0;

SELECT * FROM usuarios;
SELECT * FROM viajes;
SELECT * FROM reservas;
SELECT * FROM notificaciones;

delete from usuarios;
delete from reservas;
delete from viajes;
delete from notificaciones;

SHOW TABLES;

drop table usuarios;
drop table reservas;
drop table viajes;
drop table notificaciones;

SELECT asientos_disponibles FROM turno WHERE id = 1;
SELECT * FROM viaje WHERE conductor_id = 2;
SELECT * FROM reservas WHERE pasajero_id = 1;

UPDATE usuarios 
SET role = 'administrador'
WHERE email = 'aguerrebau@gmail.com'; 

-- Insertar un usuario administrador por defecto
INSERT INTO usuarios (name, email, DNI, Telefono, password, role) 
VALUES ('Admin', 'admin@example.com', 'ADMIN123', '1234', 'admin123', 'administrador');

ALTER TABLE usuarios
ADD COLUMN modeloVehiculo VARCHAR(100),
ADD COLUMN anioVehiculo VARCHAR(4),
ADD COLUMN matricula VARCHAR(20),
ADD COLUMN licenciaConducir VARCHAR(50),
ADD COLUMN permisoOperacion VARCHAR(50),
ADD COLUMN registroVehiculo VARCHAR(50);