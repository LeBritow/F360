const urlParams = new URLSearchParams(window.location.search);
const ticker = urlParams.get('ticker');

const actionTitle = document.getElementById('action-title');
const actionDetails = document.getElementById('action-details');

function formatarData(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

async function fetchStockInfo(ticker) {
    try {
        const response = await fetch(`/api/stock-info/${ticker}`);
        if (!response.ok) throw new Error('Erro ao buscar dados da ação');

        const data = await response.json();

        exibirResumo(data);
        carregarDadosHistoricos(ticker);
    } catch (error) {
        console.error('Erro ao buscar dados da ação:', error.message);
        document.getElementById('action-details').innerHTML =
            '<p>Erro ao carregar informações da ação.</p>';
    }
}

function exibirResumo(stockInfo) {
    const actionTitle = document.getElementById('action-title');
    const actionDetails = document.getElementById('action-details');
    const actionLogo = document.getElementById('action-logo');

    const changePercent = typeof stockInfo.change_percent === 'number' 
    ? stockInfo.change_percent.toFixed(2) + "%" 
    : "N/A";

    actionTitle.textContent = `${stockInfo.ticker} - ${stockInfo.long_name || 'Resumo'}`;

    actionDetails.innerHTML = `
        <h3>Desempenho do Último Dia</h3>
        <p> </p>
        <p><strong>Data:</strong> ${stockInfo.date || 'N/A'}</p>
        <p><strong>Preço de Abertura:</strong> R$ ${stockInfo.open_price || 'N/A'}</p>
        <p><strong>Preço de Fechamento:</strong> R$ ${stockInfo.close_price || 'N/A'}</p>
        <p><strong>Variação Percentual:</strong> ${changePercent}</p>
        <p><strong>Volume:</strong> ${stockInfo.volume || 'N/A'}</p>
        <p><strong>Earnings per share:</strong> ${stockInfo.earnings_per_share || 'N/A'}</p>
    `;

    // Atualiza o logo da empresa
    if (stockInfo.logourl) {
        actionLogo.src = stockInfo.logourl;
    } else {
        actionLogo.src = "";
        actionLogo.alt = "Logo não disponível";
    }
}

async function carregarDadosHistoricos(ticker) {
    try {
        const response = await fetch(`/api/stock-history/${ticker}`);
        if (!response.ok) throw new Error('Erro ao carregar dados históricos');

        const data = await response.json();

        const labels = data.map((item) => item.date); // Datas
        const closePrices = data.map((item) => item.close_price);

        const ctx = document.getElementById('chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.reverse(),
                datasets: [{
                    label: 'Preço de Fechamento',
                    data: closePrices.reverse(),
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Preço (R$)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (ticker) {
        fetchStockInfo(ticker);
    } else {
        actionDetails.innerHTML = '<p>Erro: Nenhum ticker especificado.</p>';
    }
});
