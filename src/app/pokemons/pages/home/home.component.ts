import { Component, inject } from '@angular/core';
import { PokedexService } from '../../services/pokedex.service';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { Subscription, count } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  private pokedexCrud = inject(PokedexCrudService);
  matBadge!: number;
  private pokedexCountSubscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.matBadge = this.pokedexCrud.getPokedex().length;
    this.pokedexCountSubscription = this.pokedexCrud
      .getPokedexCountObservable()
      .subscribe((count) => {
        this.matBadge = count;
      });
  }

  ngOnDestroy(): void {
    this.pokedexCountSubscription.unsubscribe();
  }
}
