import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, take, tap } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { FecthPokemon, Pokemon } from '../models/pokemons.interfaces';
import { PokemonDetails } from '../models/pokemonDetails.interfaces';
import { PokedexCrudService } from './pokedex-crud.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Data access layer for Pokédex resources.
 * Serves signals consumed by components to minimize change detection work.
 */
export class PokedexService {
  private readonly http = inject(HttpClient);
  private readonly pokedex = inject(PokedexCrudService);

  private readonly baseUrl = environment.baseUrl;
  private readonly pokemonCache = new Map<string, PokemonDetails>();

  private readonly pokemonsSignal = signal<Pokemon[]>([]);
  private readonly loadingSignal = signal(false);

  /** Signal with the full Pokémon collection once loaded. */
  readonly pokemons = computed(() => this.pokemonsSignal());
  /** Loading state used by the UI (ISO 25010 - eficiencia de desempeño). */
  readonly loading = computed(() => this.loadingSignal());
  /** Favourite lookup set reused across components. */
  readonly pokedexIds = computed(() => this.pokedex.pokedexIds());
  /** Details signal reused by dialogs for the latest retrieved Pokémon. */
  readonly pokemonDetails = signal<PokemonDetails | null>(null);

  /**
   * Ensures the list of Pokémon is fetched once and cached.
   * (Plan de Optimización Etapa 3 – Signals para eficiencia ISO 25010).
   * @param limit máximo de resultados a solicitar (por defecto 250).
   * @param force obliga la recarga, ignorando datos cacheados.
   */
  loadPokemons(limit = 250, force = false): void {
    if (this.pokemonsSignal().length && !force) {
      return;
    }

    const url = `${this.baseUrl}/pokemon?limit=${limit}`;
    this.loadingSignal.set(true);

    this.http
      .get<FecthPokemon>(url)
      .pipe(
        take(1),
        map((response) => this.mapPokemons(response)),
        tap((pokemons) => this.pokemonsSignal.set(pokemons)),
        catchError((error) => {
          console.error('PokedexService: failed to load pokemons', error);
          this.pokemonsSignal.set([]);
          return of<Pokemon[]>([]);
        }),
        finalize(() => this.loadingSignal.set(false)),
      )
      .subscribe();
  }

  /**
   * Obtiene los detalles de un Pokémon reutilizando cache en memoria.
   * Documentado en la especificación viva para evitar Long Tasks repetitivas.
   */
  getPokemonDetails$(name: string): Observable<PokemonDetails | null> {
    const cached = this.pokemonCache.get(name);
    if (cached) {
      this.pokemonDetails.set(cached);
      return of(cached);
    }

    const url = `${this.baseUrl}/pokemon/${name}`;
    return this.http.get<PokemonDetails>(url).pipe(
      take(1),
      map((data) => ({
        ...data,
        pic: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
      })),
      tap((pokemon) => {
        this.pokemonCache.set(name, pokemon);
        this.pokemonDetails.set(pokemon);
      }),
      catchError((error) => {
        console.error('PokedexService: failed to load pokemon details', error);
        return of(null);
      }),
    );
  }

  private mapPokemons(resp: FecthPokemon): Pokemon[] {
    return resp.results.map((poke) => {
      const urlArr = poke.url.split('/');
      const id = urlArr[6];
      const pic = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

      return {
        id,
        pic,
        name: poke.name,
      };
    });
  }
}
