import { Component, inject } from '@angular/core';
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
import { MessageSnackbarData, Pokemon, PokemonDetails } from '../../models';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CardPokemonDetailsComponent } from '../../components/card-pokemon-details/card-pokemon-details.component';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { MessageSnackbarService } from '../../services/message-snackbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent {
  readonly pokedexAllPokemons = inject(PokedexService);
  readonly pokedex = inject(PokedexCrudService);
  readonly dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private message = inject(MessageSnackbarService);

  pageSize!: number;
  allPokemon$!: Observable<Pokemon[]>;
  selectedPokemon: PokemonDetails[] = [];
  pokemonDetails!: PokemonDetails;
  destroyed$ = new Subject<void>();
  dataSource!: MatTableDataSource<Pokemon>;

  ngOnInit(): void {
    this.allPokemon$ = this.pokedexAllPokemons.getPokemons$();
    this.pokedexAllPokemons
      .getPokemonDetailsObservable$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((pokemon) => {
        pokemon !== null
          ? (this.pokemonDetails = pokemon)
          : console.log('No se ha seleccionado un ppokméon');
      });
    this.pageSize = 10;
    this.allPokemon$
      .pipe(
        map((pokemons) => {
          this.dataSource = new MatTableDataSource<Pokemon>();
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
/**
   * Método para agregar un Pokémon al Pokedex.
   */
  add() {
    this.pokedexAllPokemons
      .getPokemonDetailsObservable$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((pokemon) => {
        pokemon !== null
          ? this.addToPokedex(pokemon)
          : console.error('El pokemon es null');

        console.log('Pokemon seleccionado desde list:', pokemon);
      });
  }
/**
   * Método para agregar un Pokémon al Pokedex y mostrar mensajes.
   * @param pokemon @param pokemon - Pokémon a agregar al Pokedex.
   */
  addToPokedex(pokemon: PokemonDetails) {
    const added = this.pokedex.setFavoritePokemon(pokemon);
    console.log('Is favorite?', added);

    if (added) {
      const succesData: MessageSnackbarData = {
        title: 'Pokedex',
        body: `El Pokémon ${pokemon.name} fue agregado a tu pokedex`,
        panelClass: 'success',
      };
      this.message.showSnackBar(this.snackbar, succesData);
      console.log('Pokemon added to Pokedex:', pokemon);
      this.updatePokedexStatus(pokemon.id, true);
    } else {
      const errorData: MessageSnackbarData = {
        title: 'Ooops',
        body: 'El Pokedex está lleno. No se pueden agregar más Pokémon.',
        suggestion:
          'Considera remover un Pokémon antes de intentar agregar otro.',
        panelClass: 'warning',
      };
      this.message.showSnackBar(this.snackbar, errorData);
      console.log('Pokedex is full. Cannot add more Pokemon.');
    }
  }
  /**
   * Método para remover un Pokémon del Pokedex.
   */
  remove() {
    this.pokedexAllPokemons
      .getPokemonDetailsObservable$()
      .subscribe((pokemon) => {
        pokemon != null
          ? this.removeFromPokedex(pokemon)
          : console.error('Error remove');
      });
  }
  /**
   * Método para remover un Pokémon del Pokedex y mostrar mensajes.
   * @param pokemon - Pokémon a remover del Pokedex.
   */
  removeFromPokedex(pokemon: PokemonDetails): void {
    const isInPokedex = this.pokedex.isFavoritePokemon(pokemon.id.toString());

    if (isInPokedex) {
      this.pokedex.removeFavoritePokemon(pokemon.id);
      const successData: MessageSnackbarData = {
        title: '¡Removido!',
        body: `El Pokémon ${pokemon.name} fue removido de tu Pokedex.`,
        suggestion: 'Puedes agregar otro Pokémon a tu Pokedex.',
        panelClass: 'warning',
      };
      this.message.showSnackBar(this.snackbar, successData);
      console.log('Pokemon removed from Pokedex:', pokemon);
      // this.updatePokedexStatus(pokemon.id, false);
    } else {
      console.log('Pokemon not in Pokedex. Cannot remove.');
    }
  }
  /**
   * Método para actualizar el estado de un Pokémon en la tabla.
   * @param pokemonId - ID del Pokémon a actualizar.
   * @param inPokedex - Estado del Pokémon en el Pokedex.
   */
  updatePokedexStatus(pokemonId: number, inPokedex: boolean): void {
    const foundPokemon = this.dataSource.data.find(
      (pokemon) => Number(pokemon.id) === +pokemonId
    );

    if (foundPokemon) {
      foundPokemon.inPokedex = inPokedex;
      this.dataSource.data = [...this.dataSource.data];
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
