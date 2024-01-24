import { Component, inject } from '@angular/core';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { PokemonDetails } from '../../models';
import { Router } from '@angular/router';
import { PokedexService } from '../../services/pokedex.service';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.css'],
})
export class PokedexComponent {
  private pokedexCrud = inject(PokedexCrudService);
  private pokedexPokemon = inject(PokedexService);
  private router = inject(Router);

  pokedex: PokemonDetails[] = [];
  selectedPokemon?: PokemonDetails;

  ngOnInit(): void {
    this.pokedex = this.pokedexCrud.getPokedex();
    console.log(this.pokedex);
  }

  remove(pokemon: number) {
    this.pokedexCrud.removeFavoritePokemon(pokemon);
  }

  selectPokemon(pokemon: PokemonDetails) {
    this.selectedPokemon = pokemon;
  }

}
