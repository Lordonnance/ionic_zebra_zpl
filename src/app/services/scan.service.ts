import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { BootService } from './boot.service';
import { GlobalService } from './global.service';
import { Storage } from '@capacitor/storage';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ScanService {
  newlyScannedData: any = null

  scansList: any[] = []
  selectedScanData: any = null
  selectedScanIndex: number = -1

  constructor(
    private alertCtrl: AlertController,
    private bootService: BootService,
    private globalService: GlobalService,
    private firestore: Firestore,
    private router: Router
  ) { }

  // Save scans into local Storage
  setScansList() {
    Storage.set({key: "COMEXPOSIUM_SCANSLIST", value: JSON.stringify(this.scansList)})
  }

  // Parse QR code scan with correct decoding algorithm
  parseScan(content: string): boolean {
    console.info ("-- parseScan ---")

    // Get the scan position for this particular device based on DataList, the list of all scans
    let deviceTotalScans: number = 0
    this.scansList.forEach((scan) => {
      if (typeof scan.from.uuid != 'undefined' && scan.from.uuid == this.bootService.deviceUUID)
        deviceTotalScans++
    })

    let deviceFrom: any = {
      uuid: this.bootService.deviceUUID,
      name: this.globalService.userCredentials.exposantName,
      position: deviceTotalScans + 1
    }

    this.newlyScannedData = {
      "scanId": "",
      "companyId": "",
      "company": "",
      "companyAddress1": "",
      "companyAddress2": "",
      "companyAddressBp": "",
      "companyAddressZipcode": "",
      "companyAddressCity": "",
      "companyAddressCountry": "",
      "companyTypeCode": "",
      "companyTypeName": "",
      "companyEffectifSite": "",
      "companyEffectifGroup": "",
      "id": "",
      "visitorType": "",
      "lastname": "",
      "firstname": "",
      "visitorFunctionCode": "",
      "visitorFunctionName": "",
      "phone": "",
      "phoneMobile": "",
      "email": "",
      "tags": [],
      "comment": "",
      "rating": 0,
      "from": deviceFrom,
      "IsCorrect": true,
      "timestamp": new Date()
    }
    var strData = "";

    for (var i = 0; i < content.length; i++) {
      strData += String.fromCharCode(content.charCodeAt(i) - 3);
    }
    
    console.log("content after content.charCodeAt(i) - 3", strData);

    var res = strData.split("#");
    
    console.log("content split(#)", res);

    // Last array element is the "&&&" verification string
    if (res.length === 22) {
      this.newlyScannedData["id"] = res[0];
      this.newlyScannedData["companyId"] = res[1];
      this.newlyScannedData["company"] = res[2];
      this.newlyScannedData["companyAddress1"] = res[3];
      this.newlyScannedData["companyAddress2"] = res[4];
      this.newlyScannedData["companyAddressBp"] = res[5];
      this.newlyScannedData["companyAddressZipcode"] = res[6];
      this.newlyScannedData["companyAddressCity"] = res[7];
      this.newlyScannedData["companyAddressCountry"] = res[8];
      this.newlyScannedData["companyTypeCode"] = res[9];
      this.newlyScannedData["companyTypeName"] = res[10];
      this.newlyScannedData["companyEffectifSite"] = res[11];
      this.newlyScannedData["companyEffectifGroup"] = res[12];
      this.newlyScannedData["visitorType"] = res[13];
      this.newlyScannedData["lastname"] = res[14];
      this.newlyScannedData["firstname"] = res[15];
      this.newlyScannedData["visitorFunctionCode"] = res[16];
      this.newlyScannedData["visitorFunctionName"] = res[17];
      this.newlyScannedData["phone"] = res[18];
      this.newlyScannedData["phoneMobile"] = res[19];
      this.newlyScannedData["email"] = res[20];

      console.log(this.newlyScannedData)
      return true
    } else {
      this.newlyScannedData["IsCorrect"] = false;

      // Alert the user the scan is incorrect
      this.globalService.showAlert('Ce QR code est invalide');

      return false
    }
  }

  // Update local scans with firestore and set into Storage
  async synchronizeAndOpenScan() {
    console.info ("--- synchronizeAndOpenScan ---")

    delete this.newlyScannedData["IsCorrect"]
    this.newlyScannedData["scanId"] = "" + (new Date()).getTime()

    try {
      // Set the new scan data to Firestore
      const scanRef = doc(this.firestore, "clients/" + environment.clientId + "/salons/" + this.globalService.userCredentials.salonId + "/exposants/" + this.globalService.userCredentials.exposantId + "/scans/" + this.newlyScannedData["scanId"])
      setDoc(scanRef, this.newlyScannedData)

      // Set the new scan into local scansList array
      this.scansList.push(this.newlyScannedData);
      this.scansList = this.scansList.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
      var index = this.scansList.findIndex((item, i) => {
        return item.id === this.newlyScannedData["id"]
      });
      this.newlyScannedData = null;

      // Save scans into local Storage
      this.setScansList()

      // Open the selected scan into the profile page
      this.openScan(index)
    } catch (error) {      
      const scanError: any = {
        clientId: environment.clientId,
        salonId: this.globalService.userCredentials.salonId,
        exposantId: this.globalService.userCredentials.exposantId,
        scanId: this.newlyScannedData["scanId"],
        moment: "ionViewWillEnter() in listing.page.ts",
        errorFull: JSON.stringify(error),
        errorMessage: error.message,
        errorCode: error.code,
        timestamp: new Date(),
        scan: this.newlyScannedData
      }

      const scansErrorCollectionRef = collection(this.firestore, "scanErrors")
      const scanErrorDocumentRef = doc(this.firestore, "scanErrors/" + this.globalService.userCredentials.exposantId + "_" + this.newlyScannedData.scanId)
      if (typeof this.newlyScannedData !== 'undefined' && typeof typeof this.newlyScannedData.id !== 'undefined' && this.newlyScannedData.id.length > 0) {
        setDoc(scanErrorDocumentRef, scanError)
      } else if (typeof this.newlyScannedData !== 'undefined' && typeof typeof this.newlyScannedData.scanId !== 'undefined' && this.newlyScannedData.scanId.length > 0) {
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
  
  // Open the selected scan into the profile page
  openScan(scanIndex: number) {
    console.info("--- openScan ---")
    console.log("scanIndex", scanIndex)

    this.selectedScanIndex = scanIndex;
    this.selectedScanData = JSON.parse(JSON.stringify(this.scansList[scanIndex]));
    console.log ("this.scanService.selectedScanData", this.selectedScanData)
    this.router.navigateByUrl('tabs/list/profile')
  }
}
