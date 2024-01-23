import { Injectable } from '@angular/core';
import { PokemonDetails } from '../models';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokedexCrudService {
  private pokedex: PokemonDetails[] = [];
  private resetFavorites = new Subject<void>();

  private readonly POKEDEX_KEY = 'pokedex';
  private readonly MAX_POKEMONS_IN_POKEDEX = 6;

  constructor() {
    this.loadPokedexFromLocalStorage();
  }

  private loadPokedexFromLocalStorage(): void {
    const pokedexString = localStorage.getItem(this.POKEDEX_KEY);
    this.pokedex = pokedexString ? JSON.parse(pokedexString) : [];
  }

  private savePokedexToLocalStorage(): void {
    localStorage.setItem(this.POKEDEX_KEY, JSON.stringify(this.pokedex));
  }

  getFavoritePokemonIds(): string[] {
    return this.pokedex.map((pokemon) => pokemon.id.toString());
  }

  getPokedex(): PokemonDetails[] {
    return this.pokedex;
  }

  setFavoritePokemon(pokemon: PokemonDetails): boolean {
    const pokemonId = pokemon.id.toString();

    // Check if the Pokemon is already in the Pokedex
    if (this.isFavoritePokemon(pokemonId)) {
      console.warn(`Pokemon Already Added: ${pokemon.name}`);
      return false;
    }

    // Check if the Pokedex is full
    if (this.pokedex.length < this.MAX_POKEMONS_IN_POKEDEX) {
      this.pokedex.push(pokemon);
      this.savePokedexToLocalStorage();
      this.resetFavorites.next();
      console.log(`Pokemon Added: ${pokemon.name}`);
      return true;
    } else {
      console.warn('Pokedex is Full. Cannot Add More Pokemon.');
      return false;
    }
  }
  removeFavoritePokemon(id: number): void {
    const index = this.pokedex.findIndex((pokemon) => pokemon.id === id);

    if (index !== -1) {
      this.pokedex.splice(index, 1);
      this.savePokedexToLocalStorage();
      this.resetFavorites.next();
    }
  }

  isFavoritePokemon(pokemonId: string): boolean {
    return this.pokedex.some((pokemon) => pokemon.id.toString() === pokemonId);
  }

  getResetFavorites(): Observable<void> {
    return this.resetFavorites.asObservable();
  }
}
