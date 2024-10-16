const form = document.getElementById('searchForm');
const input = document.getElementById('pokemonInput');
const pokemonList = document.getElementById('pokemonList');

async function loadAllPokemon(limit = 150) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
      const data = await response.json();
      const pokemonPromises = data.results.map(pokemon => fetchPokemon(pokemon.url));
      const pokemonArray = await Promise.all(pokemonPromises);
      displayPokemonList(pokemonArray);
    } catch (error) {
      console.error("Error al cargar la lista de Pokémon:", error);
    }
  }
  

// Obtener datos de un Pokémon específico
async function getPokemonData(pokemon) {
  try {
    const data = await fetchPokemon(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`);
    displayPokemonList([data]); // Mostrar el Pokémon encontrado
  } catch (error) {
    alert('Pokémon no encontrado'); // Mensaje de error si no se encuentra
    console.error(error);
  }
}

async function fetchPokemon(url) {
    const cachedPokemon = localStorage.getItem(url);
    if (cachedPokemon) {
      return JSON.parse(cachedPokemon); // Devuelve los datos del caché si existen
    }
  
    const response = await fetch(url);
    const data = await response.json();
  
    // Almacenar en localStorage con la URL como clave
    try {
      localStorage.setItem(url, JSON.stringify(data));
      clearOldPokemon(); // Limpia el caché si es necesario
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('No se pudo almacenar el Pokémon: QuotaExceededError. Limpiando almacenamiento...');
        // Aquí podrías limpiar todo el localStorage o una parte de él
        localStorage.clear(); // O implementar una limpieza más controlada
      }
    }
  
    return data;
  }
  
function clearOldPokemon(limit = 100) {
    const keys = Object.keys(localStorage);
    if (keys.length > limit) {
      for (let i = 0; i < keys.length - limit; i++) {
        localStorage.removeItem(keys[i]);
      }
    }
  }

// Función para mostrar la lista de Pokémon en el contenedor
function displayPokemonList(pokemonArray) {
  pokemonList.innerHTML = ''; // Limpiar el contenedor
  pokemonArray.forEach((pokemon) => {
    const pokemonCard = createPokemonCard(pokemon);
    pokemonList.appendChild(pokemonCard);
  });
}
// Crear una tarjeta simple para cada Pokémon
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'card m-2';
    card.style.width = '10rem';
  
    // Validar si el Pokémon tiene una imagen
    const pokemonImage = pokemon.sprites && pokemon.sprites.front_default ? pokemon.sprites.front_default : 'ruta/a/imagen/default.png'; // Usa una imagen por defecto si no hay
  
    // Crear contenido de la tarjeta
    card.innerHTML = `
      <img src="${pokemonImage}" class="card-img-top" alt="${pokemon.name}">
      <div class="card-body">
        <h5 class="card-title">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h5>
        <p class="card-text">${pokemon.types.map(type => type.type.name).join(', ')}</p>
      </div>
    `;
  
    // Evento para abrir el modal al hacer clic en la tarjeta
    card.addEventListener('click', () => showPokemonDetails(pokemon));
  
    return card;
  }
  

// Mostrar detalles en el modal
async function showPokemonDetails(pokemon) {
  const modalTitle = document.getElementById('pokemonModalLabel');
  const modalImg = document.getElementById('modalPokemonImg');
  const modalInfo = document.getElementById('modalPokemonInfo');
  const pokemonMoves = document.getElementById('pokemonMoves');

  modalTitle.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  modalImg.src = pokemon.sprites.front_default;
  modalInfo.textContent = `Peso: ${pokemon.weight} | Altura: ${pokemon.height}`;

  // Obtener movimientos
  pokemonMoves.innerHTML = ''; // Limpiar lista de movimientos
  for (const move of pokemon.moves.slice(0, 5)) { // Limitar a los primeros 5 movimientos
    const li = document.createElement('li');
    li.textContent = move.move.name;
    pokemonMoves.appendChild(li);
  }

  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
  modal.show();
}

// Manejar el evento del formulario para buscar un Pokémon específico
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const pokemon = input.value.trim();
  if (pokemon) getPokemonData(pokemon);
});

// Cargar todos los Pokémon al iniciar la página
window.addEventListener('DOMContentLoaded', () => loadAllPokemon());