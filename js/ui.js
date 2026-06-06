/**
 * ============================================
 * UI — Manipulação do DOM e Renderização HTML
 * ============================================
 *
 * Objeto global que centraliza todos os métodos de utilitário,
 * manipulação do DOM e geração dinâmica de HTML da aplicação.
 *
 * Dependência: CONFIG (js/config.js) deve estar disponível no escopo global.
 */

var UI = {

    // =============================================
    // 1. MÉTODOS DE UTILIDADE (UTILITY METHODS)
    // =============================================

    /**
     * Formata um número com casas decimais e separadores de milhar no padrão pt-BR.
     *
     * @param {number} number   - O número a ser formatado.
     * @param {number} decimals - Quantidade de casas decimais.
     * @returns {string} Número formatado (ex: "1.234,56").
     */
    formatNumber: function (number, decimals) {
        return number.toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Formata um valor numérico como moeda brasileira (R$).
     *
     * @param {number} value - O valor a ser formatado.
     * @returns {string} Valor no formato "R$ 1.234,56".
     */
    formatCurrency: function (value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        });
    },

    /**
     * Exibe um elemento ocultado pela classe CSS 'hidden'.
     *
     * @param {string} elementId - O ID do elemento no DOM.
     */
    showElement: function (elementId) {
        var el = document.getElementById(elementId);
        if (el) el.classList.remove('hidden');
    },

    /**
     * Oculta um elemento adicionando a classe CSS 'hidden'.
     *
     * @param {string} elementId - O ID do elemento no DOM.
     */
    hideElement: function (elementId) {
        var el = document.getElementById(elementId);
        if (el) el.classList.add('hidden');
    },

    /**
     * Rola a página suavemente até o elemento especificado.
     *
     * @param {string} elementId - O ID do elemento de destino.
     */
    scrollToElement: function (elementId) {
        var el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    },

    /**
     * Exibe o estado de carregamento no botão de submit.
     * Guarda o texto original em um atributo data- e substitui pelo spinner.
     *
     * @param {HTMLElement} buttonElement - O elemento <button> do formulário.
     */
    showLoading: function (buttonElement) {
        // Salva o texto original para restaurar depois
        buttonElement.setAttribute('data-original-text', buttonElement.innerHTML);
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<span class="spinner"></span> Calculando...';
    },

    /**
     * Remove o estado de carregamento do botão e restaura o texto original.
     *
     * @param {HTMLElement} buttonElement - O elemento <button> do formulário.
     */
    hideLoading: function (buttonElement) {
        buttonElement.disabled = false;
        buttonElement.innerHTML = buttonElement.getAttribute('data-original-text');
    },

    // =============================================
    // 2. MÉTODOS DE RENDERIZAÇÃO (RENDERING METHODS)
    // =============================================

    /**
     * Gera o HTML do painel de resultados da emissão.
     *
     * Estrutura gerada:
     *  <div class="results__grid">
     *    <div class="results__card">  ← Rota (Origem → Destino)
     *    <div class="results__card">  ← Distância em km
     *    <div class="results__card">  ← Emissão de CO2 em kg
     *    <div class="results__card">  ← Modo de transporte
     *    <div class="results__card results__card--savings">  ← Economia (condicional)
     *  </div>
     *
     * @param {Object} data - Objeto com { origin, destination, distance, emission, mode, savings }.
     * @returns {string} String HTML para inserir no DOM.
     */
    renderResults: function (data) {
        // Busca os metadados visuais do modo de transporte (ícone, label, cor)
        var modeInfo = CONFIG.TRANSPORT_MODES[data.mode];

        // Card de economia: exibido apenas quando o modo não é 'car' e há economia positiva
        var savingsCard = '';
        if (data.mode !== 'car' && data.savings && data.savings.savedKg > 0) {
            savingsCard = `
                <div class="results__card results__card--savings">
                    <span class="results__card-icon">💚</span>
                    <span class="results__card-label">CO2 Economizado</span>
                    <span class="results__card-value">${this.formatNumber(data.savings.savedKg, 2)} kg</span>
                    <span class="results__card-sub">${this.formatNumber(data.savings.percentage, 1)}% menos que de carro</span>
                </div>
            `;
        }

        return `
            <div class="results__grid">

                <!-- Rota: Origem → Destino -->
                <div class="results__card results__card--route">
                    <span class="results__card-icon">📍</span>
                    <span class="results__card-label">Rota</span>
                    <span class="results__card-value">${data.origin}</span>
                    <span class="results__card-sub">→ ${data.destination}</span>
                </div>

                <!-- Distância em km -->
                <div class="results__card">
                    <span class="results__card-icon">📏</span>
                    <span class="results__card-label">Distância</span>
                    <span class="results__card-value">${this.formatNumber(data.distance, 0)} km</span>
                </div>

                <!-- Emissão de CO2 em kg -->
                <div class="results__card results__card--emission">
                    <span class="results__card-icon">🍃</span>
                    <span class="results__card-label">Emissão de CO2</span>
                    <span class="results__card-value">${this.formatNumber(data.emission, 2)} kg</span>
                </div>

                <!-- Modo de transporte selecionado -->
                <div class="results__card">
                    <span class="results__card-icon">${modeInfo.icon}</span>
                    <span class="results__card-label">Transporte</span>
                    <span class="results__card-value">${modeInfo.label}</span>
                </div>

                ${savingsCard}

            </div>
        `;
    },

    /**
     * Gera o HTML da seção de comparação entre todos os modos de transporte.
     *
     * Estrutura gerada:
     *  <div class="comparison__grid">
     *    <div class="comparison__item [comparison__item--selected]">
     *      <span> ícone e nome do modo
     *      <div class="comparison__bar-track">
     *        <div class="comparison__bar"> ← largura proporcional à emissão
     *      <span> valor em kg e percentagem vs carro
     *    </div>
     *  </div>
     *
     * @param {Array}  modesArray    - Array de { mode, emission, percentageVsCar } (output de Calculator.calculateAllModes).
     * @param {string} selectedMode  - O modo atualmente selecionado pelo usuário.
     * @returns {string} String HTML para inserir no DOM.
     */
    renderComparison: function (modesArray, selectedMode) {
        // Define a paleta de cores da barra por nível de emissão
        var barColors = {
            bicycle: '#10b981',  // Verde — zero emissão
            bus:     '#f59e0b',  // Amarelo — baixo impacto
            car:     '#3b82f6',  // Azul — impacto médio
            truck:   '#ef4444'   // Vermelho — alto impacto
        };

        var items = modesArray.map(function (item) {
            var modeInfo = CONFIG.TRANSPORT_MODES[item.mode];
            var isSelected = item.mode === selectedMode;
            var barWidth = Math.min(item.percentageVsCar, 100); // limita barra a 100% visualmente
            var barColor = barColors[item.mode] || '#6b7280';

            // Aplica classe --selected se for o modo escolhido pelo usuário
            var selectedClass = isSelected ? ' comparison__item--selected' : '';

            // Dica eco para a bicicleta
            var ecoTip = item.mode === 'bicycle'
                ? '<span class="comparison__eco-tip">🌱 Emissão zero!</span>'
                : '';

            return `
                <div class="comparison__item${selectedClass}">
                    <div class="comparison__item-header">
                        <span class="comparison__item-icon">${modeInfo.icon}</span>
                        <span class="comparison__item-label">${modeInfo.label}</span>
                        ${ecoTip}
                        ${isSelected ? '<span class="comparison__badge">Selecionado</span>' : ''}
                    </div>
                    <div class="comparison__bar-track">
                        <div class="comparison__bar"
                             style="width: ${barWidth}%; background-color: ${barColor};">
                        </div>
                    </div>
                    <div class="comparison__item-footer">
                        <span class="comparison__item-emission">${UI.formatNumber(item.emission, 2)} kg CO2</span>
                        <span class="comparison__item-percentage">${UI.formatNumber(item.percentageVsCar, 1)}% vs carro</span>
                    </div>
                </div>
            `;
        });

        return `<div class="comparison__grid">${items.join('')}</div>`;
    },

    /**
     * Gera o HTML da seção de créditos de carbono.
     *
     * Estrutura gerada:
     *  <div class="carbon-credits__grid">
     *    <div class="carbon-credits__card">  ← Quantidade de créditos (número em destaque)
     *    <div class="carbon-credits__card">  ← Preço estimado (average + range min/max)
     *  </div>
     *  <div class="carbon-credits__info-box"> ← Explicação sobre créditos de carbono
     *  <button class="carbon-credits__btn">  ← Botão de compensação
     *
     * @param {Object} creditsData - Objeto com { credits, price: { min, max, average } }.
     * @returns {string} String HTML para inserir no DOM.
     */
    renderCarbonCredits: function (creditsData) {
        return `
            <div class="carbon-credits__grid">

                <!-- Card 1: Quantidade de créditos -->
                <div class="carbon-credits__card">
                    <span class="carbon-credits__card-label">Créditos Necessários</span>
                    <span class="carbon-credits__card-big">${this.formatNumber(creditsData.credits, 4)}</span>
                    <span class="carbon-credits__card-sub">1 crédito = 1.000 kg CO2</span>
                </div>

                <!-- Card 2: Preço estimado -->
                <div class="carbon-credits__card">
                    <span class="carbon-credits__card-label">Preço Estimado</span>
                    <span class="carbon-credits__card-big">${this.formatCurrency(creditsData.price.average)}</span>
                    <span class="carbon-credits__card-sub">
                        De ${this.formatCurrency(creditsData.price.min)}
                        até ${this.formatCurrency(creditsData.price.max)}
                    </span>
                </div>

            </div>

            <!-- Caixa informativa sobre créditos de carbono -->
            <div class="carbon-credits__info-box">
                <span class="carbon-credits__info-icon">ℹ️</span>
                <p class="carbon-credits__info-text">
                    <strong>O que são créditos de carbono?</strong><br>
                    São certificados que representam a redução ou remoção de 1 tonelada (1.000 kg) de CO2
                    da atmosfera. Ao comprá-los, você compensa suas emissões financiando projetos
                    de reflorestamento e energia limpa.
                </p>
            </div>

            <!-- Botão de compensação (demonstração) -->
            <button class="carbon-credits__btn" type="button">
                🛒 Compensar Emissões
            </button>
        `;
    }

};
