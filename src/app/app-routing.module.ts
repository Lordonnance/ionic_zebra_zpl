import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'start',
    loadChildren: () => import('./start/start.module').then( m => m.StartPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then( m => m.AboutPageModule)
  },
  {
    path: 'devices-modal',
    loadChildren: () => import('./devices-modal/devices-modal.module').then( m => m.DevicesModalPageModule)
  }
];
// {
//   path: 'tags',
//   loadChildren: () => import('./tabs/list/profile/tags/tags.module').then( m => m.TagsPageModule)
// },
// {
//   path: 'profile',
//   loadChildren: () => import('./tabs/list/profile/profile.module').then( m => m.ProfilePageModule)
// },
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
