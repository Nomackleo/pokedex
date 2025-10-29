import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
  effect,
  inject,
} from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CardPokemonDetailsComponent } from '../../components/card-pokemon-details/card-pokemon-details.component';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { MessageSnackbarService } from '../../services/message-snackbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CardPokemonComponent } from '../../components/card-pokemon/card-pokemon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CardPokemonComponent, MatDialogModule],
})
export class ListComponent {
  pageSize!: number;
  allPokemon$!: Observable<Pokemon[]>;
  selectedPokemon: PokemonDetails[] = [];
  pokemonDetails!: WritableSignal<PokemonDetails | null>;
  destroyed$ = new Subject<void>();
  dataSource!: MatTableDataSource<Pokemon>;

  readonly pokedexAllPokemons = inject(PokedexService);
  readonly pokedex = inject(PokedexCrudService);
  readonly dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private message = inject(MessageSnackbarService);

  constructor() {
    effect(() => {
      const pokedex = this.pokedex.pokedex();
      if (this.dataSource && this.dataSource.data) {
        this.dataSource.data.forEach((pokemon) => {
          pokemon.inPokedex = pokedex.some((p) => p.id.toString() === pokemon.id);
        });
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }

  ngOnInit(): void {
    this.pokemonDetails = this.pokedexAllPokemons.pokemonDetails;
    this.allPokemon$ = this.pokedexAllPokemons.getPokemons$();
    this.pageSize = 10;
    this.allPokemon$
      .pipe(
        map((pokemons) => {
          this.dataSource = new MatTableDataSource<Pokemon>();
          this.dataSource.data = pokemons;
          return pokemons;
        })
      )
      .subscribe();
  }

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

  openDetails(pokemonDetails: PokemonDetails) {
    const dialogRef = this.dialog.open(CardPokemonDetailsComponent, {
      data: pokemonDetails,
      width: '400px',
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

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
          this.addToPokedex(pokemonDetails);
        },
        catchError((err: Error) => {
          console.error('Error fetching Pokemon details', err);
          return of(null);
        })
      );
  }

  addToPokedex(pokemon: PokemonDetails) {
    const added = this.pokedex.setFavoritePokemon(pokemon);
    if (added) {
      const succesData: MessageSnackbarData = {
        title: 'Pokedex',
        body: `El Pokémon ${pokemon.name} fue agregado a tu pokedex`,
        panelClass: 'success',
      };
      this.message.showSnackBar(this.snackbar, succesData);
    } else {
      const errorData: MessageSnackbarData = {
        title: 'Ooops',
        body: 'El Pokedex está lleno. No se pueden agregar más Pokémon.',
        suggestion:
          'Considera remover un Pokémon antes de intentar agregar otro.',
        panelClass: 'warning',
      };
      this.message.showSnackBar(this.snackbar, errorData);
    }
  }

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
        this.removeFromPokedex(pokemonDetails);
      });
  }

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
    } else {
      console.log('Pokemon not in Pokedex. Cannot remove.');
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
