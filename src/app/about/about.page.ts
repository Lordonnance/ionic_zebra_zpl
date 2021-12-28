import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { ScanService } from '../services/scan.service';

import { Deploy } from 'cordova-plugin-ionic/dist/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { BootService } from '../services/boot.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  isNewUpdateAvailable: boolean = false
  updatePercentDone: number = 0

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private globalService: GlobalService,
    public bootService: BootService,
    private scanService: ScanService,
    private deploy: Deploy
  ) {}

  async ngOnInit() {
    console.info ("--- about ngOnInit ---")
    
    const newUpdateAvailable = await this.deploy.checkForUpdate()
    console.log ("newUpdateAvailable", newUpdateAvailable)

    this.isNewUpdateAvailable = newUpdateAvailable.available
  }

  // All svg in the www folder from angular.json
              // {
              //   "glob": "**/*.svg",
              //   "input": "node_modules/ionicons/dist/ionicons/svg",
              //   "output": "./svg"
              // }

  // Downlaod, extract the new currently available version from AppFlow and reload the app
  async performAutomaticUpdate() {
    console.info ("--- performAutomaticUpdate ---")
    const loading = await this.loadingCtrl.create({})
    await loading.present()

    try {
      const currentVersion = await this.deploy.getCurrentVersion();
      const resp = await this.deploy.sync({updateMethod: 'auto'}, percentDone => {
        console.log(`Update is ${percentDone}% done!`);
        this.updatePercentDone = percentDone
      });

      if (!currentVersion || currentVersion.versionId !== resp.versionId){
        // We found an update, and are in process of redirecting you since you put auto!
      }else{
        // No update available
      }

      /*
      await this.deploy.downloadUpdate((progress) => {
        console.log("downloadUpdate progress: ", progress);
        this.updatePercentDone = progress
      })
      await this.deploy.extractUpdate((progress) => {
        console.log("extractUpdate progress: ", progress);
        this.updatePercentDone = progress
      })
      await this.deploy.reloadApp();
      */

      loading.dismiss()
      this.updatePercentDone = 0
    } catch (err) {
      // We encountered an error.
      console.error ("Error while downloading update")
      console.error (err)

      loading.dismiss()
      this.updatePercentDone = 0
    }
   }

  // Log out the user from the app and erase user Credentials in Ionic local storage
  logout() {
    // Reset scanService attributes
    this.scanService.resetScanAttributes()

    // Logout from firebase and go to login page
    this.globalService.logout()
  }
}
