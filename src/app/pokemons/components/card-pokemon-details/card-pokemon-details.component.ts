import { Component, EventEmitter, Inject, Output, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Dialog } from '@angular/cdk/dialog';
import { PokemonDetails } from '../../models';
import { PokedexCrudService } from '../../services/pokedex-crud.service';

@Component({
  selector: 'app-card-pokemon-details',
  templateUrl: './card-pokemon-details.component.html',
  styleUrls: ['./card-pokemon-details.component.css'],
})
export class CardPokemonDetailsComponent {
  private pokedexCrud = inject(PokedexCrudService);
  readonly dialogRef = inject(MatDialogRef<CardPokemonDetailsComponent>);
  readonly dialog = inject(Dialog);
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
      console.log('pokemon added', this.pokemonDetails);
      // this.updatePokedexStatus(this.pokemonDetails);
      this.addPokemon.emit();
    } else {
      console.warn('No added');
    }
  }

  close() {
    this.dialogRef.close();
  }

  updatePokedexStatus(pokemonDetails: PokemonDetails): boolean {
    const pokedexData = this.pokedexCrud.getPokedex();
    const inPokedex = pokedexData.some(
      (pokemon) => pokemon.id === pokemonDetails.id
    );

    console.log('inPokedex?:', inPokedex);
    return this.inPokedex = inPokedex;
  }
}
