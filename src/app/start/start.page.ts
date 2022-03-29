import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../services/global.service';

import { Firestore, collection, collectionSnapshots } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';
import { BootService } from '../services/boot.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})

export class StartPage implements OnInit {
  constructor(
    private router: Router,
    private globalService: GlobalService,
    private bootService: BootService,
    private firestore: Firestore,
    private alertController: AlertController
  ) {
    console.log ("--- StartPage constructor ---")
  }

  /*
  async ngOnInit() {
    console.log ("--- ngOnInit ---")

    // Check Storage credentials for automatic login
    let userCredentials: any = await this.globalService.getCredentials()
    console.log ("userCredentials", userCredentials)
    if (userCredentials !== null) {
      // Login the exposant with saved user credentials
      this.router.navigateByUrl('login')
    }
  }
  */

  async ngOnInit() {
    console.log ("--- START ngOnInit ---")

    // Check if an update has been downloaded
    let isUpdateReady: string = await this.globalService.getUpdateReady()
    console.log ("isUpdateReady", isUpdateReady)
    if (
      isUpdateReady !== null &&
      JSON.parse(isUpdateReady) &&
      this.bootService.devicePlatform === 'ios'
    ) {
      this.globalService.setUpdateReady("false")
      // await this.deploy.reloadApp();

      // iOS alert the user he must quit and restart the app in order to apply the update
      const alert = await this.alertController.create({
        header: 'Mise à jour terminée',
        message: 'Vous pouvez quitter et relancer l\'application afin de l\'appliquer',
        backdropDismiss: false
      });

      await alert.present();
    } else {
      // Check Storage credentials for automatic login
      let userCredentials: any = await this.globalService.getCredentials()
      console.log ("userCredentials", userCredentials)
      if (userCredentials !== null) {
        // Login the exposant with saved user credentials
        // this.router.navigateByUrl('login', { id: heroId });
        this.router.navigateByUrl('login')
      }
    }
  }

  /*
  // Test firebase connection
  async test() {
    console.info ("test")
    // Comexposium : Get all exposants from client root directly != Preventica
    const exposants = collection(this.firestore, "clients/" + environment.clientId + "/exposants")
    collectionSnapshots(exposants).subscribe((exposants) => {
      console.info ("Just after calling firestore")
      exposants.forEach((exposant) => {
        console.log ("exposant", exposant.data())
      })
    },
    (error) => {
      console.log("Login error", error)
      console.log(error.code)
      if (error.code == "auth/invalid-email")
        console.log("Merci de vérifier le format de votre adresse e-mail")
      else if (error.code == "auth/wrong-password")
        console.log("Mot de passe incorrect");
      else if (error.code == "auth/network-request-failed")
        console.log("L'application éprouve des difficultés à accéder à Internet. Merci de vérifier votre connexion et de réessayer.")
      else if (error.code == "auth/user-not-found")
        console.log("Aucun compte rattaché à cette adresse e-mail");
      else
      console.log("Nous n'arrivons pas à connecter votre compte. Merci de contacter le distributeur de l'application si le problème persiste.");
    })
  }
  */


  // User clicked on "register" button => go to register page
  goToLogin() {
    console.info ("--- goToLogin ---")
    this.router.navigateByUrl('login')
  }
}
