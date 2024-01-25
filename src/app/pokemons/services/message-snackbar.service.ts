import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackbarData } from '../models';
import { MessagesComponent } from '../components/messages/messages.component';

@Injectable({
  providedIn: 'root',
})
export class MessageSnackbarService {
  /**
   * Muestra un Snackbar con los datos proporcionados.
   * @param snackBar - Instancia del MatSnackBar.
   * @param data - Datos para el Snackbar.
   */
  showSnackBar(snackBar: MatSnackBar, data: MessageSnackbarData) {
    snackBar.openFromComponent(MessagesComponent, {
      data,
      panelClass: data.panelClass,
      duration: 2000,
    });
  }
}
