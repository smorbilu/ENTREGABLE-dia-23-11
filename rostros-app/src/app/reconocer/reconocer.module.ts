import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { DeteccionVidaComponent } from './deteccion-vida/deteccion-vida.component';
import { ReconocerPage } from './reconocer.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: ReconocerPage }]),
  ],
  declarations: [ReconocerPage, DeteccionVidaComponent],
})
export class ReconocerPageModule {}
