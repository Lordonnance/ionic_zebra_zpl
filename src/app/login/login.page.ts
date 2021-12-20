import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';

import { Auth, signInWithEmailAndPassword, User, UserCredential } from '@angular/fire/auth';
import { Firestore, getDocs, collection, doc, getDoc, updateDoc, DocumentReference } from '@angular/fire/firestore';

import { GlobalService, UserCredentials } from 'src/app/services/global.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { BootService } from '../services/boot.service';
import { DevicesModalPage } from '../devices-modal/devices-modal.page';
// import { DevicesModalPage } from '../devices-modal/devices-modal.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loading: any;
  email: string = "ctest@yopmail.com";
  pwd: string = "comexposium";
  exposantName: string = "Commercial 1";
  // email: string = "neox_angelo@hotmail.com";
  // pwd: string = "preventica";
  salonId: string = "";
  // exposantid: string = "";

  // subscribeExposant: Subscription
  // subscribeSync: Subscription

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore,
    public globalService: GlobalService,
    private bootService: BootService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController
  ) {
    console.log ("--- LoginPage constructor ---")

    /*
    if (this.globalService.userInfo != null) {
      console.log ("userInfo", this.globalService.userInfo)
      this.email = this.globalService.userInfo["email"]
      this.pwd = this.globalService.userInfo["pwd"]
      this.exposantName = this.globalService.userInfo["exposantName"]
    }
    */
  }

  async ngOnInit() {
    console.log ("--- ngOnInit ---")
    this.loading = await this.loadingCtrl.create();

    // From AGII

    // Try login with remember data if any
    // const { value } = await Storage.get({key: 'AGII_USER_CREDENTIALS'})
    const userCredentialsStr: string = await this.globalService.getCredentials()
    const loggedInExposantData: string = await this.globalService.getLoggedInExposantData()
    if (
      userCredentialsStr != null &&
      loggedInExposantData != null
    ) {
      const userCredentials: UserCredentials = JSON.parse(userCredentialsStr)
      this.email = userCredentials.email
      this.pwd = userCredentials.pwd
      this.exposantName = userCredentials.exposantName
      this.salonId = userCredentials.salonId

      // The user is using valid credentials, stored in Storage
      // Proceed to home directly if Network connection if disabled
      console.log ("this.bootService.networkStatus.connected", this.bootService.networkStatus.connected)
      if (this.bootService.networkStatus.connected)
        this.login()
      else {
        console.warn ("The user has valid but unchecked credentials cause to Internet connection diabled")
      
        // Display a loading spinner pending user connection
        const loading = await this.loadingCtrl.create()
        await loading.present();

        // Set logged in expoant data into local Storage AND in globalService attribute
        this.globalService.setLoggedInExposantData(JSON.parse(loggedInExposantData)) 
        // Set user credentials into local Storage AND in globalService attribute
        this.globalService.setCredentials({'email': this.email, 'pwd': this.pwd, 'exposantName': this.exposantName, 'exposantId': userCredentials.exposantId, 'salonId': this.salonId})

        // Select the latest open salon
        // this.globalService.selectLatestOpenSalon()

        // ALREADY DONE - Save user credentials in local storage for future login
        // this.globalService.setCredentials({'email': this.email, 'pwd': this.pwd, 'exposantName': this.exposantName})

        setTimeout(() => {
          // Lead the user to the scans listing
          this.router.navigateByUrl('')
          // Close the pending message
          loading.dismiss()
        }, 2000)
      }
    }
  }

  // Proceed with login validation and authentication
  async login() {
    console.info ("--- login ---")
    let isSalonCorrect: boolean = false
    let firebaseUser: User = {} as User

    // Register form fields validation
    if (this.exposantName.length <= 0) {
      this.showDlg("Merci de rentrer votre nom qui sera associé à chacun de vos scans")
      return
    } else if (!this.validateEmail(this.email)) {
      this.showDlg("Merci de rentrer une adresse e-mail valide")
      return
    } else if (this.pwd.length < 5) {
      this.showDlg("Le mot de passe doit faire au moins 5 caractères")
      return
    } else if (this.salonId == "" && this.globalService.salonsList.length === 0) {
      this.showDlg("Aucun salon disponible actuellement")
      return
    } else if (this.salonId == "") {
      this.showDlg("Merci de sélectionner un salon")
      return
    }

    this.loading = await this.loadingCtrl.create();
    await this.loading.present();

    console.info ("Just before calling firebase auth method")

    try {
      const userCredentials: UserCredential = await signInWithEmailAndPassword(this.auth, this.email, this.pwd)
      firebaseUser = userCredentials.user
      console.log ("firebaseUser", JSON.stringify(firebaseUser))
    } catch(error) {
      this.loading.dismiss()
      console.log("Firebase auth error catched", error)
      console.log(error.code)
      if (error.code == "auth/invalid-email")
        this.showDlg("Merci de vérifier le format de votre adresse e-mail")
      else if (error.code == "auth/wrong-password")
        this.showDlg("Mot de passe incorrect");
      else if (error.code == "auth/network-request-failed")
        this.showDlg("L'application éprouve des difficultés à accéder à Internet. Merci de vérifier votre connexion et de réessayer.")
      else if (error.code == "auth/user-not-found")
        this.showDlg("Aucun compte rattaché à cette adresse e-mail");
      else
      this.showDlg("Nous n'arrivons pas à connecter votre compte. Merci de contacter le distributeur de l'application si le problème persiste.");

      return
    }

    console.info ("Just after calling firebase auth method and before firestore")

    // Comexposium : Get the exposant from client root directly != Preventica
    // const exposantRef = doc(this.firestore, "clients/" + environment.clientId + "/exposants/" + firebaseUser.uid)
    const exposantRef: DocumentReference = doc(this.firestore, "clients/" + environment.clientId + "/salons" + this.salonId + "/exposants/" + firebaseUser.uid)

    try {
      const exposantSnapshot = await getDoc(exposantRef)

      if (exposantSnapshot.exists()) {
        var exposantData: any = exposantSnapshot.data()
        console.log ("LoggedInExposantData", exposantData)

        // An exposant is registered in firestore for the given salon and client ids
        isSalonCorrect = true;

        // Save user credentials in local storage for future login
        this.globalService.setCredentials({'email': this.email, 'pwd': this.pwd, 'exposantName': this.exposantName, 'exposantId': exposantSnapshot.id, 'salonId': this.salonId})
        
        // PREVENTICA - Check if devices array includes deviceUUID  
        let deviceUUID: string = this.bootService.deviceUUID
        let isLicenceUsed: boolean = false
        
        exposantData.devices.forEach((device) => {
          if (device.uuid == deviceUUID)
            isLicenceUsed = true
        })
        console.log ("globalService.deviceName", this.exposantName)
        console.log ("isLicenceUsed", isLicenceUsed)

        if (isLicenceUsed || (!isLicenceUsed && exposantData.devices.length < exposantData.licencesTotal)) {
          if (!isLicenceUsed) {
            // Add the deviceName to the devices array and update firestore
            // const exposantData = await this.
            console.log ("Adding the device string to the exposant devices array")
            console.log ("exposant.id", exposantSnapshot.id)
            let newDevice: any = {
              uuid: deviceUUID,
              name: this.exposantName
            }
            exposantData.devices.push(newDevice)
            updateDoc(exposantRef, {"devices": exposantData.devices})
          }

          // Comexposium : NO DEVICES CHECK AND Check if the logged in exposant is at least registered to one salon
          // if (typeof exposantData.salonIds !== 'undefined' && exposantData.salonIds.length > 0) {}

          // Set logged in expoant data into local Storage
          this.globalService.setLoggedInExposantData(exposantData) 

          // COMEXPOSIUM - Select the latest open salon
          // this.globalService.selectLatestOpenSalon()

          // Synchronize local scans with firestore scans
          // this.globalService.syncData();

          // Lead the user to the scans listing
          this.router.navigateByUrl('');
        } else {
          if (exposantData.licences <= 0) {
            this.showDlg("Désolé, vous n'avez aucune licence pour ce salon... Merci de joindre le XX XX XX XX XX")
          } else {
            // Show modal with all registered devices to delete them
            const modal = await this.modalCtrl.create({
              component: DevicesModalPage,
              componentProps: {
                'devices': exposantData.devices,
                'exposantRef': exposantRef
              }
            });
            return await modal.present();

            /*
            this.modalCtrl.create({
              component: DevicesModalPage,
              backdropDismiss: false,
              componentProps: {
                devices: exposantData.devices,
                exposantRef: exposantRef
              }
            }).then((modal) => {
              modal.present();
            })
            */
          }
        }
      }
      this.loading.dismiss()

      if (!isSalonCorrect) {
        this.showDlg("Aucun salon enregistrée pour ce compte exposant")
      }
    } catch (error) {
      this.loading.dismiss()
      console.log("Firestore error", error)
      console.log(error.code)
      this.showDlg("Nous n'arrivons pas à connecter votre compte. Merci de contacter le distributeur de l'application si le problème persiste.");
      return
    }
  }

  async showDlg(msg) {
    const alert = await this.alertCtrl.create({
      header: "Problème de connexion",
      message: msg,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await alert.present();
  }

  // Show the user the application version in a dialog alert
  async showVersionNumber() {
    console.info ("--- showVersionNumber ---")

    const alert = await this.alertCtrl.create({
      header: "IRCI Preventica",
      message: "Version " + this.globalService.versionNumber,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await alert.present();
  }

  validateEmail(email) {
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return expression.test(email);
  }
}

