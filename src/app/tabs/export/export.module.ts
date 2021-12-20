import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportPage } from './export.page';

import { ExportPageRoutingModule } from './export-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ExportPage }]),
    ExportPageRoutingModule,
  ],
  declarations: [ExportPage]
})
export class ExportPageModule {}
