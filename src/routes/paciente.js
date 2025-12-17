const express = require('express');
const router = express.Router();

const pacienteController = require('../controllers/pacienteController.js');

router
    .get('/paciente/:id', pacienteController.obtenerPaciente)
    .post('/paciente', pacienteController.crearPaciente)
    .put('/paciente/:id', pacienteController.actualizarPaciente)
    .get('/paciente/editar/:id', pacienteController.mostrarFormularioActualizarPaciente)
    .get('/paciente/:id/historial', pacienteController.mostrarHistorialPaciente)
    .delete('/paciente/:id', pacienteController.eliminarPaciente)
    .get('/pacientes', pacienteController.listarPaciente);

module.exports = router;

