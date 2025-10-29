import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { FecthPokemon, Pokemon } from '../models/pokemons.interfaces';
import { Observable, map, tap } from 'rxjs';
import { PokemonDetails } from '../models/pokemonDetails.interfaces';
import { PokedexCrudService } from './pokedex-crud.service';

@Injectable({
  providedIn: 'root',
})
/**
 * * Servicio que maneja la obtención de datos de https://pokeapi.co/.
 */
export class PokedexService {
  private http = inject(HttpClient);
  private pokedex = inject(PokedexCrudService);

  private baseUrl: string = environment.baseUrl;
  // Crear un Signal para emitir los detalles del Pokemon
  public pokemonDetails = signal<PokemonDetails | null>(null);
  /**
   * Obtiene un observable que emite la lista de Pokémon.
   * @returns Observable que emite la lista de Pokémon.
   */
  getPokemons$(): Observable<Pokemon[]> {
    const url: string = `${this.baseUrl}/pokemon?limit=1500`;

    return this.http.get<FecthPokemon>(url).pipe(map(this.showAPokemon));
  }

  /**
   * Obtiene un observable que emite los detalles de un Pokémon específico y actualiza el signal.
   * @param name - Nombre del Pokémon.
   * @returns Observable que emite los detalles del Pokémon.
   */
  getPokemonDetails$(name: string): Observable<PokemonDetails> {
    const url: string = `${this.baseUrl}/pokemon/${name}`;
    return this.http.get<PokemonDetails>(url).pipe(
      map((data) => ({
        ...data,
        pic: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
      })),
      tap((pokemon) => this.pokemonDetails.set(pokemon))
    );
  }
  /**
   * Mapea la respuesta de la API para mostrar la información relevante de los Pokémon.
   * @param resp - Respuesta de la API.
   * @returns Lista de Pokémon con información simplificada.
   */
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
