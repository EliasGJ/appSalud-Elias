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
            paciente: null,
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
    // aceptar opcionalmente peso, altura y temperatura al crear
    const { peso, altura, temperatura } = req.body;

    if (!nombre || !apellidos || !fechaDeNacimiento) {
        return res.render('index', {
            title: ' App Salud',
            pacientes: await pacienteRepository.listar(),
            message: 'Error: Todos los campos son obligatorios'});
    }
    //guardar el nuevo paciente
    const nuevoPaciente = await pacienteRepository.guardar({ nombre, apellidos, fechaDeNacimiento });

    // Si se enviaron lecturas iniciales, persistirlas
    if (peso) {
        await pacienteRepository.guardarBascula(nuevoPaciente.id, parseFloat(peso), altura ? parseFloat(altura) : null);
    }
    if (temperatura) {
        await pacienteRepository.guardarTermometro(nuevoPaciente.id, parseFloat(temperatura));
    }
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
const mostrarHistorialPaciente = async (req, res) => {
    const id = req.params.id;
    const paciente = await pacienteRepository.buscarPorId(id);
    if (!paciente) {
        return res.redirect('/pacientes');
    }

    const basculas = await pacienteRepository.obtenerHistorialBascula(id);
    const termometros = await pacienteRepository.obtenerHistorialTermometro(id);

    res.render('historial', {
        title: 'Historial paciente',
        paciente,
        basculas,
        termometros,
        message: ''
    });
}
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
    message: 'Bienvenido a Odin, un aliado diseñado para ayudarte a cuidar tu bienestar cada día.' });
};


module.exports = {
    obtenerPaciente,
    crearPaciente,
    actualizarPaciente,
    eliminarPaciente,
    listarPaciente,
    mostrarFormularioActualizarPaciente,
    mostrarHistorialPaciente
};