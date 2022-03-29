import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
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
    public globalService: GlobalService,
    private deploy: Deploy,
    private loadingCtrl: LoadingController,
    private alertController: AlertController
  ) {
    this.globalService.getAllSalons()
  }

  ngOnInit() {
  }

  // Lead the user to the terms and conditions page
  openTerms() {
    console.info ("--- openTerms ---")
    this.router.navigateByUrl('tabs/settings/terms');
  }

  openIntro() {
    console.info ("--- openIntro ---")
    this.router.navigateByUrl('intro');
  }

  // Log out the user from the app and erase user Credentials in Ionic local storage
  async logout() {
    console.info ("--- logout ---")

    const alert = await this.alertController.create({
      header: 'Déconnexion',
      message: 'Souhaitez-vous déconnecter votre compte exposant de l\'application ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Oui',
          id: 'confirm-button',
          handler: () => {
            console.log('Confirm Okay');
    
            // Reset scanService attributes
            this.scanService.resetScanAttributes()
        
            // Logout from firebase and go to login page
            this.globalService.logout()
          }
        }
      ]
    });

    await alert.present();
  }

  // Edit the commercial name used in all exports
  async editExposantName() {
    console.info ("--- editExposantName ---")

    const alert = await this.alertController.create({
      header: 'Nom utilisateur',
      inputs: [
        {
          name: 'exposantName',
          type: 'text',
          placeholder: 'Nom utilisateur',
          value: this.globalService.userCredentials.exposantName
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Enregistrer',
          handler: (alertData) => {
            console.log('Confirm Ok');
            console.log("exposantName", alertData.exposantName);
            this.globalService.userCredentials.exposantName = alertData.exposantName
            this.globalService.setCredentials(this.globalService.userCredentials)
          }
        }
      ]
    })

    alert.present()
  }

  // Downlaod, extract the new currently available version from AppFlow and reload the app
  async performAutomaticUpdate() {
    console.info ("--- performAutomaticUpdate ---")
    const loading = await this.loadingCtrl.create({message: "Téléchargement de la mise à jour"})
    await loading.present()

    try {
      this.globalService.setUpdateReady("true")

      const currentVersion = await this.deploy.getCurrentVersion();
      const resp = await this.deploy.sync({updateMethod: 'auto'}, percentDone => {
        console.log(`Update is ${percentDone}% done!`);
        this.updatePercentDone = percentDone
      });

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
