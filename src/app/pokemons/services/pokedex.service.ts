import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { FecthPokemon, Pokemon } from '../models/pokemons.interfaces';
import { BehaviorSubject, Observable, Subject, catchError, forkJoin, map, of } from 'rxjs';
import { PokemonDetails } from '../models/pokemonDetails.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PokedexService {
  private http = inject(HttpClient);

  private baseUrl: string = environment.baseUrl;
  // Crear un Subject para emitir los detalles del Pokemon
  public pokemonDetailsSubject = new BehaviorSubject<PokemonDetails | null>(null);

  getPokemons$(): Observable<Pokemon[]> {
    const url: string = `${this.baseUrl}/pokemon?limit=1500`;

    return this.http.get<FecthPokemon>(url).pipe(map(this.showAPokemon));
  }
  /**
   * Obtener un observable que emite los detalles del Pokémon cuando se obtienen.
   * @param name Nombre del Pokémon
   * @returns Observable que emite los detalles del Pokémon
   */
  getPokemonDetailsObservable$(): Observable<PokemonDetails | null> {
    return this.pokemonDetailsSubject.asObservable();
  }

  getPokemonDetails$(name: string): Observable<PokemonDetails> {
    const url: string = `${this.baseUrl}/pokemon/${name}`;
    return this.http.get<PokemonDetails>(url).pipe(
      map((data) => ({
        ...data,
        pic: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
      })),
    );
  }

  private showAPokemon(resp: FecthPokemon): Pokemon[] {
    const pokemonList: Pokemon[] = resp.results.map((poke) => {
      const urlArr = poke.url.split('/');
      const id = urlArr[6];
      const pic = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

      return {
        id,
        pic,
        name: poke.name,
      };
    });

    return pokemonList;
  }
}
