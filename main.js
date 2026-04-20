import 'dotenv/config';
import path from 'path';
import express from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { createClient } from "@supabase/supabase-js";

const port = process.env.PORT;
const app = express();

const __dirname = import.meta.dirname;
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));

// REDIRECCIONAMIENTO
app.get('/', (req, res) => {
    res.redirect('index.html')
})

// ENDPOINT DATOS USUARIOS
app.post('/registro', (req, res) => {
    console.log(req.body);
    res.send('Datos Guardados');
});

app.listen(port, () => {
    console.log(`servidor escuchando en el puerto ${port}`)
});