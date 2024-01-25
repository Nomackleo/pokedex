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
  @Output() pokemonEmitter = new EventEmitter<Pokemon>();

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
    this.paginator.pageSize = 5;
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
  /**
   * Método para agregar un Pokémon al Pokedex.
   */
  add(): void {
    this.pokedex
      .getPokemonDetailsObservable$()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((pokemon) => {
        pokemon != null ? this.addToPokedex(pokemon) : console.error('Error');
      });
  }
  /**
   * Método para agregar un Pokémon al Pokedex y mostrar mensajes.
   * @param pokemon @param pokemon - Pokémon a agregar al Pokedex.
   */
  addToPokedex(pokemon: PokemonDetails) {
    const added = this.pokedexCrud.setFavoritePokemon(pokemon);

    if (added) {
      const succesData: MessageSnackbarData = {
        title: 'Pokedex',
        body: `El Pokémon ${pokemon.name} fue agregado a tu pokedex`,
        panelClass: 'success',
      };
      this.message.showSnackBar(this.snackbar, succesData);
      console.log('Pokemon added to Pokedex:', pokemon);
      this.updatePokedexStatus(pokemon.id, true);
    } else {
      const errorData: MessageSnackbarData = {
        title: 'Ooops',
        body: 'El Pokedex está lleno. No se pueden agregar más Pokémon.',
        suggestion:
          'Considera remover un Pokémon antes de intentar agregar otro.',
        panelClass: 'warning',
      };
      this.message.showSnackBar(this.snackbar, errorData);
      console.log('Pokedex is full. Cannot add more Pokemon.');
    }
  }
  /**
   * Método para remover un Pokémon del Pokedex.
   */
  remove() {
    this.pokedex.getPokemonDetailsObservable$().subscribe((pokemon) => {
      pokemon != null
        ? this.removeFromPokedex(pokemon)
        : console.error('Error remove');
    });
  }
  /**
   * Método para remover un Pokémon del Pokedex y mostrar mensajes.
   * @param pokemon - Pokémon a remover del Pokedex.
   */
  removeFromPokedex(pokemon: PokemonDetails): void {
    const isInPokedex = this.pokedexCrud.isFavoritePokemon(
      pokemon.id.toString()
    );

    if (isInPokedex) {
      this.pokedexCrud.removeFavoritePokemon(pokemon.id);
      const successData: MessageSnackbarData = {
        title: '¡Removido!',
        body: `El Pokémon ${pokemon.name} fue removido de tu Pokedex.`,
        suggestion: 'Puedes agregar otro Pokémon a tu Pokedex.',
        panelClass: 'warning',
      };
      this.message.showSnackBar(this.snackbar, successData);
      console.log('Pokemon removed from Pokedex:', pokemon);
      this.updatePokedexStatus(pokemon.id, false);
    } else {
      console.log('Pokemon not in Pokedex. Cannot remove.');
    }
  }
  /**
   * Método para actualizar el estado de un Pokémon en la tabla.
   * @param pokemonId - ID del Pokémon a actualizar.
   * @param inPokedex - Estado del Pokémon en el Pokedex.
   */
  updatePokedexStatus(pokemonId: number, inPokedex: boolean): void {
    const foundPokemon = this.dataSource.data.find(
      (pokemon) => Number(pokemon.id) === +pokemonId
    );

    if (foundPokemon) {
      foundPokemon.inPokedex = inPokedex;
      this.dataSource.data = [...this.dataSource.data];
    }
  }
  /**
   * Limpia la memoria.
   */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
