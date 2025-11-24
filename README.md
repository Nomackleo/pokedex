# PokedexApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.10.

# Pokedex Angular App

Esta aplicación Angular utiliza el framework Material Design para crear una Pokedex simple. La Pokedex permite ver una lista de Pokemon, agregarlos o quitarlos de tu Pokedex personal.

## Componentes Principales

### `CardPokemonComponent`

Este componente muestra una tabla de Pokemon con las siguientes columnas: ID, Nombre, Foto y Acciones (Agregar/Quitar de Pokedex). También tiene un campo de búsqueda para filtrar la lista.

- **Métodos:**
  - `selectPokemon(pokemon: Pokemon)`: Emite un evento cuando se selecciona un Pokemon.
  - `add()`: Agrega un Pokemon al Pokedex.
  - `remove()`: Quita un Pokemon del Pokedex.

### `CardPokemonDetailsComponent`

Este componente se abre al seleccionar un Pokemon en `CardPokemonComponent`. Muestra detalles del Pokemon seleccionado y permite agregarlo al Pokedex.

- **Métodos:**
  - `add()`: Agrega el Pokemon actual al Pokedex.
  - `close()`: Cierra el componente de detalles.

### `ListComponent`

El componente principal que orquesta la lógica y muestra la lista de Pokemon. Utiliza los servicios `PokedexService` y `PokedexCrudService` para obtener y gestionar los datos.

- **Métodos:**
  - `selectPokemon(pokemon: Pokemon)`: Selecciona un Pokemon y muestra sus detalles.
  - `openDetails(pokemonDetails: PokemonDetails)`: Abre el componente de detalles.
  - `ngOnDestroy()`: Limpieza de recursos cuando el componente se destruye.

## Servicios

### `PokedexService`

Maneja la obtención de la lista de Pokemon y sus detalles utilizando la PokeAPI.

### `PokedexCrudService`

Maneja la lógica del Pokedex, permite agregar, quitar y obtener información sobre los Pokemon en el Pokedex.

### `MessageSnackbarService`

Un servicio para mostrar mensajes a través de un MatSnackBar. Utiliza el componente `MessagesComponent` para personalizar la apariencia del mensaje.

## Instalación y Ejecución

1. Clona este repositorio.
2. Ejecuta `npm install` para instalar las dependencias.
3. Ejecuta `ng serve` para iniciar la aplicación en modo desarrollo.
4. Abre tu navegador y visita `http://localhost:4200/`.

¡Disfruta explorando la Pokedex Angular App!
# pokedex_container
