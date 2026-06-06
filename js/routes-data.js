/**
 * ============================================
 * ROUTES DATABASE — Banco de Dados de Rotas
 * ============================================
 *
 * Define a variável global RoutesDB que serve como banco de dados
 * de rotas rodoviárias do Brasil.
 *
 * Estrutura:
 *  - routes: Array de objetos { origin, destination, distanceKm }
 *  - getAllCities(): Retorna array ordenado de cidades únicas
 *  - findDistance(origin, destination): Busca bidirecional de distância
 */

var RoutesDB = {

    /**
     * Array de rotas rodoviárias brasileiras.
     * Cada rota possui:
     *  - origin (string):      Cidade de origem com sigla do estado
     *  - destination (string): Cidade de destino com sigla do estado
     *  - distanceKm (number):  Distância real em quilômetros
     */
    routes: [

        // =============================================
        // REGIÃO SUDESTE — Conexões entre capitais
        // =============================================
        { origin: "São Paulo, SP",        destination: "Rio de Janeiro, RJ",     distanceKm: 430 },
        { origin: "São Paulo, SP",        destination: "Belo Horizonte, MG",     distanceKm: 586 },
        { origin: "Rio de Janeiro, RJ",   destination: "Belo Horizonte, MG",     distanceKm: 442 },
        { origin: "São Paulo, SP",        destination: "Vitória, ES",            distanceKm: 882 },
        { origin: "Rio de Janeiro, RJ",   destination: "Vitória, ES",            distanceKm: 521 },

        // REGIÃO SUDESTE — Rotas regionais importantes
        { origin: "São Paulo, SP",        destination: "Campinas, SP",           distanceKm: 95 },
        { origin: "São Paulo, SP",        destination: "Santos, SP",             distanceKm: 72 },
        { origin: "São Paulo, SP",        destination: "São José dos Campos, SP", distanceKm: 97 },
        { origin: "São Paulo, SP",        destination: "Ribeirão Preto, SP",     distanceKm: 313 },
        { origin: "Rio de Janeiro, RJ",   destination: "Niterói, RJ",            distanceKm: 13 },
        { origin: "Rio de Janeiro, RJ",   destination: "Petrópolis, RJ",         distanceKm: 68 },
        { origin: "Belo Horizonte, MG",   destination: "Ouro Preto, MG",         distanceKm: 100 },
        { origin: "Belo Horizonte, MG",   destination: "Uberlândia, MG",         distanceKm: 556 },

        // =============================================
        // CONEXÕES COM BRASÍLIA (Centro-Oeste)
        // =============================================
        { origin: "São Paulo, SP",        destination: "Brasília, DF",           distanceKm: 1015 },
        { origin: "Rio de Janeiro, RJ",   destination: "Brasília, DF",           distanceKm: 1148 },
        { origin: "Belo Horizonte, MG",   destination: "Brasília, DF",           distanceKm: 716 },
        { origin: "Brasília, DF",         destination: "Goiânia, GO",            distanceKm: 209 },
        { origin: "Brasília, DF",         destination: "Cuiabá, MT",             distanceKm: 1133 },
        { origin: "Brasília, DF",         destination: "Campo Grande, MS",       distanceKm: 1134 },

        // =============================================
        // REGIÃO SUL — Conexões entre capitais
        // =============================================
        { origin: "São Paulo, SP",        destination: "Curitiba, PR",           distanceKm: 408 },
        { origin: "Curitiba, PR",         destination: "Florianópolis, SC",      distanceKm: 300 },
        { origin: "Florianópolis, SC",    destination: "Porto Alegre, RS",       distanceKm: 476 },
        { origin: "Curitiba, PR",         destination: "Porto Alegre, RS",       distanceKm: 711 },

        // REGIÃO SUL — Rotas regionais
        { origin: "Curitiba, PR",         destination: "Londrina, PR",           distanceKm: 381 },
        { origin: "Porto Alegre, RS",     destination: "Gramado, RS",            distanceKm: 115 },
        { origin: "Florianópolis, SC",    destination: "Balneário Camboriú, SC", distanceKm: 80 },

        // =============================================
        // REGIÃO NORDESTE — Conexões entre capitais
        // =============================================
        { origin: "Salvador, BA",         destination: "Recife, PE",             distanceKm: 839 },
        { origin: "Recife, PE",           destination: "João Pessoa, PB",        distanceKm: 120 },
        { origin: "Recife, PE",           destination: "Natal, RN",              distanceKm: 297 },
        { origin: "Salvador, BA",         destination: "Aracaju, SE",            distanceKm: 356 },
        { origin: "Recife, PE",           destination: "Maceió, AL",             distanceKm: 285 },
        { origin: "Natal, RN",            destination: "Fortaleza, CE",          distanceKm: 537 },
        { origin: "Fortaleza, CE",        destination: "Teresina, PI",           distanceKm: 634 },
        { origin: "Teresina, PI",         destination: "São Luís, MA",           distanceKm: 446 },

        // NORDESTE — Conexões com Sudeste
        { origin: "São Paulo, SP",        destination: "Salvador, BA",           distanceKm: 1962 },
        { origin: "Belo Horizonte, MG",   destination: "Salvador, BA",           distanceKm: 1372 },
        { origin: "Rio de Janeiro, RJ",   destination: "Salvador, BA",           distanceKm: 1649 },

        // =============================================
        // REGIÃO NORTE
        // =============================================
        { origin: "São Luís, MA",         destination: "Belém, PA",              distanceKm: 806 },
        { origin: "Belém, PA",            destination: "Manaus, AM",             distanceKm: 5298 },
        { origin: "Brasília, DF",         destination: "Palmas, TO",             distanceKm: 973 },
        { origin: "Belém, PA",            destination: "Macapá, AP",             distanceKm: 329 },

    ],

    /**
     * Retorna todas as cidades cadastradas no banco de dados.
     *
     * Lógica:
     *  1. Percorre todas as rotas extraindo origens e destinos
     *  2. Usa Set para eliminar duplicatas
     *  3. Converte para array e ordena alfabeticamente
     *
     * @returns {string[]} Array de nomes de cidades ordenado (A-Z)
     */
    getAllCities: function () {
        // Usa Set para garantir unicidade dos nomes
        var citiesSet = new Set();

        this.routes.forEach(function (route) {
            citiesSet.add(route.origin);
            citiesSet.add(route.destination);
        });

        // Converte Set → Array e ordena alfabeticamente
        return Array.from(citiesSet).sort();
    },

    /**
     * Encontra a distância entre duas cidades.
     *
     * Lógica:
     *  - A busca é BIDIRECIONAL: "A → B" e "B → A" retornam o mesmo resultado
     *  - Os inputs são normalizados (trim + lowercase) antes da comparação
     *  - Os nomes no banco também são normalizados para garantir match
     *
     * @param {string} origin      - Nome da cidade de origem
     * @param {string} destination - Nome da cidade de destino
     * @returns {number|null}      - Distância em km, ou null se não encontrada
     */
    findDistance: function (origin, destination) {
        // Normaliza os inputs: remove espaços e converte para minúsculo
        var normalizedOrigin = origin.trim().toLowerCase();
        var normalizedDestination = destination.trim().toLowerCase();

        // Busca bidirecional: tenta encontrar A→B ou B→A
        var route = this.routes.find(function (r) {
            var rOrigin = r.origin.trim().toLowerCase();
            var rDestination = r.destination.trim().toLowerCase();

            return (
                (rOrigin === normalizedOrigin && rDestination === normalizedDestination) ||
                (rOrigin === normalizedDestination && rDestination === normalizedOrigin)
            );
        });

        // Retorna a distância se encontrou, ou null caso contrário
        return route ? route.distanceKm : null;
    }
};
