// Variáveis globais
let itens = [];
let editingId = null;
const API_BASE = 'api/itens.php';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Inicializar aplicação
function initializeApp() {
    console.log('🚀 Inicializando aplicação...');
    
    // Verificar se estamos no ambiente correto
    checkEnvironment();
    
    // Animação inicial da página
    anime({
        targets: '.header',
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo'
    });

    anime({
        targets: '.filters',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 800,
        delay: 200,
        easing: 'easeOutExpo'
    });

    // Carregar itens
    carregarItens();

    // Event listeners
    document.getElementById('itemForm').addEventListener('submit', handleSubmit);
    
    // Animação do logo
    anime({
        targets: '.logo i',
        rotate: [0, 360],
        duration: 2000,
        loop: true,
        easing: 'linear'
    });
}

// Verificar ambiente
function checkEnvironment() {
    const debugStatus = document.getElementById('connection-status');
    const apiStatus = document.getElementById('api-status');
    
    // Verificar se estamos no localhost
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        debugStatus.textContent = '⚠️ Não localhost';
        debugStatus.style.color = '#f59e0b';
        showConnectionAlert('Aviso: Sistema não está rodando em localhost', 'warning');
    } else {
        debugStatus.textContent = '✅ Localhost OK';
        debugStatus.style.color = '#10b981';
    }
    
    // Testar API
    testAPI().then(result => {
        if (result.success) {
            apiStatus.textContent = '✅ API OK';
            apiStatus.style.color = '#10b981';
        } else {
            apiStatus.textContent = '❌ API Erro';
            apiStatus.style.color = '#ef4444';
            showConnectionAlert('Erro na API: ' + result.message, 'error');
        }
    });
}

