import { Component, inject } from '@angular/core';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { MessageSnackbarData, PokemonDetails } from '../../models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackbarService } from '../../services/message-snackbar.service';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.css'],
})
export class PokedexComponent {
  private snackbar = inject(MatSnackBar);
  private message = inject(MessageSnackbarService);

  private pokedexCrud = inject(PokedexCrudService);

  pokedex: PokemonDetails[] = [];
  selectedPokemon?: PokemonDetails;

  ngOnInit(): void {
    this.pokedex = this.pokedexCrud.getPokedex();
    console.log(this.pokedex);
  }
  /**
   * Método para remover un Pokémon del Pokedex.
   * @param pokemon - Identificador del Pokémon a remover.
   */
  remove(pokemon: number) {
    this.pokedex.some((pokemonPokedex) => {
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
