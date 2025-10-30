import { Component, inject } from '@angular/core';
import { PokedexService } from './pokemons/services/pokedex.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {
  title = 'pokedexApp';

  
}
