import { Component, NgZone } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { GlobalService } from 'src/app/services/global.service';
import { ScanService } from 'src/app/services/scan.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage {
  loading: any = {};

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private firestore: Firestore,
    private globalService: GlobalService,
    public scanService: ScanService,
    private zone: NgZone,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  // Open the selected scan into the profile page
  /*
  openScan(id) {
    console.log ("--- openScan ---")

    this.scanService.selectedScanIndex = id;
    this.scanService.selectedScanData = JSON.parse(JSON.stringify(this.scanService.scansList[id]));
    console.log ("this.scanService.selectedScanData", this.scanService.selectedScanData)
    this.router.navigateByUrl('tabs/list/profile')
  }
  */

  // Lead the user to the about page
  goAbout() {
    this.router.navigateByUrl('about');
  }

  // Alert the user of a specific message
  async showAlert(msg) {
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

  async ionViewWillEnter() {
    /*
    this.loading = await this.loadingCtrl.create();
    this.zone.run(async () => {
      console.log("will enter")
      var isDuplicated = false;

      // Save the new scan on firestore
      if (this.globalService.NewlyScannedData != null) {
        
          // AVOID DUPLICATED SCAN
          // this.globalService.DataList.forEach(element => {
          //   if (element["id"] == this.globalService.NewlyScannedData["id"]) {
          //     isDuplicated = true;
          //     return;
          //   }
          // });
          // if (isDuplicated) {
          //   this.globalService.NewlyScannedData = null;
          //   this.showAlert('Vous avez déjà scanné ce visiteur.');
          // } else {
        

        if (this.globalService.NewlyScannedData["IsCorrect"]) {
          this.loading.present()
          delete this.globalService.NewlyScannedData["IsCorrect"]
          this.globalService.NewlyScannedData["isGuestScan"] = false
          this.globalService.NewlyScannedData["scanId"] = "" + (new Date()).getTime()

          try {
            this.firestore
            .collection("clients/" + environment.clientId + "/salons/" + this.globalService.currentSalonId + "/exposants/" + this.globalService.currentExposantId + "/scans")
            .doc(this.globalService.NewlyScannedData["scanId"])
            .set(this.globalService.NewlyScannedData)

            this.globalService.DataList.push(this.globalService.NewlyScannedData);
            this.globalService.DataList = this.globalService.DataList.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
            var index = this.globalService.DataList.findIndex((item, i) => {
              return item.id === this.globalService.NewlyScannedData["id"]
            });
            this.globalService.NewlyScannedData = null;
            this.loading.dismiss();
            this.openScan(index)
          } catch (error) {
            this.loading.dismiss();
            
            const scanError: any = {
              clientId: environment.clientId,
              salonId: this.globalService.currentSalonId,
              exposantId: this.globalService.currentExposantId,
              scanId: this.globalService.NewlyScannedData["scanId"],
              moment: "ionViewWillEnter() in listing.page.ts",
              errorFull: JSON.stringify(error),
              errorMessage: error.message,
              errorCode: error.code,
              timestamp: new Date(),
              scan: this.globalService.NewlyScannedData
            }
      
            if (typeof this.globalService.NewlyScannedData !== 'undefined' && typeof typeof this.globalService.NewlyScannedData.id !== 'undefined' && this.globalService.NewlyScannedData.id.length > 0) {
              this.firestore
              .collection("scanErrors")
              .doc(this.globalService.currentExposantId + "_" + this.globalService.NewlyScannedData.id)
              .set(scanError)
            } else if (typeof this.globalService.NewlyScannedData !== 'undefined' && typeof typeof this.globalService.NewlyScannedData.scanId !== 'undefined' && this.globalService.NewlyScannedData.scanId.length > 0) {
              this.firestore
              .collection("scanErrors")
              .doc(this.globalService.currentExposantId + "_" + this.globalService.NewlyScannedData.scanId)
              .set(scanError)
            } else {
              this.firestore
              .collection("scanErrors")
              .add(scanError)
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
        } else {
          this.globalService.NewlyScannedData = null;
          this.showAlert('Ce QR code est invalide');
        }
      }
    })
    */
  }
}
