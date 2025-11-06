import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pokemons',
  },
  {
    path: 'pokemons',
    loadChildren: () =>
      import('./pokemons/pokemons.routes').then((m) => m.POKEMONS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'pokemons',
  },
];
