const pacienteRepository = require('../repositories/pacienteRepository.js');

const obtenerPaciente = async (req, res ) => {
    
    const id  = req.params.id;
    if (!id) {
        return res.status(400).send('El ID de paciente es obligatorio');
    }
    const paciente = await pacienteRepository.buscarPorId(id);
    if (!paciente) {
        return res.render('buscar', {
            title: 'App Salud',
            message: 'Error: Paciente no encontrado'});
    }

    //Si existe el paciente, lo mostramos
    res.render('buscar', {
        title: 'App Salud',
        paciente,
        message: 'Paciente encontrado'});
            
};

const crearPaciente = async (req, res ) => {
    const { nombre, apellidos, fechaDeNacimiento } = req.body;
    if (!nombre || !apellidos || !fechaDeNacimiento) {
        return res.render('index', {
            title: ' App Salud',
            pacientes: await pacienteRepository.listar(),
            message: 'Error: Todos los campos son obligatorios'});
    }
    //guardar el nuevo paciente
    await pacienteRepository.guardar({ nombre, apellidos, fechaDeNacimiento });
    const pacientes =  await pacienteRepository.listar();
    res.render('index', { 
        title: ' App Salud',
        pacientes,
        message: 'Paciente creado correctamente' 
    });
};
const mostrarFormularioActualizarPaciente = async (req, res) => {
    const id = req.params.id;
    const paciente = await pacienteRepository.buscarPorId(id);
    if (!paciente) {
        return res.render('/pacientes');
    }
    res.render('actualizarPaciente', {
        title: 'App Salud',
        paciente,
        message: ''
    });
};
const actualizarPaciente = async (req, res ) => {
    const id = req.params.id;
    const { nombre, apellidos, fechaDeNacimiento } = req.body;
    if (!nombre || !apellidos || !fechaDeNacimiento) {
        const paciente = await pacienteRepository.buscarPorId(id);
        return res.render('actualizarPaciente', {
            title: ' App Salud',
            paciente,
            message: 'Error: Todos los campos son obligatorios'});
    }  
    //Construir objeto paciente completo
    const pacienteActualizado = {
        id,
        nombre,
        apellidos,
        fechaDeNacimiento
    };
    await pacienteRepository.actualizar(pacienteActualizado);
    res.redirect('/pacientes'); 
};

const eliminarPaciente = async (req, res) => {
    const id = req.params.id;
    const eliminado = await pacienteRepository.eliminar(id);
    const pacientes = await pacienteRepository.listar();
    const message = eliminado ? 'Paciente eliminado correctamente' : 'Error: No se pudo eliminar el paciente';
    res.render('index', { 
        title: ' App Salud',
        pacientes,
        message 
    });
};


const listarPaciente = async (req, res ) => {
    const pacientes = await pacienteRepository.listar();
    res.render('index', { 
        title: ' App Salud',
        pacientes,
        message: 'Bienvenidos a la App Salud' });
};


module.exports = {
    obtenerPaciente,
    crearPaciente,
    actualizarPaciente,
    eliminarPaciente,
    listarPaciente,
    mostrarFormularioActualizarPaciente
};