import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { PokedexService } from '../../services/pokedex.service';
import { Observable, Subject, catchError, map, of, take, tap } from 'rxjs';
import { Pokemon, PokemonDetails } from '../../models';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CardPokemonDetailsComponent } from '../../components/card-pokemon-details/card-pokemon-details.component';
import { PokedexCrudService } from '../../services/pokedex-crud.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  readonly pokedexAllPokemons = inject(PokedexService);
  readonly pokedex = inject(PokedexCrudService);
  readonly dialog = inject(MatDialog);

  allPokemon$!: Observable<Pokemon[]>;
  selectedPokemon: PokemonDetails[] = [];
  pokemonDetails!: PokemonDetails;
  destroyed$ = new Subject<void>();
  dataSource!: MatTableDataSource<Pokemon>;
  paginator!: MatPaginator;

  ngOnInit(): void {
    this.allPokemon$ = this.pokedexAllPokemons.getPokemons$();

    this.allPokemon$
      .pipe(
        map((pokemons) => {
          this.dataSource = new MatTableDataSource<Pokemon>();
          this.dataSource.paginator = this.paginator;
          this.dataSource.data = pokemons;
          this.checkPokedexStatus();
          return pokemons;
        })
      )
      .subscribe();
  }
  /**
   * Método para verificar el estado del Pokedex y actualizar los Pokémon en la tabla.
   */
  checkPokedexStatus() {
    const pokedexData = this.pokedex.getPokedex();
    if (pokedexData.length > 0) {
      this.dataSource.data.forEach((pokemon) => {
        pokemon.inPokedex = this.pokedex.isFavoritePokemon(
          pokemon.id.toString()
        );
      });
    }
  }
  /**
   * Método para seleccionar un Pokémon y mostrar sus detalles.
   * @param pokemon - Pokémon seleccionado.
   */
  selectPokemon(pokemon: Pokemon) {
    this.selectedPokemon = [];
    this.pokedexAllPokemons
      .getPokemonDetails$(pokemon.name)
      .pipe(
        tap(
          (details) => {
            const pokemonDetails: PokemonDetails = {
              ...details,
              stats: [...details.stats],
              types: [...details.types],
            };
            this.selectedPokemon.push(pokemonDetails);
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
  /**
   * Método para enviar la data al componente hijo por medio de dialodRef.
   * @param pokemonDetails - Detalles del Pokémon.
   */
  openDetails(pokemonDetails: PokemonDetails) {
    this.pokemonDetails = pokemonDetails;
    const dialogRef = this.dialog.open(CardPokemonDetailsComponent, {
      data: pokemonDetails,
      width: '400px',
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe();
    this.pokedexAllPokemons.pokemonDetailsSubject.next(pokemonDetails);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
