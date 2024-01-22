import { Component, EventEmitter, Inject, Output, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Dialog } from '@angular/cdk/dialog';
import { PokemonDetails } from '../../models';

@Component({
  selector: 'app-card-pokemon-details',
  templateUrl: './card-pokemon-details.component.html',
  styleUrls: ['./card-pokemon-details.component.css'],
})
export class CardPokemonDetailsComponent {
  readonly dialogRef = inject(MatDialogRef<CardPokemonDetailsComponent>);
  readonly dialog = inject(Dialog);

  constructor(@Inject(MAT_DIALOG_DATA) public pokemonDetails: PokemonDetails) {}
  @Output() updatePokemon = new EventEmitter<void>();
  @Output() deletePokemon = new EventEmitter<void>();

  update() {
    this.updatePokemon.emit();
  }

  delete() {
    this.deletePokemon.emit();
  }

  close() {
    this.dialogRef.close();
  }
  ngOnInit(): void {
    console.log('data from card-details', this.pokemonDetails);
  }
}
