import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Registro de usuários
router.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Verifica se o email já existe
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, existingUser) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor ao verificar o e-mail.' });
        if (existingUser) return res.status(400).json({ error: 'E-mail já registrado.' });

        // Insere o novo usuário
        db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, password], (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao registrar usuário.' });
            res.status(201).json({ message: 'Usuário registrado com sucesso!' });
        });
    });
});

// Login de usuários
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Aqui você deve verificar se o usuário existe no banco
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao consultar o banco.' });
        }

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Armazena o ID do usuário na sessão
        req.session.userId = user.id;
        console.log('ID do usuário armazenado na sessão:', user.id); // Verificação no log

        res.status(200).json({ message: 'Login bem-sucedido!' });
    });
});

// Rota para logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao fazer logout.' });
        }
        res.clearCookie('connect.sid');  // Limpa o cookie de sessão
        res.status(200).json({ message: 'Logout realizado com sucesso.' });
    });
});


export default router;
