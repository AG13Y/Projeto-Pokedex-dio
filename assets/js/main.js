const pokemonListEl = document.getElementById('pokemonList');
            const loadMoreButton = document.getElementById('loadMoreButton');
            const listView = document.getElementById('listView');
            const detailView = document.getElementById('detailView');
            const detailContent = document.getElementById('detailContent');

            const maxRecords = 151;
            let limit = 12;
            let offset = 0;
            let chartInstance = null;
            
            function convertPokemonToLi(pokemon) {
                return `
                    <li class="pokemon ${pokemon.type}" data-id="${pokemon.number}">
                        <span class="number">#${String(pokemon.number).padStart(3, '0')}</span>
                        <span class="name">${pokemon.name}</span>
                        <div class="detail">
                            <ol class="types">
                                ${pokemon.types.map((type) => `<li class="type">${type}</li>`).join('')}
                            </ol>
                            <img src="${pokemon.photo}" alt="${pokemon.name}">
                        </div>
                    </li>
                `;
            }

            function loadPokemonItens(offset, limit) {
                pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
                    const newHtml = pokemons.map(convertPokemonToLi).join('');
                    pokemonListEl.innerHTML += newHtml;
                });
            }
            
            function updateDetailView(pokemon) {
                if (chartInstance) {
                    chartInstance.destroy();
                }

                const typeColor = getComputedStyle(document.documentElement).getPropertyValue(`--type-${pokemon.type}`).trim();

                const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
                const statLabels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];
                const statData = statNames.map(name => pokemon.baseStats[name] || 0);

                detailContent.innerHTML = `
                    <div class="p-4 rounded-lg" style="background-color: ${typeColor};">
                        <button id="backButton" class="text-white font-bold mb-4">← Voltar</button>
                        <div class="flex justify-between items-center text-white">
                            <h2 class="text-3xl font-bold capitalize">${pokemon.name}</h2>
                            <span class="text-xl font-bold">#${String(pokemon.number).padStart(3, '0')}</span>
                        </div>
                        <div class="flex justify-center -mt-8">
                            <img class="h-48" src="${pokemon.photo}" alt="${pokemon.name}">
                        </div>
                    </div>
                    <div class="p-4 bg-white -mt-4 rounded-b-lg">
                        <div class="flex justify-center space-x-2 my-2">
                             ${pokemon.types.map(type => `<span class="px-3 py-1 rounded-full text-white text-sm" style="background-color: var(--type-${type});">${type}</span>`).join('')}
                        </div>
                        <h3 class="font-bold text-xl mt-4 mb-2 text-center" style="color: ${typeColor};">Stats</h3>
                        <div class="chart-container">
                            <canvas id="statsChart"></canvas>
                        </div>
                    </div>
                `;
                document.getElementById('backButton').addEventListener('click', showListView);

                const ctx = document.getElementById('statsChart').getContext('2d');
                chartInstance = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: statLabels,
                        datasets: [{
                            label: 'Base Stats',
                            data: statData,
                            backgroundColor: 'rgba(108, 121, 219, 0.2)',
                            borderColor: 'rgba(108, 121, 219, 1)',
                            pointBackgroundColor: 'rgba(108, 121, 219, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(108, 121, 219, 1)'
                        }]
                    },
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                                grid: { color: 'rgba(0, 0, 0, 0.1)' },
                                pointLabels: { font: { size: 12, weight: 'bold' } },
                                suggestedMin: 0,
                                suggestedMax: 150
                            }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            }

            function showListView() {
                window.location.hash = '';
                detailView.classList.add('hidden');
                listView.classList.remove('hidden');
            }

            function showDetailView(pokemonId) {
                if (!pokemonId) return;
                window.location.hash = `pokemon/${pokemonId}`;
                listView.classList.add('hidden');
                detailView.classList.remove('hidden');
                detailContent.innerHTML = `<p class="text-center p-8">Carregando detalhes...</p>`;

                pokeApi.getPokemonById(pokemonId)
                    .then(updateDetailView)
                    .catch(err => {
                        console.error(err);
                        detailContent.innerHTML = `<p class="text-center p-8 text-red-500">Pokémon não encontrado!</p>`;
                    });
            }

            function handleHashChange() {
                const hash = window.location.hash;
                if (hash.startsWith('#pokemon/')) {
                    const pokemonId = hash.substring(9); // '#pokemon/'.length
                    showDetailView(pokemonId);
                } else {
                    showListView();
                }
            }

            // --- EVENT LISTENERS ---
            loadMoreButton.addEventListener('click', () => {
                offset += limit;
                const qtdRecordsWithNexPage = offset + limit;
                if (qtdRecordsWithNexPage >= maxRecords) {
                    const newLimit = maxRecords - offset;
                    loadPokemonItens(offset, newLimit);
                    loadMoreButton.parentElement.removeChild(loadMoreButton);
                } else {
                    loadPokemonItens(offset, limit);
                }
            });

            pokemonListEl.addEventListener('click', (event) => {
                const clickedLi = event.target.closest('.pokemon');
                if (clickedLi) {
                    const pokemonId = clickedLi.dataset.id;
                    showDetailView(pokemonId);
                }
            });
            
            window.addEventListener('hashchange', handleHashChange);

            // --- INITIAL LOAD ---
            if (window.location.hash) {
                handleHashChange();
            } else {
                loadPokemonItens(offset, limit);
            }
        ;