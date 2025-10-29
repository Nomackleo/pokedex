import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ListComponent } from './pages/list/list.component';
import { PokedexComponent } from './pages/pokedex/pokedex.component';

export const POKEMONS_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'list', component: ListComponent },
      { path: 'pokedex', component: PokedexComponent },
      { path: '', redirectTo: 'list', pathMatch: 'full' }, // Default
    ],
  },
];
