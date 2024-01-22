import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { PokedexService } from '../../services/pokedex.service';
import {
  Observable,
  Subject,
  catchError,
  map,
  of,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { Pokemon, PokemonDetails } from '../../models';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CardPokemonDetailsComponent } from '../../components/card-pokemon-details/card-pokemon-details.component';
import { PokedexComponent } from '../pokedex/pokedex.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  readonly pokedex = inject(PokedexService);
  readonly dialog = inject(MatDialog);

  allPokemon$!: Observable<Pokemon[]>;
  selectedPokemon: PokemonDetails[] = [];
  destroyed$ = new Subject<void>();
  dataSource!: MatTableDataSource<Pokemon>;

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

  // selectPokemon(pokemon: Pokemon) {
  //   this.selectedPokemon = [];
  //   this.pokedex
  //     .getPokemonDetails$(pokemon.name)
  //     .pipe(
  //       map(
  //         (details) => {
  //           const pokemonDetails: PokemonDetails = {
  //             pic: details.pic,
  //             base_experience: details.base_experience,
  //             height: details.height,
  //             id: details.id,
  //             name: details.name,
  //             order: details.order,
  //             weight: details.weight,
  //             species: details.species,
  //             stats: details.stats,
  //             types: details.types,
  //           };
  //           this.selectedPokemon.push(pokemonDetails);
  //           console.log('selectedPokemon', this.selectedPokemon);
  //           console.log('on', pokemonDetails);
  //           this.openDetails(pokemonDetails);
  //         },
  //         (err: Error) => {
  //           console.log(err);
  //         }
  //       )
  //     )
  //     .subscribe();
  // }

  selectPokemon(pokemon: Pokemon) {
    this.selectedPokemon = [];
    this.pokedex
      .getPokemonDetails$(pokemon.name)
      .pipe(
        tap(
          (details) => {
            const pokemonDetails: PokemonDetails = {
              ...details,
              stats: [...details.stats], // Copiar la matriz de estadísticas
              types: [...details.types], // Copiar la matriz de tiposF
            };
            console.log('on', pokemonDetails);
            this.selectedPokemon.push(pokemonDetails);
            console.log('array', this.selectedPokemon);
            this.openDetails(this.selectedPokemon[0]);
          },
          catchError((err: Error) => {
            console.error('Error fetching Pokemon details', err);
            return of(null);
          })
        ),
        take(1)
      )
      .subscribe();
  }
  openDetails(pokemonDetails: PokemonDetails) {
    console.log('pokemon', this.selectedPokemon[0]);
    console.log('pokemonDetails', pokemonDetails);
    const dialogRef = this.dialog.open(CardPokemonDetailsComponent, {
      data: pokemonDetails,
      width: '400px',
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        console.log('Dialog closed');
        console.log('close', pokemonDetails);
      });
    console.log('open');
  }

  deletePokemon() {}

  updatePokemon() {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
