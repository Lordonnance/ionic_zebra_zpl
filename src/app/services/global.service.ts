import { JsonPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Firestore, collection, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { Storage } from '@capacitor/storage';
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ScanService } from './scan.service';

export interface UserCredentials {
    salonId: string;
    exposantId: string;
    exposantName: string;
    pwd: string;
    email: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  versionNumber: string = "0.1.0"
  loggedInExposantData: any = {}
  userCredentials: UserCredentials = {} as UserCredentials

  salonsList: any[] = []
  selectedSalonId: string = ""
  tagsList: string[] = []

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private auth: Auth,
    private firestore: Firestore
  ) {}

  // Set logged in exposant data into local Storage  
  setLoggedInExposantData(exposantData) {
    this.loggedInExposantData = exposantData
    Storage.set({key: "COMEXPOSIUM_LOGGEDINEXPOSANTDATA", value: JSON.stringify(exposantData)})

    // Retreive exposant tags
    this.tagsList = (typeof exposantData.tags !== 'undefined' && exposantData.tags.length > 0) ? exposantData.tags : []
  }

  // Get logged in exposant data from local Storage  
  async getLoggedInExposantData() {
    const { value } = await Storage.get({key: 'COMEXPOSIUM_LOGGEDINEXPOSANTDATA'})
    return value
  }

  // Remove logged in exposant data from local Storage  
  async removeLoggedInExposantData() {
    await Storage.remove({key: 'COMEXPOSIUM_LOGGEDINEXPOSANTDATA'})
  }
  
  // Save user credentials in local storage for future login 
  setCredentials(userCredentials: UserCredentials) {
    this.userCredentials = userCredentials
    Storage.set({key: "COMEXPOSIUM_USERCREDENTIALS", value: JSON.stringify(userCredentials)})
  }

  // Get user credentials from local storage for future login  
  async getCredentials() {
    const { value } = await Storage.get({key: 'COMEXPOSIUM_USERCREDENTIALS'})
    return value
  }

  // Remove user credentials from local Storage  
  async removeCredentials() {
    await Storage.remove({key: 'COMEXPOSIUM_USERCREDENTIALS'})
  }

  // Select the latest open salon
  selectLatestOpenSalon() {
    this.selectedSalonId = this.loggedInExposantData.salonIds[0]
  }

  // PREVENTICA: Getting all salons for this client in firestore and filter for only opened salon
  async getAllSalons() {
    console.log("--- getAllSalons ---")
    console.log("clients/" + environment.clientId + "/salons/")
    this.salonsList = []
    const salonsRef = collection(this.firestore, "clients/" + environment.clientId + "/salons/")

    getDocs(salonsRef).then((querySalon) => {
      querySalon.forEach((salon) => {
        const newSalon = salon.data()
        // add the salon to the list if we are inside the opening time window
        const salonDateStart = new Date(newSalon.dateStart.seconds * 1000)
        const salonDateEnd = new Date(newSalon.dateEnd.seconds * 1000)
        const today = new Date()
        console.log ("salon city", newSalon.city)
        console.log ("salonDateStart", salonDateStart)
        console.log ("salonDateEnd", salonDateEnd)
        if (today >= salonDateStart && today <= salonDateEnd) {
          this.salonsList.push(
            { salonId: salon.id, id_salon: newSalon.code, city: newSalon.city, year: newSalon.year }
          )
        }
      });
      console.log("salonsList", this.salonsList)
    })
    .catch(function(error) {
      console.log("Erreur lors de la récupération des salons: ", error);
    });
  }

  // Update exposant available tags
  updateExposantTags(tags: Array<any>) {
    console.info("--- updateExposantTags ---")
    console.log ("tags", tags)

    let tagNames: Array<string> = []
    tags.forEach((tag) => {
      tagNames.push(tag.title)
    })

    const exposantRef = doc(this.firestore, "clients/" + environment.clientId + "/salons/" + this.userCredentials.salonId + "/exposants/" + this.userCredentials.exposantId)
    updateDoc(exposantRef, {tags: tagNames})
  }

  // Log out the user from the app and erase user Credentials in Ionic local storage
  async logout() {
    // 1 - Remove userCredantials from local storage
    await this.removeCredentials()
    await this.removeLoggedInExposantData()

    // 2 - Reset any loggedIn properties
    this.loggedInExposantData = {}
    this.userCredentials = {} as UserCredentials
    this.salonsList = []
    this.selectedSalonId = ""
    this.tagsList = []

    // 3 - Sign out from firebase authentication
    signOut(this.auth)

    // 4 - Redirect to login page
    this.router.navigateByUrl('login');
  }

  // Alert the user with a specific message
  async showAlert(msg) {
    console.info ("--- showAlert ---")

    const alert = await this.alertCtrl.create({
      header: "Erreur",
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
}
