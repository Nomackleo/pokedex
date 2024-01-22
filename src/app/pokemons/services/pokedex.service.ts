import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { FecthPokemon, Pokemon } from '../models/pokemons.interfaces';
import { Observable, map } from 'rxjs';
import { PokemonDetails } from '../models/pokemonDetails.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PokedexService {
  private http = inject(HttpClient);

  private baseUrl: string = environment.baseUrl;

  constructor() {}

  getPokemons$(): Observable<Pokemon[]> {
    const url: string = `${this.baseUrl}/pokemon?limit=1500`;

    return this.http.get<FecthPokemon>(url).pipe(map(this.showAPokemon));
  }

  getPokemonDetails$(name: string): Observable<PokemonDetails> {
    const url: string = `${this.baseUrl}/pokemon/${name}`;
    return this.http.get<PokemonDetails>(url).pipe(
      map((data) => ({
        ...data,
        pic: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
      }))
    );
  }

  private showAPokemon(resp: FecthPokemon): Pokemon[] {
    const pokemonList: Pokemon[] = resp.results.map((poke) => {
      const urlArr = poke.url.split('/');
      const id = urlArr[6];
      const pic = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

      // console.log(urlArr);

      return {
        id,
        pic,
        name: poke.name,
      };
    });

    return pokemonList;
  }

  // create(pokemon: Pokemon) {
  //   console.log(`create method od service: ${pokemon}`);
  //   return addDoc(this.pokemonCollection, pokemon);
  // }

  // update(pokemon: Pokemon) {
  //   const pokemonDocumentRef = doc(this.firestore, `pokemon/${pokemon.id}`);
  //   return updateDoc(pokemonDocumentRef, { ...pokemon });
  // }

  // delete(id: string) {
  //   const pokemonDocumentRef = doc(this.firestore, `pokemon/${id}`);
  //   return deleteDoc(pokemonDocumentRef)
  // }
}
