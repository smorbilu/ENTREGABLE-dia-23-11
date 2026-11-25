import { Component, computed, inject, signal } from '@angular/core';

import {
  ReconocimientoRespuesta,
  RostrosService,
  mensajeDeError,
  nombreLegible,
} from '../services/rostros.service';

@Component({
  selector: 'app-reconocer',
  templateUrl: 'reconocer.page.html',
  styleUrls: ['reconocer.page.scss'],
  standalone: false,
})
export class ReconocerPage {
  private readonly rostros = inject(RostrosService);

  readonly sesion = signal<string | null>(null);
  readonly preparando = signal(false);
  readonly verificando = signal(false);
  readonly resultado = signal<ReconocimientoRespuesta | null>(null);
  readonly error = signal('');

  readonly ocupado = computed(() => this.preparando() || this.verificando());

  readonly nombreLegible = nombreLegible;

  ionViewWillLeave(): void {
    this.sesion.set(null);
  }

  async iniciar(): Promise<void> {
    this.resultado.set(null);
    this.error.set('');
    this.preparando.set(true);
    try {
      const { sessionId } = await this.rostros.crearSesion();
      this.sesion.set(sessionId);
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.preparando.set(false);
    }
  }

  async alCompletar(): Promise<void> {
    const sessionId = this.sesion();
    this.sesion.set(null);
    if (!sessionId) {
      return;
    }
    this.verificando.set(true);
    try {
      this.resultado.set(await this.rostros.reconocer(sessionId));
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.verificando.set(false);
    }
  }

  alCancelar(): void {
    this.sesion.set(null);
  }

  alFallar(mensaje: string): void {
    this.sesion.set(null);
    this.error.set(mensaje);
  }
}
