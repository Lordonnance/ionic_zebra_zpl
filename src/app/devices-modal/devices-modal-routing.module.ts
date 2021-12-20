import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DevicesModalPage } from './devices-modal.page';

const routes: Routes = [
  {
    path: '',
    component: DevicesModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DevicesModalPageRoutingModule {}
