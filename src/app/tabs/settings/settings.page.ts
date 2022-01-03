import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Deploy } from 'cordova-plugin-ionic/dist/ngx';
import { BootService } from 'src/app/services/boot.service';
import { GlobalService } from 'src/app/services/global.service';
import { ScanService } from 'src/app/services/scan.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  updatePercentDone: number = 0

  constructor(
    private router: Router,
    public scanService: ScanService,
    public bootService: BootService,
    private globalService: GlobalService,
    private deploy: Deploy,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
  }

  // Lead the user to the terms and conditions page
  openTerms() {
    console.info ("--- openTerms ---")
    this.router.navigateByUrl('tabs/settings/terms');
  }

  // Log out the user from the app and erase user Credentials in Ionic local storage
  logout() {
    // Reset scanService attributes
    this.scanService.resetScanAttributes()

    // Logout from firebase and go to login page
    this.globalService.logout()
  }

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
}
