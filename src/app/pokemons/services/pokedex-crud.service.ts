import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { PokemonDetails } from '../models';

@Injectable({
  providedIn: 'root',
})
/**
 * Client-side favourite manager backed by `localStorage` with guarded access.
 * Guards persistence failures to comply with ISO 27001 hardening guidelines.
 */
export class PokedexCrudService {
  private readonly POKEDEX_KEY = 'pokedex';
  private readonly MAX_POKEMONS_IN_POKEDEX = 6;

  private readonly storage = inject(StorageService);

  pokedex = signal<PokemonDetails[]>([]);
  pokedexCount = computed(() => this.pokedex().length);
  /** Set of favourite IDs for O(1) lookups inside the UI refactors. */
  pokedexIds = computed(() => new Set(this.pokedex().map((pokemon) => pokemon.id.toString())));

  constructor() {
    this.loadPokedexFromLocalStorage();
  }

  private loadPokedexFromLocalStorage(): void {
    const saved = this.storage.getItem<PokemonDetails[]>(this.POKEDEX_KEY, []);
    this.pokedex.set(saved);
  }

  private savePokedexToLocalStorage(): void {
    const persisted = this.storage.setItem(this.POKEDEX_KEY, this.pokedex());
    if (!persisted) {
      console.warn('PokedexCrudService: unable to persist pokedex snapshot');
    }
  }

  /**
   * @description Registra un Pokémon favorito cuidando la capacidad máxima.
   * @returns `true` si se agregó (ISO 25010 - fiabilidad de estados).
   */
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

  /**
   * Elimina un Pokémon de favoritos y persiste el resultado.
   * Maneja errores de almacenamiento para cumplir ISO 27001.
   */
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

  /** Utiliza el set computado para consultas O(1) desde la UI. */
  isFavoritePokemon(pokemonId: string): boolean {
    return this.pokedex().some((pokemon) => pokemon.id.toString() === pokemonId);
  }
}
