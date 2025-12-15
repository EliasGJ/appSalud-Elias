const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
 
//rutas
const pacienteRouter = require('./routes/paciente');
const basculaRouter = require('./routes/bascula');


const app = express();
const PORT = 3000;

   
//middlewares
//Interpreta los datos de formulario HTML.
app.use(bodyParser.urlencoded({extended: true}));
//interpreta los datos en formato JSON
app.use(express.json());
//Configurar el directorio de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
//Permite usar ?_method=DELETE o _method en el cuerpo del form
app.use(methodOverride('_method'));
//----------------


app.set('view engine', 'ejs');
app.set('views', './src/views');

//rutas
// Ruta principal
app.get('/', (req, res) => {
  res.redirect('/pacientes');
});

app.use('/', pacienteRouter);
app.use('/', basculaRouter);

//-----

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});