import express from 'express';
import db from '../database/db.js';

const router = express.Router();

/// Middleware para verificar autenticação
router.use((req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Não autenticado.' });
    }
    next();
});

router.get('/', (req, res) => {
    const userId = req.session.userId;
    console.log('userId da sessão:', userId);  // Verifique no log

    db.all('SELECT * FROM investments WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar investimentos.' });
        res.status(200).json(rows);
    });
});

// Adicionar investimento
router.post('/', (req, res) => {
    const { ticker, value, quantity } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    // Verifique se os dados necessários estão sendo enviados
    console.log('Dados recebidos para o novo investimento:', { ticker, value, quantity, userId });

    db.run(
        `INSERT INTO investments (user_id, ticker, value, quantity) VALUES (?, ?, ?, ?)`,
        [userId, ticker, value, quantity],
        function (err) {
            if (err) {
                console.error('Erro ao inserir investimento:', err); // Log o erro
                return res.status(500).json({ error: 'Erro ao adicionar investimento.' });
            }
            console.log('Investimento adicionado com sucesso:', this.lastID);
            res.status(201).json({ message: 'Investimento adicionado!' });
        }
    );
});

//Editar Investimento
router.put('/:id', (req, res) => {
    const { ticker, value, quantity } = req.body;
    const { id } = req.params;
    const userId = req.session.userId;

    db.run(
        `UPDATE investments SET ticker = ?, value = ?, quantity = ? WHERE id = ? AND user_id = ?`,
        [ticker, value, quantity, id, userId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar investimento.' });
            res.status(200).json({ message: 'Investimento atualizado!' });
        }
    );
});

// Excluir investimento
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    db.run(`DELETE FROM investments WHERE id = ? AND user_id = ?`, [id, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao excluir investimento.' });
        res.status(200).json({ message: 'Investimento excluído!' });
    });
});


export default router;
