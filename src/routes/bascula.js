const express = require('express');
const router = express.Router();

const pacienteRepository = require('../repositories/pacienteRepository');
const Bascula = require('../models/bascula');
const Termometro = require('../models/termometro');

// Anotar peso (no persistido) y mostrar IMC derivado
router.post('/paciente/:id/bascula', async (req, res) => {
  const id = req.params.id;
  const { peso, altura } = req.body;
  const paciente = await pacienteRepository.buscarPorId(id);
  if (!paciente) {
    return res.render('buscar', { title: 'App Salud', paciente: null, message: 'Paciente no encontrado' });
  }

  // Persistir la lectura en la BD
  const registro = await pacienteRepository.guardarBascula(id, parseFloat(peso), altura ? parseFloat(altura) : null);

  // Recargar paciente con última lectura
  const pacienteRecargado = await pacienteRepository.buscarPorId(id);

  res.render('buscar', {
    title: 'App Salud',
    paciente: pacienteRecargado,
    basculaData: registro,
    message: 'Registro de báscula guardado correctamente'
  });
});

// Anotar temperatura (no persistido) y mostrar conversiones/estadísticas
router.post('/paciente/:id/termometro', async (req, res) => {
  const id = req.params.id;
  const { temperatura } = req.body;
  const paciente = await pacienteRepository.buscarPorId(id);
  if (!paciente) {
    return res.render('buscar', { title: 'App Salud', paciente: null, message: 'Paciente no encontrado' });
  }

  // Persistir la temperatura
  const registro = await pacienteRepository.guardarTermometro(id, parseFloat(temperatura));

  // Recargar paciente con última temperatura
  const pacienteRecargado = await pacienteRepository.buscarPorId(id);

  res.render('buscar', {
    title: 'App Salud',
    paciente: pacienteRecargado,
    termometroData: {
      tempC: registro ? registro.temperaturaC : null,
      tempF: registro ? Number(((registro.temperaturaC * 9/5) + 32).toFixed(2)) : null,
      tempMax: pacienteRecargado.ultimaTemperatura ? pacienteRecargado.ultimaTemperatura.temperaturaC : null,
      tempMin: null,
      anotaciones: 1
    },
    message: 'Temperatura guardada correctamente'
  });
});

module.exports = router;