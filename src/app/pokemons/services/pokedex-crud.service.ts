import { Injectable } from '@angular/core';
import { PokemonDetails } from '../models';
import { BehaviorSubject, Observable, Subject, timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokedexCrudService {
  private pokedex: PokemonDetails[] = [];
  private uploadFavorites = new Subject<boolean>();
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
    console.log('setFavoritePokemon', {
      pokedex: this.pokedex,
      timestamp: new Date().getMilliseconds(),
    });

    const pokemonId = pokemon.id.toString();

    // Verifica si el Pokémon ya está en el Pokedex.
    if (this.isFavoritePokemon(pokemonId)) {
      this.uploadFavorites.next(false);
      console.warn(`Pokemon Already Added: ${pokemon.name}`, {
        pokedex: this.pokedex,
        pokemonId,
        timestamp: new Date().getMilliseconds(),
      });
      return false;
    }

    // Verifica si el Pokedex está lleno.
    if (this.pokedex.length < this.MAX_POKEMONS_IN_POKEDEX) {
      this.pokedex.push(pokemon);
      this.savePokedexToLocalStorage();
      this.uploadFavorites.next(true);
      this.pokedexCountSubject.next(this.pokedex.length);
      console.log(`Pokemon Added: ${pokemon.name}`, {
        pokemonId,
        pokedex: this.pokedex,
        timestamp: new Date().getMilliseconds(),
      });
      return true;
    } else {
      this.uploadFavorites.next(false);
      console.warn('Pokedex is Full. Cannot Add More Pokemon.', {
        pokedex: this.pokedex,
        timestamp: new Date().getMilliseconds(),
      });
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
      const removedPokemon = this.pokedex[index];
      this.pokedex.splice(index, 1);
      this.savePokedexToLocalStorage();
      this.isFavoritePokemon(removedPokemon.id.toString());
      this.uploadFavorites.next(false);
      this.pokedexCountSubject.next(this.pokedex.length);
      console.log('removeFavoritePokemon', {
        removedPokemonId: id,
        remainingPokemons: this.pokedex.length,
        pokemonsInPokedex: this.pokedex,
        timestamp: new Date().getMilliseconds(),
      });
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
  /** Obtiene un Observable que emite eventos cuando se reinician los pokemons favoritos. */
  getResetFavorites(): Observable<boolean> {
    return this.uploadFavorites.asObservable();
  }
}
