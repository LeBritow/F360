import express from 'express';
import db from '../database/db.js';
import User from "../modelos/User.js";


const router = express.Router();

// Registro de usuários
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await Users.registrar(email, password);
        res.status(response.status).json({ message: response.message });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(error.status || 500).json({ error: error.message || 'Erro no servidor' });
    }
});


// Login de usuários
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try{
         // Aqui você deve verificar se o usuário existe no banco
         const user = await User.login(email)
         if (!user || user.password !== password) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
        }else{
            // Armazena o ID do usuário na sessão
            req.session.userId = user.id;
            console.log('ID do usuário armazenado na sessão:', user.id); // Verificação no log

            res.status(200).json({ message: 'Login bem-sucedido!' });
        }
    }catch(error){
        return res.status(500).json({ error: 'Erro ao consultar o banco.' });
    }


   

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
