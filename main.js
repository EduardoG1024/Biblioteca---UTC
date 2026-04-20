import 'dotenv/config';
import path from 'path';
import express from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_PUBLIC_URL,
    process.env.SUPABASE_ANON_KEY
);

const port = process.env.PORT;
const app = express();

const __dirname = import.meta.dirname;
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));

// LIMITADOR MIDDLEWARE
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutos
	limit: 5,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
    message: 'Ya no Puedes Enviar mas Formularios'
});

// REDIRECCIONAMIENTO
app.get('/', (req, res) => {
    res.redirect('index.html');
});

// ENDPOINT DATOS USUARIOS & SUPABASE
app.post('/registro', limiter, async (req, res) => {
    console.log(req.body);
    try {
        const { data, error} = await supabase
        .from('Biblioteca UTC Registros')
        .insert({
            Estudiante: req.body.Estudiante,
            Matricula: req.body.Matricula,
            Carrera: req.body.Carrera,
            Fecha: req.body.Dia,
            Hora_Entrada: req.body.HoraEntrada,
            Hora_Salida: req.body.HoraSalida,
            Asunto: req.body.Asunto 

        });
    } catch (error) {
        res.status(500).send('Error al Guardar Registro');
    };
    res.send('Datos Guardados');
});

app.listen(port, () => {
    console.log(`servidor escuchando en el puerto ${port}`)
});