import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DevicesModalPageRoutingModule } from './devices-modal-routing.module';

import { DevicesModalPage } from './devices-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DevicesModalPageRoutingModule
  ],
  declarations: [DevicesModalPage]
})
export class DevicesModalPageModule {}
