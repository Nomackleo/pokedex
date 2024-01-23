import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { Observable, map } from 'rxjs';
import { Pokemon } from '../../models/pokemons.interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PokemonDetails } from '../../models';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { PokedexService } from '../../services/pokedex.service';

@Component({
  selector: 'app-card-pokemon',
  templateUrl: './card-pokemon.component.html',
  styleUrls: ['./card-pokemon.component.css'],
})
export class CardPokemonComponent {
  private pokedexCrud = inject(PokedexCrudService);
  private pokedex = inject(PokedexService);
  displayedColumns: string[] = ['id', 'name', 'pic', 'pokedex'];
  isMobileView: boolean = false;

  @Input() dataSource!: MatTableDataSource<Pokemon>;
  @Input() pokemon$!: Observable<Pokemon[]>;
  @Output() pokemonEmitter = new EventEmitter<Pokemon>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {}
  ngOnInit(): void {
    this.pokedex.getPokemonDetailsObservable$().subscribe((pokemon) => pokemon);
  }
  ngAfterViewInit(): void {
    this.paginator.pageSize = 5;
    this.isMobileView = window.innerWidth < 625;
  }

  loadPages() {}

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

  add() {
    this.pokedex.getPokemonDetailsObservable$().subscribe((pokemon) => {
      console.log('Pokemon a agregar desde List', pokemon);

      pokemon != null ? this.addToPokedex(pokemon) : console.error('Error');
    });
  }

  addToPokedex(pokemon: PokemonDetails) {
    const added = this.pokedexCrud.setFavoritePokemon(pokemon);

    if (added) {
      console.log('Pokemon added to Pokedex:', pokemon);
    } else {
      console.log('Pokedex is full. Cannot add more Pokemon.');
      // Puedes manejar este caso de acuerdo a tus necesidades, por ejemplo, mostrar un mensaje al usuario.
    }
  }

  remove() {
    this.pokedex.getPokemonDetailsObservable$().subscribe((pokemon) => {
      pokemon != null
        ? this.removeFromPokedex(pokemon)
        : console.error('Error remove');
    });
  }

  removeFromPokedex(pokemon: PokemonDetails): void {
    const isInPokedex = this.pokedexCrud.isFavoritePokemon(
      pokemon.id.toString()
    );

    if (isInPokedex) {
      this.pokedexCrud.removeFavoritePokemon(pokemon.id);
      console.log('Pokemon removed from Pokedex:', pokemon);
    } else {
      console.log('Pokemon not in Pokedex. Cannot remove.');
      // Puedes manejar este caso de acuerdo a tus necesidades, por ejemplo, mostrar un mensaje al usuario.
    }
  }
}
