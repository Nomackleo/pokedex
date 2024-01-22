import { TestBed } from '@angular/core/testing';

import { PokedexCrudService } from './pokedex-crud.service';

describe('PokedexCrudService', () => {
  let service: PokedexCrudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokedexCrudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
