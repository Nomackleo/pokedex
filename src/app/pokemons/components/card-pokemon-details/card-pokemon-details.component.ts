import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Output,
  computed,
  inject,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Dialog } from '@angular/cdk/dialog';
import { MessageSnackbarData, PokemonDetails } from '../../models';
import { PokedexCrudService } from '../../services/pokedex-crud.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackbarService } from '../../services/message-snackbar.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-pokemon-details',
  templateUrl: './card-pokemon-details.component.html',
  styleUrls: ['./card-pokemon-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
})
export class CardPokemonDetailsComponent {
  private snackbar = inject(MatSnackBar);
  private pokedexCrud = inject(PokedexCrudService);
  readonly dialogRef = inject(MatDialogRef<CardPokemonDetailsComponent>);
  readonly dialog = inject(Dialog);
  private message = inject(MessageSnackbarService);

  inPokedex = computed(() => {
    const pokedex = this.pokedexCrud.pokedex();
    return pokedex.some((p) => p.id === this.pokemonDetails.id);
  });

  constructor(@Inject(MAT_DIALOG_DATA) public pokemonDetails: PokemonDetails) {}

  @Output() addPokemon = new EventEmitter<void>();

  add() {
    const addedSuccessfully = this.pokedexCrud.setFavoritePokemon(
      this.pokemonDetails
    );

    if (addedSuccessfully) {
      const succesData: MessageSnackbarData = {
        title: 'Pokedex',
        body: `El Pokémon ${this.pokemonDetails.name} fue agregado a tu pokedex`,
        panelClass: 'success',
      };
      this.message.showSnackBar(this.snackbar, succesData);
      this.addPokemon.emit();
    } else {
      console.warn('No added');
    }
  }

  close() {
    this.dialogRef.close();
  }
}