// Testar API
async function testAPI() {
    try {
        console.log('🔍 Testando API...');
        const response = await fetch(API_BASE, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 API Response:', data);
        
        return { success: true, data };
    } catch (error) {
        console.error('❌ Erro na API:', error);
        return { 
            success: false, 
            message: error.message,
            details: {
                url: API_BASE,
                error: error.toString()
            }
        };
    }
}

// Mostrar alerta de conexão
function showConnectionAlert(message, type = 'warning') {
    const alert = document.getElementById('connection-alert');
    const messageSpan = document.getElementById('connection-message');
    
    alert.className = `alert ${type}`;
    messageSpan.textContent = message;
    alert.style.display = 'flex';
    
    // Auto-hide após 10 segundos para warnings
    if (type === 'warning') {
        setTimeout(() => {
            alert.style.display = 'none';
        }, 10000);
    }
}

// Carregar itens da API
async function carregarItens() {
    console.log('📦 Carregando itens...');
    showLoading(true);
    
    try {
        const filtroNome = document.getElementById('filtroNome').value;
        const filtroTipo = document.getElementById('filtroTipo').value;
        
        let url = API_BASE;
        const params = new URLSearchParams();
        
        if (filtroNome) params.append('filtro', filtroNome);
        if (filtroTipo) params.append('tipo', filtroTipo);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        console.log('🌐 Fazendo requisição para:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Resposta não é JSON:', text);
            throw new Error('Resposta da API não é JSON válido');
        }
        
        const data = await response.json();
        console.log('📊 Dados recebidos:', data);
        
        if (data.success) {
            itens = data.data || [];
            renderizarItens();
            atualizarEstatisticas();
            
            // Esconder alerta de erro se existir
            document.getElementById('connection-alert').style.display = 'none';
        } else {
            throw new Error(data.message || 'Erro desconhecido na API');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar itens:', error);
        showToast('Erro ao carregar itens: ' + error.message, 'error');
        showConnectionAlert('Erro de conexão: ' + error.message, 'error');
        
        // Mostrar estado de erro
        renderizarErro(error.message);
    } finally {
        showLoading(false);
    }
}

// Renderizar estado de erro
function renderizarErro(errorMessage) {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i>
            <h3>Erro de Conexão</h3>
            <p>Não foi possível carregar os itens do servidor.</p>
            <p><strong>Erro:</strong> ${errorMessage}</p>
            <div style="margin-top: 2rem;">
                <button class="btn-primary" onclick="carregarItens()">
                    <i class="fas fa-redo"></i>
                    Tentar Novamente
                </button>
                <button class="btn-secondary" onclick="window.open('debug-info.php', '_blank')" style="margin-left: 1rem;">
                    <i class="fas fa-bug"></i>
                    Debug Info
                </button>
            </div>
        </div>
    `;
}

// Renderizar itens na tela
function renderizarItens() {
    const grid = document.getElementById('itemsGrid');
    
    if (itens.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Nenhum item encontrado</h3>
                <p>Adicione novos itens ao seu inventário ou ajuste os filtros de busca.</p>
                <button class="btn-primary" onclick="openModal()">
                    <i class="fas fa-plus"></i>
                    Adicionar Primeiro Item
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = itens.map(item => `
        <div class="item-card fade-in" data-id="${item.id}">
            <div class="item-header">
                <div class="item-info">
                    <h3>${item.nome}</h3>
                    <span class="item-type">${item.tipo}</span>
                </div>
            </div>
            <div class="item-quantity">
                <i class="fas fa-cubes"></i>
                <span>Quantidade:</span>
                <span class="quantity-badge">${item.quantidade}</span>
            </div>
            <div class="item-meta">
                <small class="text-muted">
                    <i class="fas fa-clock"></i>
                    Atualizado em ${formatarData(item.data_atualizacao)}
                </small>
            </div>
            <div class="item-actions">
                <button class="btn-secondary btn-small" onclick="editarItem(${item.id})">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button class="btn-danger btn-small" onclick="confirmarExclusao(${item.id}, '${item.nome}')">
                    <i class="fas fa-trash"></i>
                    Excluir
                </button>
            </div>
        </div>
    `).join('');
    
    // Animar entrada dos cards
    anime({
        targets: '.item-card',
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 600,
        delay: anime.stagger(100),
        easing: 'easeOutExpo'
    });
}

// Filtrar itens
function filtrarItens() {
    clearTimeout(window.filtroTimeout);
    window.filtroTimeout = setTimeout(() => {
        carregarItens();
    }, 300);
}

// Abrir modal
function openModal(item = null) {
    const modal = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('itemForm');
    
    if (item) {
        title.textContent = 'Editar Item';
        document.getElementById('nome').value = item.nome;
        document.getElementById('tipo').value = item.tipo;
        document.getElementById('quantidade').value = item.quantidade;
        editingId = item.id;
    } else {
        title.textContent = 'Novo Item';
        form.reset();
        editingId = null;
    }
    
    modal.classList.add('active');
    
    anime({
        targets: '.modal',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutBack'
    });
    
    setTimeout(() => {
        document.getElementById('nome').focus();
    }, 100);
}

// Fechar modal
function closeModal() {
    const modal = document.getElementById('modalOverlay');
    
    anime({
        targets: '.modal',
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInBack',
        complete: () => {
            modal.classList.remove('active');
            editingId = null;
        }
    });
}

// Handle form submit
async function handleSubmit(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const tipo = document.getElementById('tipo').value;
    const quantidade = parseInt(document.getElementById('quantidade').value);
    
    if (!nome || !tipo || quantidade < 0) {
        showToast('Por favor, preencha todos os campos corretamente', 'warning');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    submitBtn.disabled = true;
    
    try {
        const data = { nome, tipo, quantidade };
        let method = 'POST';
        
        if (editingId) {
            data.id = editingId;
            method = 'PUT';
        }
        
        console.log('💾 Enviando dados:', data);
        
        const response = await fetch(API_BASE, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 Resultado:', result);
        
        if (result.success) {
            showToast(result.message, 'success');
            closeModal();
            carregarItens();
        } else {
            throw new Error(result.message || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        showToast('Erro ao salvar: ' + error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Editar item
function editarItem(id) {
    const item = itens.find(i => i.id == id);
    if (item) {
        openModal(item);
    }
}

// Confirmar exclusão
function confirmarExclusao(id, nome) {
    if (confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
        excluirItem(id);
    }
}

// Excluir item
async function excluirItem(id) {
    try {
        console.log('🗑️ Excluindo item:', id);
        
        const response = await fetch(`${API_BASE}?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 Resultado exclusão:', result);
        
        if (result.success) {
            showToast(result.message, 'success');
            
            const card = document.querySelector(`[data-id="${id}"]`);
            if (card) {
                anime({
                    targets: card,
                    scale: [1, 0],
                    opacity: [1, 0],
                    duration: 400,
                    easing: 'easeInBack',
                    complete: () => {
                        carregarItens();
                    }
                });
            } else {
                carregarItens();
            }
        } else {
            throw new Error(result.message || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('❌ Erro ao excluir:', error);
        showToast('Erro ao excluir: ' + error.message, 'error');
    }
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const totalItens = itens.reduce((sum, item) => sum + parseInt(item.quantidade), 0);
    document.getElementById('totalItens').textContent = totalItens;
    
    anime({
        targets: '#totalItens',
        innerHTML: [0, totalItens],
        duration: 1000,
        round: 1,
        easing: 'easeOutExpo'
    });
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('itemsGrid');
    
    if (show) {
        loading.classList.add('active');
        grid.style.display = 'none';
    } else {
        loading.classList.remove('active');
        grid.style.display = 'grid';
    }
}

// Sistema de notificações toast
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        anime({
            targets: toast,
            translateX: [0, 400],
            opacity: [1, 0],
            duration: 400,
            easing: 'easeInBack',
            complete: () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }
        });
    }, 4000);
}

// Formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fechar modal ao clicar fora
document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
    
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openModal();
    }
});
