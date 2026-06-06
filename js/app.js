/**
 * ============================================
 * APP — Inicialização e Manipulação de Eventos
 * ============================================
 *
 * Orquestra os módulos globais CONFIG, Calculator e UI.
 * Todo o código está encapsulado no evento DOMContentLoaded
 * para garantir que o DOM está completamente carregado.
 *
 * Dependências (carregadas antes nesta ordem):
 *  1. js/routes-data.js → RoutesDB
 *  2. js/config.js      → CONFIG
 *  3. js/calculator.js  → Calculator
 *  4. js/ui.js          → UI
 */

document.addEventListener('DOMContentLoaded', function () {

    // =============================================
    // 1. INICIALIZAÇÃO
    // =============================================

    // Preenche o <datalist id="cities-list"> com as cidades do RoutesDB
    CONFIG.populateDatalist();

    // Habilita o preenchimento automático de distância ao selecionar origem/destino
    CONFIG.setupDistanceAutofill();

    // Captura o formulário principal pelo ID
    var form = document.getElementById('calculator-form');

    // =============================================
    // 2. MANIPULADOR DE SUBMIT DO FORMULÁRIO
    // =============================================

    form.addEventListener('submit', function (event) {

        // Impede o comportamento padrão (recarregar a página)
        event.preventDefault();

        // --- Leitura dos valores do formulário ---
        var origin = document.getElementById('origin').value.trim();
        var destination = document.getElementById('destination').value.trim();
        var distance = parseFloat(document.getElementById('distance').value);
        var selectedMode = document.querySelector('input[name="transport"]:checked').value;

        // --- Validação dos campos ---
        if (!origin || !destination || !distance || distance <= 0) {
            alert('⚠️ Por favor, preencha todos os campos corretamente.\nVerifique a origem, o destino e a distância.');
            return; // Interrompe a execução se a validação falhar
        }

        // Captura o botão de submit para gerenciar o estado de loading
        var submitButton = form.querySelector('.form__submit');

        // Exibe o spinner e desabilita o botão para evitar múltiplos envios
        UI.showLoading(submitButton);

        // Oculta seções de resultados de um cálculo anterior
        UI.hideElement('results');
        UI.hideElement('comparison');
        UI.hideElement('carbon-credits');

        // =============================================
        // 3. PROCESSAMENTO COM DELAY (simula cálculo)
        // =============================================

        setTimeout(function () {

            try {

                // --- Cálculo da emissão do modo selecionado ---
                var emission = Calculator.calculateEmission(distance, selectedMode);

                // --- Baseline: emissão do carro para comparação ---
                var baselineEmission = Calculator.calculateEmission(distance, 'car');

                // --- Economia gerada em relação ao carro ---
                var savingsData = Calculator.calculateSavings(emission, baselineEmission);

                // --- Comparação entre todos os modos de transporte ---
                var allModesData = Calculator.calculateAllModes(distance);

                // --- Créditos de carbono e estimativa de preço ---
                var credits = Calculator.calculateCarbonCredits(emission);
                var creditPrice = Calculator.estimateCreditPrice(credits);

                // --- Montagem do objeto de dados para renderização dos resultados ---
                var resultsData = {
                    origin: origin,
                    destination: destination,
                    distance: distance,
                    emission: emission,
                    mode: selectedMode,
                    savings: savingsData
                };

                // --- Montagem do objeto de dados para os créditos de carbono ---
                var creditsData = {
                    credits: credits,
                    price: creditPrice
                };

                // --- Renderiza e injeta o HTML na seção de resultados ---
                document.getElementById('results-content').innerHTML = UI.renderResults(resultsData);

                // --- Renderiza e injeta o HTML na seção de comparação ---
                document.getElementById('comparison-content').innerHTML = UI.renderComparison(allModesData, selectedMode);

                // --- Renderiza e injeta o HTML na seção de créditos de carbono ---
                document.getElementById('carbon-credits-content').innerHTML = UI.renderCarbonCredits(creditsData);

                // --- Exibe as três seções de resultados ---
                UI.showElement('results');
                UI.showElement('comparison');
                UI.showElement('carbon-credits');

                // --- Rola suavemente até a seção de resultados ---
                UI.scrollToElement('results');

                // --- Restaura o botão ao estado original ---
                UI.hideLoading(submitButton);

            } catch (error) {

                // Loga o erro no console para depuração
                console.error('Erro no cálculo:', error);

                // Informa o usuário de forma amigável
                alert('❌ Ocorreu um erro ao realizar o cálculo.\nTente novamente ou verifique os dados inseridos.');

                // Restaura o botão mesmo em caso de erro
                UI.hideLoading(submitButton);
            }

        }, 1500); // 1500ms de delay para simular processamento
    });

    // Confirmação de inicialização no console
    console.log('✅ Calculadora inicializada!');
});
