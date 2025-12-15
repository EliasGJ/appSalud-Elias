CREATE DATABASE IF NOT EXISTS appsalud;
USE appsalud;  

CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fechaDeNacimiento DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS basculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT,
    fecha_hora DATETIME NOT NULL,
    peso DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

INSERT INTO pacientes (nombre, apellidos, fechaDeNacimiento) 
VALUES
('Juan', 'Pérez', '1980-05-15'),
('María', 'Gómez', '1992-11-30');

INSERT INTO basculas (paciente_id, fecha_hora, peso)
 VALUES
(1, '2024-06-01 08:30:00', 75.50),
(1, '2024-06-15 08:30:00', 74.80),
(2, '2024-06-10 09:00:00', 60.20);
