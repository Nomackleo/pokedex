import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { Pokemon } from '../../models/pokemons.interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MessageSnackbarData, PokemonDetails } from '../../models';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { PokedexService } from '../../services/pokedex.service';
import { MessageSnackbarService } from '../../services/message-snackbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-card-pokemon',
  templateUrl: './card-pokemon.component.html',
  styleUrls: ['./card-pokemon.component.css'],
})
export class CardPokemonComponent {
  private snackbar = inject(MatSnackBar);
  private pokedexCrud = inject(PokedexCrudService);
  private pokedex = inject(PokedexService);
  private message = inject(MessageSnackbarService);
  displayedColumns: string[] = ['id', 'name', 'pic', 'pokedex'];
  isMobileView: boolean = false;
  loading: boolean = true;
  private destroyed$ = new Subject<void>();

  @Input() dataSource!: MatTableDataSource<Pokemon>;
  @Input() pokemon$!: Observable<Pokemon[]>;
  @Input() pageSize!: number;
  @Output() pokemonEmitter = new EventEmitter<Pokemon>();
  @Output() addPokemon = new EventEmitter<void>();
  @Output() removePokemon = new EventEmitter<void>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {}

  ngOnInit(): void {
    this.pokedex.getPokemonDetailsObservable$().subscribe((pokemon) => pokemon);
    this.loading = true;
  }
  /**
   * Método que se ejecuta después de que se han inicializado las vistas.
   * Configura el paginador y determina si la vista es móvil.
   */
  ngAfterViewInit(): void {
    this.isMobileView = window.innerWidth < 625;
  }
  /**
   * Método para seleccionar un Pokémon y emitir un evento.
   * @param pokemon - Pokémon seleccionado.
   */
  selectPokemon(pokemon: Pokemon) {
    this.pokemonEmitter.emit(pokemon);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Manejador del evento de redimensionamiento de la ventana.
   * @param event - Evento de redimensionamiento.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobileView = window.innerWidth < 625;
  }
  /**
   * Método para aplicar un filtro a la tabla.
   * @param event - Evento de entrada.
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  add() {
    this.addPokemon.emit();
  }

  remove() {
    this.removePokemon.emit();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
