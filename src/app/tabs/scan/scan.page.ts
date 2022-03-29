import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { BootService } from 'src/app/services/boot.service';
import { ScanService } from 'src/app/services/scan.service';

@Component({
  selector: 'app-scan',
  templateUrl: 'scan.page.html',
  styleUrls: ['scan.page.scss']
})
export class ScanPage {
  constructor(
    private router: Router,
    private globalService: GlobalService,
    private bootService: BootService,
    private scanService: ScanService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {}

  // The scan will start directly
  // 1 - Check CAMERA permission
  // 2 - Hide the background in order to see the camera
  // 3 - Start looking for QRCodes
  async ionViewWillEnter() {
    console.info ("--- ionViewWillEnter ---")
    // let ionApp = <HTMLElement>document.getElementsByTagName("ion-content")[0];
    // ionApp.style.display = "none!important";

    // 0 - Prepare scan
    await BarcodeScanner.prepare()

    // 1 - Check CAMERA permission
    const status = await BarcodeScanner.checkPermission({force: true});
    console.log ("check permissions results", JSON.stringify(status))

    if ((status.asked && typeof status.granted === 'undefined' && typeof status.denied === 'undefined') || (typeof status.granted !== 'undefined' && !status.granted) || (typeof status.denied !== 'undefined' && status.denied)) {
      // the user denied permission for good
      // redirect user to app settings if they want to grant it anyway
      const c = confirm(
        'Merci d\'autoriser la caméra depuis les paramètres du téléphone si vous souhaitez scanner un badge',
      );
      if (c) {
        BarcodeScanner.openAppSettings();
      }
    } else {
      // PREVENTICA - Test if the device still have a valid license before scanning a new visitor
      if (!this.isLicenceActive()) {
        // Alert the user that his license is not valid anymore
        const alert = await this.alertCtrl.create({
          header: "License supprimée",
          message: "Merci de contacter votre responsable, votre licence d'utilisation a été retirée.",
          buttons: [
            {
              text: 'Me reconnecter',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');

                // Reset scanService attributes
                this.scanService.resetScanAttributes()
                
                // Logout the user
                this.globalService.logout()
              }
            }
          ]
        });
        await alert.present();
      } else {
        // Start looking for QR code badges
        this.scan()
      }
    }
  }

  // PREVENTICA - Test if the device still have a valid license before scanning a new visitor
  isLicenceActive(): boolean {
    console.info ("--- isLicenceActive ---")
    let isLicenceUsed: boolean = false

    this.globalService.loggedInExposantData.devices.forEach((device) => {
      if (device.uuid === this.bootService.deviceUUID) {
        isLicenceUsed = true
      }
    })

    return isLicenceUsed
  }

  // Start looking for QR code badges
  async scan() {
    console.info ("--- scan ---")

    // 1 - Make the body transparent with CSS for Dark Mode
    document.body.classList.add('qrscanner');

    // 2 - Hide the background in order to see the camera
    BarcodeScanner.hideBackground()

    // 3 - Start looking for QRCodes
    try {
      const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });
      console.log("SCANNED RESULT", JSON.stringify(result.content));
      if (result.hasContent) {
        console.log("QR CONTENT", result.content);

        // Parse the QRCode content
        const isScanCorrect: boolean = this.scanService.parseScan(result.content)
        if (isScanCorrect) {
          // Remove body transparenccy used for dark modes
          document.body.classList.remove('qrscanner');

          // Synchronize scan and redirect to profile page
          this.scanService.synchronizeAndOpenScan()
          // Go to profile page
          // this.router.navigateByUrl("tabs/list")
        } else {
          // Alert the user the scan is incorrect
          this.globalService.showAlert('Ce QR code est invalide');
          // Incorrect scan, do it again
          this.scan()
        }
      } else {
        // Alert the user the scan is incorrect
        this.globalService.showAlert('Ce QR code est invalide');
        // Incorrect scan, do it again
        this.scan()
      }
    } catch (error) {
      console.error ("Error starting scan, may CAMERA persmission")
      console.error(error)

      // Remove body transparenccy used for dark modes
      document.body.classList.remove('qrscanner');
    }
  }

  ionViewDidLeave() {
    // let ionApp = <HTMLElement>document.getElementsByTagName("ion-content")[0];
    // ionApp.style.display = "block";

    // Remove body transparenccy used for dark modes
    document.body.classList.remove('qrscanner');

    BarcodeScanner.showBackground()
    BarcodeScanner.stopScan()
  }
}
