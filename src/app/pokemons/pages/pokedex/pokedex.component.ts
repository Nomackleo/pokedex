import { Component, inject } from '@angular/core';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { PokemonDetails } from '../../models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.css'],
})
export class PokedexComponent {
  private pokedexCrud = inject(PokedexCrudService);
  private router = inject(Router);

  pokedex: PokemonDetails[] = [];
  selectedPokemon?: PokemonDetails;

  ngOnInit(): void {
    this.pokedex = this.pokedexCrud.getPokedex();
    console.log(this.pokedex);
  }

  update() {
    this.router.navigate(['pokemons/list'])
  }

  selectPokemon(pokemon: PokemonDetails) {
    this.selectedPokemon = pokemon;
  }
  
  delete(pokemon: PokemonDetails): void {
    if (pokemon) {
      this.pokedexCrud.removeFavoritePokemon(pokemon.id);
      console.log('Pokemon deleted', pokemon);
      this.selectedPokemon = undefined;
    }
  }
}
