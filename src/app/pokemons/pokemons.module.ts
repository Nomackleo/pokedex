import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PokemonsRoutingModule } from './pokemons-routing.module';
import { MaterialModule } from '../material/material.module';
import { HomeComponent } from './pages/home/home.component';
import { ListComponent } from './pages/list/list.component';
import { PokedexComponent } from './pages/pokedex/pokedex.component';
import { CardPokemonComponent } from './components/card-pokemon/card-pokemon.component';
import { CardPokemonDetailsComponent } from './components/card-pokemon-details/card-pokemon-details.component';
import { MessagesComponent } from './components/messages/messages.component';

@NgModule({
  declarations: [
    HomeComponent,
    ListComponent,
    PokedexComponent,
    CardPokemonComponent,
    CardPokemonDetailsComponent,
    MessagesComponent,
  ],
  imports: [CommonModule, PokemonsRoutingModule, MaterialModule],
})
export class PokemonsModule {}
