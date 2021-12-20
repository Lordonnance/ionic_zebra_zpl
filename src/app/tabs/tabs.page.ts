import { Component } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor() {}

  // Enhance UX presenting barcode scanning to user (lowest preparation time)
  prepareScan() {
    console.info("--- prepareScan ---")
    BarcodeScanner.prepare()
  }
}
