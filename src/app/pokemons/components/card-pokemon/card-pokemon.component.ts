import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Pokemon } from '../../models/pokemons.interfaces';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PokedexService } from '../../services/pokedex.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-card-pokemon',
    templateUrl: './card-pokemon.component.html',
    styleUrls: ['./card-pokemon.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
    ]
})
export class CardPokemonComponent {
  private pokedex = inject(PokedexService);
  displayedColumns: string[] = ['id', 'name', 'pic', 'pokedex'];
  isMobileView: boolean = false;
  loading: boolean = true;
  destroyed$ = new Subject<void>();

  @Input() dataSource!: MatTableDataSource<Pokemon>;
  @Input() pokemon$!: Observable<Pokemon[]>;
  @Input() pageSize!: number;
  @Output() pokemonEmitter = new EventEmitter<Pokemon>();
  @Output() addPokemon = new EventEmitter<Pokemon>();
  @Output() removePokemon = new EventEmitter<Pokemon>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {}

  ngOnInit(): void {
    this.loading = true;
  }

  ngAfterViewInit(): void {
    this.isMobileView = window.innerWidth < 625;
  }

  selectPokemon(pokemon: Pokemon) {
    this.pokemonEmitter.emit(pokemon);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobileView = window.innerWidth < 625;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  add(e: Event, pokemon: Pokemon) {
    this.addPokemon.emit(pokemon);
    e.stopPropagation();
  }

  remove(e: Event, pokemon: Pokemon) {
    this.removePokemon.emit(pokemon);
    e.stopPropagation();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
