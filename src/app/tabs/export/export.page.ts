import { Component } from '@angular/core';
import { Functions, httpsCallable, HttpsCallableResult } from '@angular/fire/functions';
import { AlertController, LoadingController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-export',
  templateUrl: 'export.page.html',
  styleUrls: ['export.page.scss']
})
export class ExportPage {
  loading: any;

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public globalService: GlobalService,
    private functions: Functions) 
  {}

  // Export all the logged in exposant scans for the selected salon
  async exportSelectedSalonScans() {
    console.info ("--- exportSelectedSalonScans ---")
    this.loading = await this.loadingCtrl.create();
    this.loading.present();

    const callable = httpsCallable(this.functions, 'exportAllExposantScansCall');
    try {
      const results: HttpsCallableResult<any> = await callable({
        clientId: environment.clientId,
        exposantId: this.globalService.loggedInExposantData.id
      })

      console.log(JSON.stringify(results))
      this.loading.dismiss()

      if (results.data.success)
        this.alertSuccess();
      else
        this.showError(results.data.message)
    } catch (error) {
      console.log(error)
      this.loading.dismiss()
      this.showError("L'application éprouve des difficultés à accéder à Internet. Merci de vérifier votre connexion et de réessayer.")
    }

    /*
    callable({
      clientId: environment.clientId,
      exposantId: this.globalService.loggedInExposantData.id
    }).subscribe((result) => {
      console.log(result)
      this.loading.dismiss()

      if (result.success)
        this.alertSuccess();
      else
        this.showError(result.message)
    }, error => {
      console.log(error)
      this.loading.dismiss()
      this.showError("L'application éprouve des difficultés à accéder à Internet. Merci de vérifier votre connexion et de réessayer.")
      
      // if (error.code == "auth/network-request-failed")
      // else
        // this.showError(error.message)
    })
    */
  }
  async showError(msg) {
    const alert = await this.alertCtrl.create({
      header: "Problème lors de l'envoie de l'archive",
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }
  async alertSuccess() {
    const alert = await this.alertCtrl.create({
      header: 'Archive envoyée par e-mail',
      message: "Utilisez votre code exposant <strong>" + this.globalService.loggedInExposantData.code + "</strong> comme mot de passe afin de lire l'archive contenant les fiches d'information scannées.<br /><br />Pensez à vérifier vos spams et courriers indésirables en cas de non réception.",
      buttons: ['OK']
    });
    await alert.present();
  }
}
