import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { EmailComposer, OpenOptions } from 'capacitor-email-composer';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { addDoc, collection, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { GlobalService } from 'src/app/services/global.service';
import { ScanService } from 'src/app/services/scan.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  // data = { ID: "12345", Company: "Company2", FirstName: "First2", LastName: "Last2", Email: "test@test.com", Phone: "21 54 87 50 01", Rating: 0, Comment: "", Tags: [], DateTime: 0 }
  tags = [];
  date = "";
  isLoggedIn = true;

  constructor(
    private navCtrl: NavController, 
    private alertCtrl: AlertController,
    private firestore: Firestore, 
    private globalService: GlobalService, 
    public scanService: ScanService, 
    public callNumber: CallNumber
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.scanService.selectedScanData = null;
    this.scanService.selectedScanIndex = -1;
  }

  ionViewWillEnter() {
    if (this.scanService.selectedScanData !== null) {
      var date = new Date(1000 * this.scanService.selectedScanData["timestamp"]["seconds"])
      this.date = "Scanné le " + this.pad(date.getDate()) + '/' + this.pad(date.getMonth() + 1) + " à " + this.pad(date.getHours()) + "h" + this.pad(date.getMinutes());
    }
    this.tags = this.globalService.tagsList;
  }

  // Open tags page
  goTags() {
    console.info ("--- goTags ---")
    this.navCtrl.navigateForward('tabs/list/profile/tags');
  }

  // Open email client on the phone with the profile email
  async openEmail() {
    console.log ("--- openEmail ---")
    console.log ("this.scanService.selectedScanData", this.scanService.selectedScanData)
    console.log ("Email to", this.scanService.selectedScanData["email"])

    try {
      const hasEmailAccount = await EmailComposer.hasAccount()
      console.log ("hasEmailAccount", hasEmailAccount)

      const emailSettings: OpenOptions = {
        to: [this.scanService.selectedScanData["email"]],
        cc: [],
        bcc: [],
        subject: '',
        body: '',
        isHtml: false
      };
      EmailComposer.open(emailSettings);
    } catch (error) {
      console.error ("Client email not found", error)
    }
  }

  // Call the profile phone number
  openPhone() {
    console.info("--- openPhone ---");
    this.callNumber.callNumber(this.scanService.selectedScanData["phone"], true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  // Call the profile mobile phone number
  openMobilePhone() {
    console.info("--- openMobilePhone ---");
    this.callNumber.callNumber(this.scanService.selectedScanData["phoneMobile"], true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  // The stars rating has been changed
  onStarRate(event) {
    console.log(event);
    this.scanService.selectedScanData["rating"] = event;
  }

  // Send the updated scan data to Firestore
  async updateScanData() {
    console.log ("--- updateScanData ---")
    console.log ("this.scanService.selectedScanData", this.scanService.selectedScanData)

    // const userCredentials: any = await this.globalService.loadCredentials()
    // console.log ("userCredentials", userCredentials)
    // if (userCredentials != null && typeof userCredentials.salonId != 'undefined') {}
    
    try {
      // Set the new scan data to Firestore
      const scanRef = doc(this.firestore, "clients/" + environment.clientId + "/salons/" + this.globalService.userCredentials.salonId + "/exposants/" + this.globalService.userCredentials.exposantId + "/scans/" + this.scanService.selectedScanData["scanId"])
      setDoc(scanRef, this.scanService.selectedScanData)
    
      /*
      // FIRESTORE PERSISENCE NO NEED TO KEEP A LOCAL COPY OF SCANS
      this.scanService.scansList[this.scanService.selectedScanIndex] = this.scanService.selectedScanData;
      this.scanService.setScansList();
      */
      this.navCtrl.navigateBack('tabs/list');
    } catch (error) {      
      const scanError: any = {
        clientId: environment.clientId,
        salonId: this.globalService.userCredentials.salonId,
        exposantId: this.globalService.userCredentials.exposantId,
        scanId: this.scanService.selectedScanData["scanId"],
        moment: "ionViewWillEnter() in listing.page.ts",
        errorFull: JSON.stringify(error),
        errorMessage: error.message,
        errorCode: error.code,
        timestamp: new Date(),
        scan: this.scanService.selectedScanData
      }

      const scansErrorCollectionRef = collection(this.firestore, "scanErrors")
      const scanErrorDocumentRef = doc(this.firestore, "scanErrors/" + this.globalService.userCredentials.exposantId + "_" + this.scanService.selectedScanData.scanId)
      if (typeof this.scanService.selectedScanData !== 'undefined' && typeof typeof this.scanService.selectedScanData.id !== 'undefined' && this.scanService.selectedScanData.id.length > 0) {
        setDoc(scanErrorDocumentRef, scanError)
      } else if (typeof this.scanService.selectedScanData !== 'undefined' && typeof typeof this.scanService.selectedScanData.scanId !== 'undefined' && this.scanService.selectedScanData.scanId.length > 0) {
        setDoc(scanErrorDocumentRef, scanError)
      } else {
        addDoc(scansErrorCollectionRef, scanError)
      }

      const alert = await this.alertCtrl.create({
        header: "Problème de synchronisation",
        message: "Nous avons été notifié du problème et essayons en ce moment de récupérer vos données.",
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

  // Zero padding  
  pad(num: number) {
    return num < 10 ? "0" + num : num;
  }
}