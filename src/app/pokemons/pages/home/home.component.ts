import { Component, inject } from '@angular/core';
import { PokedexService } from '../../services/pokedex.service';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { Subject, Subscription, count, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  private pokedexCrud = inject(PokedexCrudService);
  matBadge!: number;
  private pokedexCountSubscription: Subscription = new Subscription();
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.pokedexCountSubscription = this.pokedexCrud
      .getPokedex$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((pokedexData) => {
        this.matBadge = pokedexData.length;
      });
    // this.pokedexCountSubscription = this.pokedexCrud
    //   .getPokedexCountObservable()
    //   .subscribe((count) => {
    //     this.matBadge = count;
    //   });
  }

  ngOnDestroy(): void {
    this.pokedexCountSubscription.unsubscribe();
  }
}
