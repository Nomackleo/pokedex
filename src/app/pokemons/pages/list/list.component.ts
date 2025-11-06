import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { filter, take, tap } from 'rxjs';

import { CardPokemonComponent } from '../../components/card-pokemon/card-pokemon.component';
import { CardPokemonDetailsComponent } from '../../components/card-pokemon-details/card-pokemon-details.component';
import { MessageSnackbarData, Pokemon, PokemonDetails } from '../../models';
import { MessageSnackbarService } from '../../services/message-snackbar.service';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { PokedexService } from '../../services/pokedex.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CardPokemonComponent, MatDialogModule, MatSnackBarModule],
})
export class ListComponent {
  readonly pokedexAllPokemons = inject(PokedexService);
  readonly pokedex = inject(PokedexCrudService);
  readonly dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private message = inject(MessageSnackbarService);

  readonly pokemons = computed(() => {
    const pokemons = this.pokedexAllPokemons.pokemons();
    const favoriteIds = this.pokedex.pokedexIds();
    return pokemons.map((pokemon) => ({
      ...pokemon,
      inPokedex: favoriteIds.has(pokemon.id),
    }));
  });

  ngOnInit(): void {
    this.pokedexAllPokemons.loadPokemons();
  }

  selectPokemon(pokemon: Pokemon) {
    this.pokedexAllPokemons
      .getPokemonDetails$(pokemon.name)
      .pipe(
        take(1),
        filter((details): details is PokemonDetails => !!details),
        tap((details) => {
          const pokemonDetails: PokemonDetails = {
            ...details,
            stats: [...details.stats],
            types: [...details.types],
          };
          this.openDetails(pokemonDetails);
        }),
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
      .pipe(
        take(1),
        filter((details): details is PokemonDetails => !!details),
      )
      .subscribe((details) => {
        const pokemonDetails: PokemonDetails = {
          ...details,
          stats: [...details.stats],
          types: [...details.types],
        };
        this.addToPokedex(pokemonDetails);
      });
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
      .pipe(
        take(1),
        filter((details): details is PokemonDetails => !!details),
      )
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
}
