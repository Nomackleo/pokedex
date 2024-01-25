import { Component, EventEmitter, Inject, Output, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Dialog } from '@angular/cdk/dialog';
import { MessageSnackbarData, PokemonDetails } from '../../models';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackbarService } from '../../services/message-snackbar.service';

@Component({
  selector: 'app-card-pokemon-details',
  templateUrl: './card-pokemon-details.component.html',
  styleUrls: ['./card-pokemon-details.component.css'],
})
export class CardPokemonDetailsComponent {
  private snackbar = inject(MatSnackBar);
  private pokedexCrud = inject(PokedexCrudService);
  readonly dialogRef = inject(MatDialogRef<CardPokemonDetailsComponent>);
  readonly dialog = inject(Dialog);
  private message = inject(MessageSnackbarService);

  inPokedex!: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public pokemonDetails: PokemonDetails) {}

  @Output() addPokemon = new EventEmitter<void>();

  ngOnInit(): void {
    this.updatePokedexStatus(this.pokemonDetails);
  }
  add() {
    const addedSuccessfully = this.pokedexCrud.setFavoritePokemon(
      this.pokemonDetails
    );

    if (addedSuccessfully) {
      const succesData: MessageSnackbarData = {
        title: 'Pokedex',
        body: `El Pokémon ${this.pokemonDetails.name} fue agregado a tu pokedex`,
        panelClass: 'success',
      };
      this.message.showSnackBar(this.snackbar, succesData);
      console.log('pokemon added', this.pokemonDetails);
      this.addPokemon.emit();
    } else {
      console.warn('No added');
    }
  }

  close() {
    this.dialogRef.close();
  }
  /**
   * Método para actualizar el estado de un Pokémon en el Pokedex.
   * @param pokemonDetails - Detalles del Pokémon.
   * @returns Estado del Pokémon en el Pokedex.
   */
  updatePokedexStatus(pokemonDetails: PokemonDetails): boolean {
    const pokedexData = this.pokedexCrud.getPokedex();
    const inPokedex = pokedexData.some(
      (pokemon) => pokemon.id === pokemonDetails.id
    );

    console.log('inPokedex?:', inPokedex);
    return (this.inPokedex = inPokedex);
  }
}
