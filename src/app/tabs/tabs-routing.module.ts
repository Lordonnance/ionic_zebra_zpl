import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'scan',
        loadChildren: () => import('./scan/scan.module').then(m => m.ScanPageModule)
      },
      {
        path: 'list',
        children: [
          {
            path: '',
            loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
          },
          {
            path: 'profile',
            children: [
              {
                path: '',
                loadChildren: () => import('./list/profile/profile.module').then(m => m.ProfilePageModule)
              },
              {
                path: 'tags',
                loadChildren: () => import('./list/profile/tags/tags.module').then(m => m.TagsPageModule)
              }
            ]
          },
        ]
      },
      {
        path: 'export',
        loadChildren: () => import('./export/export.module').then(m => m.ExportPageModule)
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule)
          },
          {
            path: 'terms',
            loadChildren: () => import('./settings/terms/terms.module').then(m => m.TermsPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/list',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/list',
    pathMatch: 'full'
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
