// Seleção de elementos
const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.querySelector('.suggestions');
const maioresValores = document.getElementById('maiores-valores');
const earnings = document.getElementById('earnings');
const receitas = document.getElementById('receitas');
const AUTH_SERVER_URL = "http://ec2-52-201-38-99.compute-1.amazonaws.com:4000";

// Atualiza o link do botão "iniciar Sessão" dinamicamente
document.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.querySelector('.nav-links a[href="login.html"]');
    if (loginLink) {
        loginLink.href = `${AUTH_SERVER_URL}/login.html`;
    }
});

// Função para buscar sugestões
async function buscarSugestoes(query) {
    try {
        const response = await fetch(`/api/searchStocks?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Erro ao buscar ações');
        const data = await response.json();
        console.log('Sugestões encontradas:', data);
        mostrarSugestoes(data);
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        mostrarErro('Erro ao carregar sugestões');
    }
}

function mostrarSugestoes(data) {
    if (data.length > 0) {
        // Gera os itens das sugestões
        suggestionsContainer.innerHTML = data
            .map(stock => `<div class="suggestion-item" data-ticker="${stock.ticker}">${stock.ticker} - ${stock.name}</div>`)
            .join('');
        suggestionsContainer.style.display = 'block';

        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function () {
                const ticker = this.getAttribute('data-ticker');
                searchInput.value = ticker;
                suggestionsContainer.innerHTML = '';
                suggestionsContainer.style.display = 'none';
                window.location.href = `/stats.html?ticker=${encodeURIComponent(ticker)}`;
                salvarPesquisaRecente(ticker);
            });
        });
    } else {
        suggestionsContainer.innerHTML = '<div class="no-results">Nenhuma ação encontrada</div>';
        suggestionsContainer.style.display = 'block';
    }
}

function mostrarErro(mensagem) {
    suggestionsContainer.innerHTML = `<div class="error-message">${mensagem}</div>`;
    suggestionsContainer.style.display = 'block';
}

searchInput.addEventListener('input', function () {
    const searchTerm = this.value.trim();
    if (!searchTerm) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
        return;
    }
    buscarSugestoes(searchTerm);
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && searchInput.value.trim() !== '') {
        const ticker = searchInput.value.trim();
        salvarPesquisaRecente(ticker);
        window.location.href = `/stats.html?ticker=${encodeURIComponent(ticker)}`;
    }
});

const recentesContainer = document.getElementById('recentes-container');

function salvarPesquisaRecente(ticker) {
    console.log(`Salvando ${ticker} no localStorage`); // Log para depuração
    let recentes = JSON.parse(localStorage.getItem('recentes')) || [];
    if (!recentes.includes(ticker)) {
        recentes.unshift(ticker);
        if (recentes.length > 5) recentes.pop(); // Mantém no máximo 5 itens
        localStorage.setItem('recentes', JSON.stringify(recentes));
    }
}

function carregarPesquisasRecentes() {
    const recentes = JSON.parse(localStorage.getItem('recentes')) || [];
    if (recentes.length === 0) {
        recentesContainer.innerHTML = '<p>Nenhuma pesquisa recente.</p>';
    } else {
        recentesContainer.innerHTML = recentes
            .map((ticker) => `<div class="recent-item" onclick="window.location.href='/stats.html?ticker=${ticker}'">${ticker}</div>`)
            .join('');
    }
}

document.addEventListener('DOMContentLoaded', carregarPesquisasRecentes);

document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', function () {
        const ticker = this.getAttribute('data-ticker'); // Obtém o ticker da sugestão
        salvarPesquisaRecente(ticker); // Salva a pesquisa recente
        window.location.href = `/stats.html?ticker=${encodeURIComponent(ticker)}`; // Redireciona para a página de estatísticas
    });
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && searchInput.value.trim() !== '') {
        const ticker = searchInput.value.trim();
        salvarAcaoRecente(ticker);
        window.location.href = `/stats.html?ticker=${encodeURIComponent(ticker)}`;
    }
});

async function carregarRankings() {
    try {
        const responseMaioresValores = await fetch('/api/ranking/maiores-valores');
        const maioresValoresData = await responseMaioresValores.json();
        maioresValores.innerHTML = `
            <h3>📈 Maiores Valores</h3>
            <ul>
                ${maioresValoresData.map(item => `
                    <li>
                        <a href="/stats.html?ticker=${encodeURIComponent(item.ticker)}" class="ranking-link">
                            ${item.ticker}: R$ ${item.valor.toFixed(2)}
                        </a>
                    </li>`).join('')}
            </ul>
        `;

        const responseEarnings = await fetch('/api/ranking/earnings');
        const earningsData = await responseEarnings.json();
        earnings.innerHTML = `
            <h3>💰 Earnings per Share</h3>
            <ul>
                ${earningsData.map(item => `
                    <li>
                        <a href="/stats.html?ticker=${encodeURIComponent(item.ticker)}" class="ranking-link">
                            ${item.ticker}: ${typeof item.earnings_per_share === 'number' ? item.earnings_per_share.toFixed(2) : 'N/A'}
                        </a>
                    </li>`).join('')}
            </ul>
        `;

        const responseReceitas = await fetch('/api/ranking/receitas');
        const receitasData = await responseReceitas.json();
        receitas.innerHTML = `
            <h3>📊 Receitas</h3>
            <ul>
                ${receitasData.map(item => `
                    <li>
                        <a href="/stats.html?ticker=${encodeURIComponent(item.ticker)}" class="ranking-link">
                            ${item.ticker}: ${item.receita || 'N/A'}
                        </a>
                    </li>`).join('')}
            </ul>
        `;
    } catch (error) {
        console.error('Erro ao carregar os rankings:', error);

        maioresValores.innerHTML = '<p>Erro ao carregar maiores valores</p>';
        earnings.innerHTML = '<p>Erro ao carregar earnings</p>';
        receitas.innerHTML = '<p>Erro ao carregar receitas</p>';
    }
}

document.addEventListener('DOMContentLoaded', carregarRankings);

function atualizarRanking(tipo, dados) {
    const container = document.querySelector(`#${tipo}Container`);
    if (dados.length === 0) {
        container.innerHTML = '<p>Nenhum dado disponível</p>';
        return;
    }

    container.innerHTML = dados
        .map(item => `
            <div class="ranking-item">
                <strong>${item.ticker}</strong> - ${item.long_name} 
                <span>${item.valor || item.earnings_per_share || item.receita}</span>
            </div>
        `)
        .join('');
}