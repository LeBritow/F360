import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database/db.js';
import authRoutes from './routes/authRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import cors from 'cors';


const app = express();
const PORT = 4000;

// Corrige o __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração de middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: 'auth-secret-key',
    resave: false,
    saveUninitialized: false,
}));

// Servindo os arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor de gestão de investimentos rodando na porta ${PORT}`);
});
