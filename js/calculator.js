/**
 * ============================================
 * CALCULATOR — Lógica Matemática e Conversões
 * ============================================
 *
 * Objeto global que centraliza os cálculos de emissão,
 * comparações entre meios de transporte e créditos de carbono.
 *
 * Dependência: CONFIG (js/config.js) deve estar disponível no escopo global.
 */

var Calculator = {

    /**
     * Calcula a emissão de CO2 para uma distância e modo de transporte específicos.
     *
     * @param {number} distanceKm - A distância percorrida em quilômetros.
     * @param {string} transportMode - O modo de transporte (ex: 'car', 'bus', 'bicycle').
     * @returns {number} O valor da emissão em kg de CO2, arredondado para 2 casas decimais.
     */
    calculateEmission: function (distanceKm, transportMode) {
        var factor = CONFIG.EMISSION_FACTORS[transportMode];
        var emission = distanceKm * factor;
        return Number(emission.toFixed(2));
    },

    /**
     * Calcula as emissões para todos os modos de transporte e os compara com o carro.
     *
     * @param {number} distanceKm - A distância percorrida em quilômetros.
     * @returns {Array} Array de objetos ordenado da menor para a maior emissão.
     */
    calculateAllModes: function (distanceKm) {
        var results = [];
        var carEmission = this.calculateEmission(distanceKm, 'car');

        for (var mode in CONFIG.EMISSION_FACTORS) {
            if (CONFIG.EMISSION_FACTORS.hasOwnProperty(mode)) {
                var emission = this.calculateEmission(distanceKm, mode);
                var percentageVsCar = 0;

                // Evita divisão por zero
                if (carEmission > 0) {
                    percentageVsCar = (emission / carEmission) * 100;
                }

                results.push({
                    mode: mode,
                    emission: emission,
                    percentageVsCar: Number(percentageVsCar.toFixed(2))
                });
            }
        }

        // Ordena da menor para a maior emissão (lowest first)
        results.sort(function (a, b) {
            return a.emission - b.emission;
        });

        return results;
    },

    /**
     * Calcula o total de kg de CO2 economizados e a porcentagem em relação a uma base.
     *
     * @param {number} emission - A emissão atual do modo escolhido (em kg).
     * @param {number} baselineEmission - A emissão base para comparação (ex: emissão do carro).
     * @returns {Object} Objeto contendo o peso salvo (savedKg) e a porcentagem (percentage).
     */
    calculateSavings: function (emission, baselineEmission) {
        var savedKg = baselineEmission - emission;
        var percentage = 0;

        // Evita divisão por zero
        if (baselineEmission > 0) {
            percentage = (savedKg / baselineEmission) * 100;
        }

        return {
            savedKg: Number(savedKg.toFixed(2)),
            percentage: Number(percentage.toFixed(2))
        };
    },

    /**
     * Converte a emissão de CO2 (em kg) para créditos de carbono.
     *
     * @param {number} emissionKg - A quantidade total de emissão em kg.
     * @returns {number} A quantidade de créditos de carbono, com 4 casas decimais.
     */
    calculateCarbonCredits: function (emissionKg) {
        var credits = emissionKg / CONFIG.CARBON_CREDIT.KG_PER_CREDIT;
        return Number(credits.toFixed(4));
    },

    /**
     * Estima o preço financeiro para uma quantidade de créditos de carbono.
     *
     * @param {number} credits - A quantidade de créditos de carbono.
     * @returns {Object} Valores monetários (min, max, average) em Reais (BRL).
     */
    estimateCreditPrice: function (credits) {
        var min = credits * CONFIG.CARBON_CREDIT.PRICE_MIN_BRL;
        var max = credits * CONFIG.CARBON_CREDIT.PRICE_MAX_BRL;
        var average = (min + max) / 2;

        return {
            min: Number(min.toFixed(2)),
            max: Number(max.toFixed(2)),
            average: Number(average.toFixed(2))
        };
    }
};
