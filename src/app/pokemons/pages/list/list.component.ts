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
  pageSize!: number;
  allPokemon$!: Observable<Pokemon[]>;
  selectedPokemon: PokemonDetails[] = [];
  pokemonDetails!: PokemonDetails;
  destroyed$ = new Subject<void>();
  dataSource!: MatTableDataSource<Pokemon>;

  readonly pokedexAllPokemons = inject(PokedexService);
  readonly pokedex = inject(PokedexCrudService);
  readonly dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private message = inject(MessageSnackbarService);

  ngOnInit(): void {
    this.allPokemon$ = this.pokedexAllPokemons.getPokemons$();
    this.pokedexAllPokemons
      .getPokemonDetailsObservable$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((pokemon) => {
        pokemon !== null
          ? (this.pokemonDetails = pokemon)
          : console.log('No se ha seleccionado un pokémon');
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
    this.pokedex.getPokedex$().subscribe((pokedexData) => {
      if (pokedexData.length > 0) {
        this.dataSource.data.some((pokemon) => {
          pokemon.inPokedex = this.pokedex.isFavoritePokemon(
            pokemon.id.toString()
          );
          return false;
        });
      }
    });
    const pokedexData = this.pokedex.getPokedex$();
  }
  /**
   * Método para seleccionar un Pokémon y mostrar sus detalles.
   * @param pokemon - Pokémon seleccionado.
   */
  selectPokemon(pokemon: Pokemon) {
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
            this.openDetails(pokemonDetails);
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
   * Método para enviar la data al componente 'CardPokemonDetailsComponent' hijo por medio de dialodRef.
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
  add(pokemon: Pokemon) {
    this.pokedexAllPokemons
      .getPokemonDetails$(pokemon.name)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (details) => {
          const pokemonDetails: PokemonDetails = {
            ...details,
            stats: [...details.stats],
            types: [...details.types],
          };
          this.pokedexAllPokemons.pokemonDetailsSubject.next(pokemonDetails);
          this.addToPokedex(pokemonDetails);
        },
        catchError((err: Error) => {
          console.error('Error fetching Pokemon details', err);
          return of(null);
        })
      );
  }
  /**
   * Método para agregar un Pokémon al Pokedex y mostrar mensajes de verificación.
   * @param pokemon @param pokemon - Pokémon a agregar al Pokedex.
   */
  addToPokedex(pokemon: PokemonDetails) {
    const added = this.pokedex.setFavoritePokemon(pokemon);
    if (added) {
      this.checkPokedexStatus();
      const succesData: MessageSnackbarData = {
        title: 'Pokedex',
        body: `El Pokémon ${pokemon.name} fue agregado a tu pokedex`,
        panelClass: 'success',
      };
      this.message.showSnackBar(this.snackbar, succesData);
      console.log('Pokemon added to Pokedex:', {
        title: pokemon,
        body: `El Pokémon ${pokemon.name} fue agregado a tu pokedex`,
        time: new Date().toLocaleString(),
      });
      this.updatePokedexStatus(pokemon.id);
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
  remove(pokemon: Pokemon) {
    this.pokedexAllPokemons
      .getPokemonDetails$(pokemon.name)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((details) => {
        const pokemonDetails: PokemonDetails = {
          ...details,
          stats: [...details.stats],
          types: [...details.types],
        };
        this.pokedexAllPokemons.pokemonDetailsSubject.next(pokemonDetails);
        this.removeFromPokedex(pokemonDetails);
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
      console.log('Pokemon removed from Pokedex:', {
        pokemon: pokemon,
        pokedex: this.pokedex,
        timestamp: new Date().getMilliseconds(),
      });
      this.checkPokedexStatus();
      this.updatePokedexStatus(pokemon.id);
    } else {
      console.log('Pokemon not in Pokedex. Cannot remove.');
    }
  }
  /**
   * Método para actualizar el estado de un Pokémon en la tabla.
   * @param pokemonId - ID del Pokémon a actualizar.
   * @param inPokedex - Estado del Pokémon en el Pokedex.
   */
  updatePokedexStatus(pokemonId: number): void {
    const foundPokemon = this.dataSource.data.find(
      (pokemon) => Number(pokemon.id) === +pokemonId
    );
    this.pokedex
      .getResetFavorites()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((inPokedex) => {
        if (foundPokemon) {
          foundPokemon.inPokedex = inPokedex;
          this.dataSource.data = [...this.dataSource.data];
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
