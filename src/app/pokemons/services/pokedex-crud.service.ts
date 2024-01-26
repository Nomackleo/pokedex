import { Injectable } from '@angular/core';
import { PokemonDetails } from '../models';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokedexCrudService {
  private pokedex: PokemonDetails[] = [];
  private resetFavorites = new Subject<void>();
  private pokedexCountSubject = new BehaviorSubject<number>(0);

  private readonly POKEDEX_KEY = 'pokedex';
  private readonly MAX_POKEMONS_IN_POKEDEX = 6;
  /** Constructor del servicio. Carga el Pokedex desde el almacenamiento local y actualiza el BehaviorSubject. */
  constructor() {
    this.loadPokedexFromLocalStorage();
    this.pokedexCountSubject.next(this.pokedex.length);
  }
  /** Carga el Pokedex desde el almacenamiento local. */
  private loadPokedexFromLocalStorage(): void {
    const pokedexString = localStorage.getItem(this.POKEDEX_KEY);
    this.pokedex = pokedexString ? JSON.parse(pokedexString) : [];
  }
  /** Guarda el Pokedex en el almacenamiento local. */
  private savePokedexToLocalStorage(): void {
    localStorage.setItem(this.POKEDEX_KEY, JSON.stringify(this.pokedex));
  }
  /** Obtiene los IDs de los Pokémon favoritos en el Pokedex. */
  getFavoritePokemonIds(): string[] {
    return this.pokedex.map((pokemon) => pokemon.id.toString());
  }
  /** Obtiene los Pokémon en el Pokedex. */
  getPokedex(): PokemonDetails[] {
    return this.pokedex;
  }
  /** Obtiene un Observable que emite la cantidad actual de Pokémon en el Pokedex. */
  getPokedexCountObservable(): Observable<number> {
    return this.pokedexCountSubject.asObservable();
  }
  /**
   * Agrega un Pokémon al Pokedex si no está lleno y aún no se ha agregado.
   * @param pokemon - Pokémon a agregar.
   * @returns `true` si se agregó correctamente, `false` si el Pokedex está lleno o el Pokémon ya está en el Pokedex.
   */
  setFavoritePokemon(pokemon: PokemonDetails): boolean {
    const pokemonId = pokemon.id.toString();

    // Verifica si el Pokémon ya está en el Pokedex.
    if (this.isFavoritePokemon(pokemonId)) {
      console.log('Pokemon in Pokedex:', pokemonId);
      console.log('Está en el pokedex:', this.isFavoritePokemon);

      console.warn(`Pokemon Already Added: ${pokemon.name}`);
      return false;
    }

    // Verifica si el Pokedex está lleno.
    if (this.pokedex.length < this.MAX_POKEMONS_IN_POKEDEX) {
      this.pokedex.push(pokemon);
      this.savePokedexToLocalStorage();
      this.resetFavorites.next();
      this.pokedexCountSubject.next(this.pokedex.length);
      console.log(`Pokemon Added: ${pokemon.name}`);
      return true;
    } else {
      console.warn('Pokedex is Full. Cannot Add More Pokemon.');
      return false;
    }
  }
  /**
   * Remueve un Pokémon del Pokedex por su ID.
   * @param id identificador del Pokémon a remover.
   */
  removeFavoritePokemon(id: number): void {
    const index = this.pokedex.findIndex((pokemon) => pokemon.id === id);

    if (index !== -1) {
      this.pokedex.splice(index, 1);
      this.savePokedexToLocalStorage();
      this.resetFavorites.next();
      this.pokedexCountSubject.next(this.pokedex.length);
    }
  }
  /**
   * Verifica si un Pokémon con el ID dado está en el Pokedex
   * @param pokemonId Identificador del Pokémon.
   * @returns retorna 'true' si el Pokémnos está en el pokedex y 'false' sino.
   */
  isFavoritePokemon(pokemonId: string): boolean {
    return this.pokedex.some((pokemon) => pokemon.id.toString() === pokemonId);
  }
  /** Obtiene un Observable que emite eventos cuando se reinician los favoritos. */
  getResetFavorites(): Observable<void> {
    return this.resetFavorites.asObservable();
  }
}
