import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, onSnapshot, orderBy, query, setDoc, writeBatch } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { BootService } from './boot.service';
import { GlobalService } from './global.service';
// import { Storage } from '@capacitor/storage';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
// import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScanService {
  newlyScannedData: any = null
  justScanned: boolean = false

  scansList: any[] = []
  // scansList$: Observable<any>
  selectedScanData: any = null
  selectedScanIndex: number = -1

  // Firestore persistence indicators
  hasPendingWrites: boolean = true
  fromCache: boolean = true

  constructor(
    private alertCtrl: AlertController,
    private bootService: BootService,
    private globalService: GlobalService,
    private firestore: Firestore,
    private router: Router
  ) { }

  // Save scans into local Storage
  /*
  FIRESTORE PERSISENCE NO NEED TO KEEP A LOCAL COPY OF SCANS
  setScansList() {
    Storage.set({key: "PREVENTICA_SCANSLIST", value: JSON.stringify(this.scansList)})
  }
  */

  // Listen to scans change in firetore collection to get scan updates from other commercial users and also to fill in scans at startup
  async synchronizeScans() {
    console.log ("--- synchronizeScans ---")
    const batch = writeBatch(this.firestore)

    // Get realtime updates on the registered exposant session
    /*
    this.firestore
    .collection("clients/" + environment.clientId + "/salons/" + this.currentSalonId + "/exposants")
    .doc(this.currentExposantId)
    .valueChanges()
    .subscribe((exposant: any) => {
      console.log("SYNC EXPOSANT")
      console.log("exposant", exposant)
      this.syncedExposant = exposant
      this.tagsList = (typeof exposant.tags != 'undefined' && exposant.tags.length > 0) ? exposant.tags : []
    })
    */

    // 1 - Init local scans array from Storage
    // const { value } = await Storage.get({key: 'PREVENTICA_SCANSLIST'})
    // if (value !== null)
    //   this.scansList = JSON.parse(value)

    // 2 - Observe firestore scans collection this.firestore
    const scansCollectionRef = collection(this.firestore, "clients/" + environment.clientId + "/salons/" + this.globalService.userCredentials.salon.id + "/exposants/" + this.globalService.userCredentials.exposantId + "/scans")
    onSnapshot(query(scansCollectionRef, orderBy('scanId', 'desc')), { includeMetadataChanges: true },
    (firestoreScans) => {
      this.hasPendingWrites = firestoreScans.metadata.hasPendingWrites
      this.fromCache = firestoreScans.metadata.fromCache
      // console.log ("hasPendingWrites", this.hasPendingWrites)
      // console.log ("fromCache", this.fromCache)

      this.scansList = []
      firestoreScans.forEach((firestoreScan) => {
        // console.log ("scanId", firestoreScan.id)
        // console.log ("scan fromCache", firestoreScan.metadata.fromCache)
        let firestoreScanData: any = firestoreScan.data()
        firestoreScanData.metadata = firestoreScan.metadata
        // console.log ("scan hasPendingWrites", firestoreScanData.metadata.hasPendingWrites)
        this.scansList.push(firestoreScanData)
      })

      if (this.justScanned) {
        this.justScanned = false
        this.openScan(0)
      }     

      /*
      // FIRESTORE PERSISENCE NO NEED TO KEEP A LOCAL COPY OF SCANS
      // 2A - update local scans array with firestore scans
      firestoreScans.forEach((firestoreScan) => {
        const firestoreScanData: any = firestoreScan.data()
        let isNotFoundLocally: boolean = false

        // this.scansList.forEach((localScan: any) => {
        for (let s=0; s<this.scansList.length; s++) {
          if (firestoreScanData.scanId === this.scansList[s].scanId) {
            isNotFoundLocally = true
            break;
          }
        }

        if (!isNotFoundLocally) {
          console.log ("Scan ID is not found locally", firestoreScan.id)
          this.scansList.push(firestoreScanData)
        }
      })

      // 2B - Prepare batch writing to update Firestore scans collection with local unsychronized scans
      for (let s=0; s<this.scansList.length; s++) {
        let isScanSyncedWithFirestore: boolean = false

        // firestoreScans.forEach((firestoreScan) => {
        for (let f=0; f<firestoreScans.docs.length; f++) {
          const firestoreScanData: any = firestoreScans.docs[f].data()
          if (firestoreScanData.scanId === this.scansList[s].scanId) {
            isScanSyncedWithFirestore = true
            break;
          }
        }

        if (!isScanSyncedWithFirestore) {
          const scanDocumentRef = doc(this.firestore, "clients/" + environment.clientId + "/salons/" + this.globalService.userCredentials.salonId + "/exposants/" + this.globalService.userCredentials.exposantId + "/scans/" + this.scansList[s].scanId)
          console.log ("Scan ID is not synced", this.scansList[s].scanId)
          batch.set(scanDocumentRef, this.scansList[s]);
        }
      }

      batch.commit()

      // 3 - Save updated scans into local Storage
      this.setScansList()
      */
    },
    (error) => {
      console.error (error)
    })

    /*
    // Get anonymous scans from localStorage
    let guestScans: Array<any> = []
    this.DataList.forEach(scan => {
      // scan["scanId"] += "1"
      if (scan.isGuestScan)
        guestScans.push(scan)
    })
    console.log ("guestScans", guestScans)

    // Synchronize the guest scans firestore
    if (guestScans.length > 0) {
      var batch = this.firestore.firestore.batch();
      guestScans.forEach(guestScan => {
        guestScan.isGuestScan = false
        var scanRef = this.firestore.firestore.collection("clients/" + environment.clientId + "/salons/" + this.currentSalonId + "/exposants/" + this.currentExposantId + "/scans").doc(guestScan["scanId"])
        batch.set(scanRef, guestScan);
      })
      batch.commit()
    }
    */
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
      "salonId": this.globalService.userCredentials.salon.id,
      "salonCity": this.globalService.userCredentials.salon.city,
      "salonYear": this.globalService.userCredentials.salon.year,
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
      const scanRef = doc(this.firestore, "clients/" + environment.clientId + "/salons/" + this.globalService.userCredentials.salon.id + "/exposants/" + this.globalService.userCredentials.exposantId + "/scans/" + this.newlyScannedData["scanId"])
      setDoc(scanRef, this.newlyScannedData)
      this.newlyScannedData = null;

      // The scan will be open in the firestore onSnapshot listener on scans collection in scanService.synchronizeScans method
      this.justScanned =true
      // this.openScan(0)

      /*
      FIRESTORE PERSISENCE NO NEED TO KEEP A LOCAL COPY OF SCANS
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
      */
    } catch (error) {      
      const scanError: any = {
        clientId: environment.clientId,
        salonId: this.globalService.userCredentials.salon.id,
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

  // Reset scanService attributes before logout
  resetScanAttributes() {
    console.info("--- resetScanAttributes ---")
    
    this.scansList = []
    this.selectedScanData = null
    this.selectedScanIndex = -1
  }

  // Zero padding  
  pad(num: number) {
    return num < 10 ? "0" + num : num;
  }
}
