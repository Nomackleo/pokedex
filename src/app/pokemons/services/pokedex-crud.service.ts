import { Injectable, computed, signal } from '@angular/core';
import { PokemonDetails } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PokedexCrudService {
  private readonly POKEDEX_KEY = 'pokedex';
  private readonly MAX_POKEMONS_IN_POKEDEX = 6;

  pokedex = signal<PokemonDetails[]>([]);
  pokedexCount = computed(() => this.pokedex().length);

  constructor() {
    this.loadPokedexFromLocalStorage();
  }

  private loadPokedexFromLocalStorage(): void {
    const pokedexString = localStorage.getItem(this.POKEDEX_KEY);
    const pokedexData = pokedexString ? JSON.parse(pokedexString) : [];
    this.pokedex.set(pokedexData);
  }

  private savePokedexToLocalStorage(): void {
    localStorage.setItem(this.POKEDEX_KEY, JSON.stringify(this.pokedex()));
  }

  setFavoritePokemon(pokemon: PokemonDetails): boolean {
    const pokemonId = pokemon.id.toString();

    if (this.isFavoritePokemon(pokemonId)) {
      console.warn(`Pokemon Already Added: ${pokemon.name}`);
      return false;
    }

    if (this.pokedex().length < this.MAX_POKEMONS_IN_POKEDEX) {
      this.pokedex.update(pokedex => [...pokedex, pokemon]);
      this.savePokedexToLocalStorage();
      console.log(`Pokemon Added: ${pokemon.name}`);
      return true;
    } else {
      console.warn('Pokedex is Full. Cannot Add More Pokemon.');
      return false;
    }
  }

  removeFavoritePokemon(id: number): void {
    const index = this.pokedex().findIndex((pokemon) => pokemon.id === id);

    if (index !== -1) {
      this.pokedex.update(pokedex => {
        pokedex.splice(index, 1);
        return [...pokedex];
      });
      this.savePokedexToLocalStorage();
      console.log('removeFavoritePokemon', { removedPokemonId: id });
    }
  }

  isFavoritePokemon(pokemonId: string): boolean {
    return this.pokedex().some((pokemon) => pokemon.id.toString() === pokemonId);
  }
}
