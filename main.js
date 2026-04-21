import 'dotenv/config';
import path from 'path';
import express from "express";
import rateLimit, {ipKeyGenerator} from "express-rate-limit";
import session from "express-session";
import { createClient } from "@supabase/supabase-js";
import { error } from 'console';

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

// SESSION
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false} // CAMBIAR EN PRODUCCION A "TRUE" / "FALSE" ENTORNO LOCAL
}));

// LIMITADOR MIDDLEWARE
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutos
	limit: 5,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
    keyGenerator: (req, res) => {
        return req.sessionID || ipKeyGenerator(req);
    },
    message: 'Ya no Puedes Enviar mas Formularios'
});

// REDIRECCIONAMIENTO
app.get('/', (req, res) => {
    res.redirect('index.html');
});

// MIDDLEWARE PARA TIPO DE DATOS DEL FRONTEND A SUPABASE
// CHECAR QUE NO GUARDEN DATOS VACIOS
function FiltrarDatos() {
    
}

// ENDPOINT DATOS USUARIOS & SUPABASE
app.post('/registro', limiter, async (req, res) => {
    //console.log(req.body);
    // SUPABASE GUARDADO
    try {
        const { data, error} = await supabase
        .from('Biblioteca UTC Registros')
        .insert({
            Estudiante: req.body.Estudiante,
            Matricula: req.body.Matricula,
            Carrera: req.body.Carrera,
            Fecha: req.body.Fecha,
            Hora_Entrada: req.body.HoraEntrada,
            Hora_Salida: req.body.HoraSalida,
            Asunto: req.body.Asunto 

        });
    } catch (error) {
        res.status(500).send('Error al Guardar Registro');
    };
    res.send('Datos Guardados');
});

// LOGIN ENDPOINT VERIFICACION DE TOKEN SUPABASE
app.post('/verificado', async (req, res) => {
    //console.log(req.body);
    const { data, error } = await supabase.auth.signInWithPassword({
    email: req.body.correo,
    password: req.body.contraseña,
    });
    if (error) {
        return res.redirect('/');
    }
    req.session.token = data.session.access_token;
    res.redirect('/dashboard');
});

// MIDDLEWARE DASHBOARD
const MiddlewareDashboard = (req, res, next) => {
    const TOKEN = req.session.token;
    if (!TOKEN) {
        return res.redirect('/troleado')
    }
    next();
}

// DASHBOARD
app.get('/dashboard',MiddlewareDashboard, (req, res) => {
    res.sendFile(path.resolve('auth/auth.html'))
});

// API AUTH
app.get('/RegistroDeEstudiantes', async (req, res) => {
    try {
        const { data, error } = await supabase
        .from('Biblioteca UTC Registros')
        .select('*');
        if (error) {
            return res.status(500).json({error});
        }
        console.log(data);
        res.json(data);
    } catch (err) {
        res.status(500).send('Error al Obtener Datos');
    }
});

// TROLEADO
app.get('/troleado', (req, res) => {
    res.send('troleado');
});

app.listen(port, () => {
    console.log(`servidor escuchando en el puerto ${port}`)
});