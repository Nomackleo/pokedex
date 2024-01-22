import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PokemonDetails } from '../../models';

@Component({
  selector: 'app-card-pokemon-details',
  templateUrl: './card-pokemon-details.component.html',
  styleUrls: ['./card-pokemon-details.component.css'],
})
export class CardPokemonDetailsComponent {
  @Input() pokemonDetails!: PokemonDetails;
  @Output() updatePokemon = new EventEmitter<void>();
  @Output() deletePokemon = new EventEmitter<void>();

  update() {
    this.updatePokemon.emit();
  }

  delete() {
    this.deletePokemon.emit();
  }

  ngOnInit(): void {
  }
}
