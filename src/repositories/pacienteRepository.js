const pool = require('../db/mysql');
const Paciente = require('../models/paciente');


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
    //Devolvemos el paciente encontrado
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
    eliminar
};
