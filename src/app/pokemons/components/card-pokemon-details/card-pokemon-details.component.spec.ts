import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CardPokemonDetailsComponent } from './card-pokemon-details.component';

describe('CardPokemonDetailsComponent', () => {
  let component: CardPokemonDetailsComponent;
  let fixture: ComponentFixture<CardPokemonDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPokemonDetailsComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CardPokemonDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
