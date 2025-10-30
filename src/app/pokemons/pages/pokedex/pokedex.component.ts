import { Component, inject } from '@angular/core';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { MessageSnackbarData, PokemonDetails } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackbarService } from '../../services/message-snackbar.service';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pokedex',
    templateUrl: './pokedex.component.html',
    styleUrls: ['./pokedex.component.css'],
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatTooltipModule,
    ]
})
export class PokedexComponent {
  private snackbar = inject(MatSnackBar);
  private message = inject(MessageSnackbarService);

  private pokedexCrud = inject(PokedexCrudService);

  pokedex = this.pokedexCrud.pokedex;
  selectedPokemon?: PokemonDetails;

  /**
   * Método para remover un Pokémon del Pokedex.
   * @param pokemon - Identificador del Pokémon a remover.
   */
  remove(pokemon: number) {
    this.pokedex().some((pokemonPokedex) => {
      if (pokemonPokedex.id === pokemon) {
        const successData: MessageSnackbarData = {
          title: '¡Removido!',
          body: `El Pokémon ${pokemonPokedex.name} fue removido de tu Pokedex.`,
          suggestion: 'Puedes agregar otro Pokémon a tu Pokedex.',
          panelClass: 'warning',
        };
        this.message.showSnackBar(this.snackbar, successData);
      }
    });
    this.pokedexCrud.removeFavoritePokemon(pokemon);
  }
  /**
   * Método para seleccionar un Pokémon del Pokedex.
   * @param pokemon - Pokémon seleccionado.
   */
  selectPokemon(pokemon: PokemonDetails) {
    this.selectedPokemon = pokemon;
  }
}
