document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
        // Envia os dados para o servidor
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Login bem-sucedido!');
            window.location.href = '/portfolio.html'; // Redireciona para a página do portfolio
        } else {
            alert(`Erro: ${result.error}`);
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login.');
    }
});

const MAIN_SERVER_URL = "http://localhost:3000";

// Atualiza o redirecionamento do botão "Voltar para a Tela Inicial"
document.addEventListener("DOMContentLoaded", () => {
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = `${MAIN_SERVER_URL}/home.html`;
        });
    }
});

