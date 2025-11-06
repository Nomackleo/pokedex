import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Pokemon } from '../../models/pokemons.interfaces';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
    standalone: true,
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
  displayedColumns: string[] = ['id', 'name', 'pic', 'pokedex'];
  isMobileView: boolean = false;
  loading: boolean = true;

  readonly dataSource = new MatTableDataSource<Pokemon>();
  @Input() set pokemons(value: Pokemon[]) {
    this.dataSource.data = value ?? [];
    this.loading = this.dataSource.data.length === 0;
  }
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
    this.loading = this.dataSource.data.length === 0;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  selectPokemon(pokemon: Pokemon) {
    this.pokemonEmitter.emit(pokemon);
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

  ngOnDestroy(): void {}
}
