import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { PokedexService } from '../../services/pokedex.service';
import { Observable, Subject, map } from 'rxjs';
import { Pokemon, PokemonDetails } from '../../models';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  allPokemon$!: Observable<Pokemon[]>;
  selectedPokemon: PokemonDetails[] = [];
  destroyed$ = new Subject<void>();
  dataSource!: MatTableDataSource<Pokemon>;

  readonly pokedex = inject(PokedexService);

  ngOnInit(): void {
    this.allPokemon$ = this.pokedex.getPokemons$();

    this.allPokemon$
      .pipe(
        map((pokemons) => {
          this.dataSource = new MatTableDataSource(pokemons);
        })
      )
      .subscribe();
  }

  selectPokemon(pokemon: Pokemon) {
    this.selectedPokemon = [];
    this.pokedex
      .getPokemonDetails$(pokemon.name)
      .pipe(
        map(
          (details) => {
            console.log(details);
            const pokemonDetails: PokemonDetails = {
              pic: details.pic,
              base_experience: details.base_experience,
              height: details.height,
              id: details.id,
              name: details.name,
              order: details.order,
              weight: details.weight,
              species: details.species,
              stats: details.stats,
              types: details.types,
            };
            this.selectedPokemon.push(pokemonDetails);
            console.log('on', pokemonDetails);
          },
          (err: Error) => {
            console.log(err);
          }
        )
      )
      .subscribe();
  }

  deletePokemon() {}

  updatePokemon() {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
