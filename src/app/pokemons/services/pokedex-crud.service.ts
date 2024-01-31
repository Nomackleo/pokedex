import { Injectable } from '@angular/core';
import { PokemonDetails } from '../models';
import { BehaviorSubject, Observable, Subject, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokedexCrudService {
  private pokedexSubject = new BehaviorSubject<PokemonDetails[]>([]);
  private uploadFavorites = new Subject<boolean>();
  private pokedexCountSubject = new BehaviorSubject<number>(0);

  private readonly POKEDEX_KEY = 'pokedex';
  private readonly MAX_POKEMONS_IN_POKEDEX = 6;
  /** Constructor del servicio. Carga el Pokedex desde el almacenamiento local y actualiza el BehaviorSubject. */
  constructor() {
    this.loadPokedexFromLocalStorage();
    this.pokedexCountSubject.next(this.pokedexSubject.value.length);
  }
  /** Carga el Pokedex desde el almacenamiento local. */
  private loadPokedexFromLocalStorage(): void {
    const pokedexString = localStorage.getItem(this.POKEDEX_KEY);
    const pokedexData = pokedexString ? JSON.parse(pokedexString) : [];
    this.pokedexSubject.next(pokedexData);
  }
  /** Guarda el Pokedex en el almacenamiento local. */
  private savePokedexToLocalStorage(): void {
    localStorage.setItem(
      this.POKEDEX_KEY,
      JSON.stringify(this.pokedexSubject.value)
    );
  }

  /** Obtiene los Pokémon en el Pokedex. */
  getPokedex$(): Observable<PokemonDetails[]> {
    return this.pokedexSubject.asObservable();
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
      pokedex: this.pokedexSubject.value,
      timestamp: new Date().getMilliseconds(),
    });

    const pokemonId = pokemon.id.toString();

    // Verifica si el Pokémon ya está en el Pokedex.
    if (this.isFavoritePokemon(pokemonId)) {
      // this.uploadFavorites.next(false);
      console.warn(`Pokemon Already Added: ${pokemon.name}`, {
        pokedex: this.pokedexSubject.value,
        pokemonId,
        timestamp: new Date().getMilliseconds(),
      });
      return false;
    }

    // Verifica si el Pokedex está lleno.
    if (this.pokedexSubject.value.length < this.MAX_POKEMONS_IN_POKEDEX) {
      this.pokedexSubject.next([...this.pokedexSubject.value, pokemon]);
      this.savePokedexToLocalStorage();
      this.uploadFavorites.next(true);
      this.pokedexCountSubject.next(this.pokedexSubject.value.length);
      console.log(`Pokemon Added: ${pokemon.name}`, {
        pokemonId,
        pokedex: this.pokedexSubject.value,
        timestamp: new Date().getMilliseconds(),
      });
      return true;
    } else {
      this.uploadFavorites.next(false);
      console.warn('Pokedex is Full. Cannot Add More Pokemon.', {
        pokedex: this.pokedexSubject.value,
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
    const index = this.pokedexSubject.value.findIndex(
      (pokemon) => pokemon.id === id
    );

    if (index !== -1) {
      const removedPokemon = this.pokedexSubject.value[index];
      const updatePokedex = [...this.pokedexSubject.value];
      updatePokedex.splice(index, 1);
      this.pokedexSubject.next(updatePokedex);
      this.savePokedexToLocalStorage();
      this.isFavoritePokemon(removedPokemon.id.toString());
      this.uploadFavorites.next(false);
      this.pokedexCountSubject.next(updatePokedex.length);
      console.log('removeFavoritePokemon', {
        removedPokemonId: id,
        remainingPokemons: updatePokedex.length,
        pokemonsInPokedex: updatePokedex,
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
    return this.pokedexSubject.value.some(
      (pokemon) => pokemon.id.toString() === pokemonId
    );
  }
  /** Obtiene un Observable que emite eventos cuando se reinician los pokemons favoritos. */
  getResetFavorites(): Observable<boolean> {
    return this.uploadFavorites.asObservable();
  }
}
