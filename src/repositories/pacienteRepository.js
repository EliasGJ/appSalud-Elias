const pool = require('../db/mysql');
const Paciente = require('../models/paciente');
const Bascula = require('../models/bascula');

// Asegurar tablas para lecturas de báscula y termómetro
const initTables = async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS basculas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paciente_id INT,
                peso FLOAT,
                altura FLOAT,
                fecha DATETIME,
                imc FLOAT
            )
        `);

        // Asegurar columnas existentes (por compatibilidad con esquemas previos)
        try {
            await pool.query("ALTER TABLE basculas ADD COLUMN IF NOT EXISTS altura FLOAT");
            await pool.query("ALTER TABLE basculas ADD COLUMN IF NOT EXISTS fecha DATETIME");
            await pool.query("ALTER TABLE basculas ADD COLUMN IF NOT EXISTS imc FLOAT");
        } catch (err) {
            // algunos motores o versiones antiguas pueden no soportar IF NOT EXISTS, ignorar errores benignos
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS termometros (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paciente_id INT,
                temperatura_c FLOAT,
                fecha DATETIME
            )
        `);

        try {
            await pool.query("ALTER TABLE termometros ADD COLUMN IF NOT EXISTS temperatura_c FLOAT");
            await pool.query("ALTER TABLE termometros ADD COLUMN IF NOT EXISTS fecha DATETIME");
        } catch (err) {
            // ignore
        }
};

// Ejecutar inicialización (no bloqueante en carga)
initTables().catch(err => console.error('Error inicializando tablas:', err));


const listar = async () => {
    // Ejecutamos la consulta SQL para obtener todos los pacientes
    const [results] = await pool.query('SELECT * FROM pacientes');

    // Convertimos cada registro en una instancia del modelo Paciente
    const pacientes = results.map(p => new Paciente(
        p.id,
        p.nombre,
        p.apellidos,
        p.fechaDeNacimiento
    ));

    // Devolvemos el listado de pacientes
    return pacientes;
 
};

const guardar = async (paciente) => {
    //Ejecutamos la consulta SQL para insertar un nuevo paciente
    const [results] = await pool.query('INSERT INTO pacientes (nombre, apellidos, fechaDeNacimiento) VALUES (?, ?, ?)',
        [paciente.nombre, paciente.apellidos, paciente.fechaDeNacimiento]);
    //Creamos una nueva instancias del modelo Paciente con el ID generado
    const nuevoPaciente = new Paciente(
        results.insertId,
        paciente.nombre,
        paciente.apellidos,
        paciente.fechaDeNacimiento
    );
    //Devolvemos el nuevo paciente creado
    return nuevoPaciente;
}

const guardarBascula = async (pacienteId, peso, altura, fecha = null) => {
    if (peso === undefined || peso === null) return null;
    const fechaDb = fecha ? new Date(fecha) : new Date();
    const imc = (altura && altura > 0) ? Number((peso / (altura * altura)).toFixed(2)) : null;
    await pool.query('INSERT INTO basculas (paciente_id, peso, altura, fecha, imc) VALUES (?, ?, ?, ?, ?)',
        [pacienteId, peso, altura, fechaDb, imc]);
    return { pacienteId, peso, altura, fecha: fechaDb, imc };
}

const guardarTermometro = async (pacienteId, temperaturaC, fecha = null) => {
    if (temperaturaC === undefined || temperaturaC === null) return null;
    const fechaDb = fecha ? new Date(fecha) : new Date();
    await pool.query('INSERT INTO termometros (paciente_id, temperatura_c, fecha) VALUES (?, ?, ?)',
        [pacienteId, temperaturaC, fechaDb]);
    return { pacienteId, temperaturaC, fecha: fechaDb };
}

const obtenerHistorialBascula = async (pacienteId) => {
    const [rows] = await pool.query('SELECT * FROM basculas WHERE paciente_id = ? ORDER BY fecha DESC', [pacienteId]);
    return rows.map(r => ({
        id: r.id,
        peso: r.peso,
        altura: r.altura,
        fecha: r.fecha,
        imc: r.imc
    }));
}

const obtenerHistorialTermometro = async (pacienteId) => {
    const [rows] = await pool.query('SELECT * FROM termometros WHERE paciente_id = ? ORDER BY fecha DESC', [pacienteId]);
    return rows.map(r => ({
        id: r.id,
        temperaturaC: r.temperatura_c,
        fecha: r.fecha
    }));
}

const buscarPorId = async (id) => {
    //Ejecutamos la consulta SQL para buscar un paciente por su ID
    const [results] = await pool.query('SELECT * FROM pacientes WHERE id = ?', [id]);
    //Si no se encuentra el paciente, devolvemos null
    if (results.length === 0) {
        return null;
    }

    const p = results[0];
    //Creamos una instancia del modelo Paciente con los datos obtenidos
    const paciente = new Paciente(
        p.id,
        p.nombre,
        p.apellidos,
        p.fechaDeNacimiento
    );
        // Obtener última lectura de báscula
        try {
            const [bRows] = await pool.query('SELECT * FROM basculas WHERE paciente_id = ? ORDER BY id DESC LIMIT 1', [p.id]);
            if (bRows.length > 0) {
                const b = bRows[0];
                const clasif = (b.imc !== null && b.imc !== undefined) ? (new Bascula()).describirIMC(b.imc) : null;
                paciente.ultimaBascula = {
                    peso: b.peso,
                    altura: b.altura,
                    fecha: b.fecha,
                    imc: b.imc,
                    clasificacion: clasif
                };
            }
        } catch (err) {
            // ignore
        }

        // Obtener última lectura de termómetro
        try {
            const [tRows] = await pool.query('SELECT * FROM termometros WHERE paciente_id = ? ORDER BY id DESC LIMIT 1', [p.id]);
            if (tRows.length > 0) {
                const t = tRows[0];
                paciente.ultimaTemperatura = {
                    temperaturaC: t.temperatura_c,
                    fecha: t.fecha
                };
            }
        } catch (err) {
            // ignore
        }

        return paciente;

}

const actualizar = async (paciente) => {
    //ejecutamos la consulta SQL para actualizar un paciente exitente
    await pool.query('UPDATE pacientes SET nombre = ?, apellidos = ?, fechaDeNacimiento = ? WHERE id = ?',
        [paciente.nombre, paciente.apellidos, paciente.fechaDeNacimiento, paciente.id]);
        //Devolvemos el paciente actualizado
        return new Paciente(
            paciente.id,
            paciente.nombre,
            paciente.apellidos,
            paciente.fechaDeNacimiento
        );
 
}

const eliminar = async (id) => {
    //Ejecutamos la consulta SQL para eliminar un paciente por si ID
    const [results] = await pool.query('DELETE FROM pacientes WHERE id = ?', [id]);
    //Si no se elimina ninguna fila devuelve false
    if (results.affectedRows === 0) {
        return false;
    }
    //Si se elimino al menos una fila devuelve true
    return true;
}




module.exports = {
    listar,
    guardar,
    buscarPorId,
    actualizar,
    eliminar,
    guardarBascula,
    guardarTermometro,
    obtenerHistorialBascula,
    obtenerHistorialTermometro
};


