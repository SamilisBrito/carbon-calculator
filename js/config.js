/**
 * ============================================
 * CONFIG — Configurações e Parâmetros Globais
 * ============================================
 *
 * Objeto global que centraliza:
 *  - Fatores de emissão de CO2 por meio de transporte
 *  - Metadados da interface (labels, ícones, cores)
 *  - Constantes de créditos de carbono
 *  - Métodos de manipulação do DOM (datalist, autofill)
 *
 * Dependência: RoutesDB (js/routes-data.js) deve ser carregado antes.
 */

var CONFIG = {

    // =============================================
    // 1. FATORES DE EMISSÃO (kg de CO2 por km)
    // =============================================
    /**
     * Emissão de CO2 em quilogramas por quilômetro percorrido.
     * Fonte: médias estimadas para veículos brasileiros.
     *
     *  - bicycle: 0 (zero emissão — transporte limpo)
     *  - car:     0.12 kg/km (veículo de passeio médio)
     *  - bus:     0.089 kg/km (por passageiro, transporte coletivo)
     *  - truck:   0.96 kg/km (veículo de carga pesada)
     */
    EMISSION_FACTORS: {
        bicycle: 0,
        car: 0.12,
        bus: 0.089,
        truck: 0.96
    },

    // =============================================
    // 2. METADADOS DOS MEIOS DE TRANSPORTE
    // =============================================
    /**
     * Informações visuais para a interface do usuário.
     * Cada modo possui:
     *  - label (string): Nome em Português
     *  - icon (string):  Emoji representativo
     *  - color (string): Código hexadecimal para uso na UI
     */
    TRANSPORT_MODES: {
        bicycle: {
            label: "Bicicleta",
            icon: "🚲",
            color: "#10b981"   // Verde — transporte sustentável
        },
        car: {
            label: "Carro",
            icon: "🚗",
            color: "#3b82f6"   // Azul — veículo de passeio
        },
        bus: {
            label: "Ônibus",
            icon: "🚌",
            color: "#f59e0b"   // Amarelo — transporte coletivo
        },
        truck: {
            label: "Caminhão",
            icon: "🚚",
            color: "#ef4444"   // Vermelho — alto impacto
        }
    },

    // =============================================
    // 3. CONSTANTES DE CRÉDITOS DE CARBONO
    // =============================================
    /**
     * Parâmetros para o cálculo de compensação via créditos de carbono.
     *
     *  - KG_PER_CREDIT:  1 crédito de carbono = 1.000 kg (1 tonelada) de CO2
     *  - PRICE_MIN_BRL:  Preço mínimo estimado por crédito (em R$)
     *  - PRICE_MAX_BRL:  Preço máximo estimado por crédito (em R$)
     */
    CARBON_CREDIT: {
        KG_PER_CREDIT: 1000,
        PRICE_MIN_BRL: 50,
        PRICE_MAX_BRL: 150
    },

    // =============================================
    // 4. MÉTODO: Popular o Datalist de Cidades
    // =============================================
    /**
     * Preenche o <datalist id="cities-list"> com as cidades
     * disponíveis no banco de rotas.
     *
     * Lógica:
     *  1. Obtém todas as cidades via RoutesDB.getAllCities()
     *  2. Captura o elemento datalist no DOM
     *  3. Cria um <option> para cada cidade e adiciona ao datalist
     */
    populateDatalist: function () {
        var cities = RoutesDB.getAllCities();
        var datalist = document.getElementById("cities-list");

        // Limpa opções existentes antes de popular
        datalist.innerHTML = "";

        // Cria e adiciona uma <option> para cada cidade
        cities.forEach(function (city) {
            var option = document.createElement("option");
            option.value = city;
            datalist.appendChild(option);
        });
    },

    // =============================================
    // 5. MÉTODO: Configurar Preenchimento Automático
    // =============================================
    /**
     * Configura o autofill da distância e o comportamento
     * do checkbox de entrada manual.
     *
     * Fluxo:
     *  - Quando origem E destino estão preenchidos:
     *      → Busca a distância via RoutesDB.findDistance()
     *      → Se encontrar: preenche o input + marca readonly + msg verde
     *      → Se NÃO encontrar: limpa o input + sugere entrada manual
     *
     *  - Checkbox "manual-distance":
     *      → Marcado: libera o input de distância para digitação
     *      → Desmarcado: tenta buscar a rota automaticamente de novo
     */
    setupDistanceAutofill: function () {
        // Captura os elementos do DOM
        var originInput = document.getElementById("origin");
        var destinationInput = document.getElementById("destination");
        var distanceInput = document.getElementById("distance");
        var manualCheckbox = document.getElementById("manual-distance");
        var helperText = document.querySelector(".form__helper");

        /**
         * Tenta preencher a distância automaticamente.
         * Chamada quando origem ou destino mudam, ou quando
         * o checkbox manual é desmarcado.
         */
        function tryAutofill() {
            var origin = originInput.value.trim();
            var destination = destinationInput.value.trim();

            // Só busca se ambos os campos estiverem preenchidos
            if (origin && destination) {
                var distance = RoutesDB.findDistance(origin, destination);

                if (distance !== null) {
                    // ✅ Rota encontrada — preenche e trava o campo
                    distanceInput.value = distance;
                    distanceInput.readOnly = true;
                    helperText.textContent = "✅ Distância encontrada automaticamente";
                    helperText.style.color = "#10b981"; // Verde de sucesso
                } else {
                    // ❌ Rota não encontrada — sugere entrada manual
                    distanceInput.value = "";
                    helperText.textContent = "⚠️ Rota não encontrada. Marque a opção para inserir manualmente.";
                    helperText.style.color = "#f59e0b"; // Amarelo de aviso
                }
            }
        }

        // ----- Event Listeners: Origem e Destino -----
        // Dispara a busca sempre que o usuário mudar a origem ou o destino
        originInput.addEventListener("change", function () {
            // Só faz autofill se o checkbox manual NÃO estiver marcado
            if (!manualCheckbox.checked) {
                tryAutofill();
            }
        });

        destinationInput.addEventListener("change", function () {
            if (!manualCheckbox.checked) {
                tryAutofill();
            }
        });

        // ----- Event Listener: Checkbox Manual -----
        manualCheckbox.addEventListener("change", function () {
            if (manualCheckbox.checked) {
                // Marcado → libera o input para digitação manual
                distanceInput.readOnly = false;
                distanceInput.value = "";
                distanceInput.focus();
                helperText.textContent = "✏️ Insira a distância manualmente em km";
                helperText.style.color = "#6b7280"; // Cinza neutro
            } else {
                // Desmarcado → tenta preencher automaticamente de novo
                distanceInput.readOnly = true;
                tryAutofill();

                // Se não conseguiu preencher, restaura mensagem padrão
                if (!distanceInput.value) {
                    helperText.textContent = "A distância será preenchida automaticamente";
                    helperText.style.color = "#6b7280";
                }
            }
        });
    }
};
