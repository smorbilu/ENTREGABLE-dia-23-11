import { Component, ElementRef, OnDestroy, OnInit, inject, input, output } from '@angular/core';
import { ThemeProvider } from '@aws-amplify/ui-react';
import { FaceLivenessDetector, FaceLivenessDetectorProps } from '@aws-amplify/ui-react-liveness';
import { createElement } from 'react';
import { Root, createRoot } from 'react-dom/client';

import { environment } from '../../../environments/environment';

const TEXTOS: FaceLivenessDetectorProps['displayText'] = {
  cameraMinSpecificationsHeadingText: 'La cámara no cumple los requisitos mínimos',
  cameraMinSpecificationsMessageText: 'La cámara debe tener al menos 320×240 de resolución y 15 cuadros por segundo.',
  cameraNotFoundHeadingText: 'No se puede usar la cámara',
  cameraNotFoundMessageText: 'Revisa que la app tenga permiso de cámara y que ninguna otra app la esté usando.',
  a11yVideoLabelText: 'Cámara para la prueba de vida',
  cancelLivenessCheckText: 'Cancelar la prueba de vida',
  goodFitCaptionText: 'Bien',
  goodFitAltText: 'Ilustración de una cara que llena el óvalo por completo.',
  hintCenterFaceText: 'Centra tu cara',
  hintCenterFaceInstructionText:
    'Antes de empezar, coloca la cámara a la altura de tu cara. Cuando aparezca el óvalo, acércate hasta llenarlo y quédate quieto unos segundos.',
  hintFaceOffCenterText: 'Tu cara no está dentro del óvalo, céntrala frente a la cámara.',
  hintMoveFaceFrontOfCameraText: 'Coloca tu cara frente a la cámara',
  hintTooManyFacesText: 'Debe haber una sola cara frente a la cámara',
  hintFaceDetectedText: 'Cara detectada',
  hintCanNotIdentifyText: 'Coloca tu cara frente a la cámara',
  hintTooCloseText: 'Aléjate un poco',
  hintTooFarText: 'Acércate',
  hintConnectingText: 'Conectando…',
  hintVerifyingText: 'Verificando…',
  hintCheckCompleteText: 'Prueba completada',
  hintIlluminationTooBrightText: 'Busca un lugar con menos luz',
  hintIlluminationTooDarkText: 'Busca un lugar con más luz',
  hintIlluminationNormalText: 'La iluminación es adecuada',
  hintHoldFaceForFreshnessText: 'Quédate quieto',
  hintMatchIndicatorText: '50 % completado. Sigue acercándote.',
  photosensitivityWarningBodyText: 'Esta prueba muestra luces de colores. Ten cuidado si eres fotosensible.',
  photosensitivityWarningHeadingText: 'Advertencia de fotosensibilidad',
  photosensitivityWarningInfoText:
    'Algunas personas pueden sufrir convulsiones con luces de colores. Ten cuidado si tú o alguien de tu familia tiene epilepsia.',
  photosensitivityWarningLabelText: 'Más información sobre fotosensibilidad',
  retryCameraPermissionsText: 'Reintentar',
  recordingIndicatorText: 'Grabando',
  startScreenBeginCheckText: 'Iniciar prueba de vida',
  tooFarCaptionText: 'Muy lejos',
  tooFarAltText: 'Ilustración de una cara dentro del óvalo con espacio libre alrededor.',
  waitingCameraPermissionText: 'Esperando que permitas el uso de la cámara.',
  errorLabelText: 'Error',
  connectionTimeoutHeaderText: 'Se agotó el tiempo de conexión',
  connectionTimeoutMessageText: 'La conexión tardó demasiado.',
  timeoutHeaderText: 'Se acabó el tiempo',
  timeoutMessageText: 'Tu cara no llenó el óvalo a tiempo. Inténtalo de nuevo.',
  faceDistanceHeaderText: 'Te acercaste antes de tiempo',
  faceDistanceMessageText: 'No te acerques mientras se conecta.',
  multipleFacesHeaderText: 'Hay más de una cara',
  multipleFacesMessageText: 'Asegúrate de que solo haya una cara frente a la cámara.',
  clientHeaderText: 'Error en el dispositivo',
  clientMessageText: 'La prueba falló por un problema del dispositivo.',
  serverHeaderText: 'Error del servidor',
  serverMessageText: 'No se pudo completar la prueba por un problema del servidor.',
  landscapeHeaderText: 'No se permite la pantalla horizontal',
  landscapeMessageText: 'Gira tu celular a posición vertical.',
  portraitMessageText: 'Mantén el celular en vertical durante toda la prueba.',
  tryAgainText: 'Intentar de nuevo',
};

const ERRORES: Record<string, string> = {
  CAMERA_ACCESS_ERROR: 'No se pudo usar la cámara. Revisa que la app tenga permiso de cámara.',
  DEFAULT_CAMERA_NOT_FOUND_ERROR: 'No se encontró la cámara frontal.',
  CAMERA_FRAMERATE_ERROR: 'La cámara de este dispositivo no cumple los requisitos mínimos.',
  MOBILE_LANDSCAPE_ERROR: 'Pon el celular en vertical e inténtalo de nuevo.',
  TIMEOUT: 'Se acabó el tiempo: llena el óvalo con tu cara más rápido.',
  FRESHNESS_TIMEOUT: 'Se acabó el tiempo. Quédate quieto cuando la app te lo pida.',
  CONNECTION_TIMEOUT: 'Se perdió la conexión con AWS. Revisa tu internet.',
  FACE_DISTANCE_ERROR: 'Te acercaste antes de tiempo. No te muevas mientras se conecta.',
  MULTIPLE_FACES_ERROR: 'Debe haber una sola cara frente a la cámara.',
  SERVER_ERROR: 'AWS no pudo completar la prueba. Inténtalo de nuevo.',
};

const ERROR_GENERAL = 'Ocurrió un error en la prueba de vida. Inténtalo de nuevo.';

@Component({
  selector: 'app-deteccion-vida',
  template: '',
  styleUrls: ['./deteccion-vida.component.scss'],
  standalone: false,
})
export class DeteccionVidaComponent implements OnInit, OnDestroy {
  private readonly anfitrion = inject<ElementRef<HTMLElement>>(ElementRef);
  private raiz: Root | null = null;

  readonly sessionId = input.required<string>();
  readonly completado = output<void>();
  readonly cancelado = output<void>();
  readonly fallo = output<string>();

  ngOnInit(): void {
    const propiedades: FaceLivenessDetectorProps = {
      sessionId: this.sessionId(),
      region: environment.region,
      displayText: TEXTOS,
      onAnalysisComplete: async () => this.completado.emit(),
      onUserCancel: () => this.cancelado.emit(),
      onError: ({ state }) => this.fallo.emit(ERRORES[state] ?? ERROR_GENERAL),
    };
    this.raiz = createRoot(this.anfitrion.nativeElement);
    this.raiz.render(createElement(ThemeProvider, null, createElement(FaceLivenessDetector, propiedades)));
  }

  ngOnDestroy(): void {
    this.raiz?.unmount();
    this.raiz = null;
  }
}
