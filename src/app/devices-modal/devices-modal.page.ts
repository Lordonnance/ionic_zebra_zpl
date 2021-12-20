import { Component, Input, OnInit } from '@angular/core';
import { Firestore, DocumentReference, updateDoc } from '@angular/fire/firestore';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-devices-modal',
  templateUrl: './devices-modal.page.html',
  styleUrls: ['./devices-modal.page.scss'],
})
export class DevicesModalPage implements OnInit {
  @Input() devices: Array<string>
  @Input() exposantRef: DocumentReference

  constructor(
    private fireStore: Firestore,
    public globalService: GlobalService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    public navParam: NavParams
  ) {
    // this.devices = this.navParam.get("devices")
    // this.exposantRef = this.navParam.get("exposantRef")

    console.log ("devices", this.devices)
    console.log ("exposantRef path", this.exposantRef.path)
  }

  async removeDevice(deviceIndex: number) {
    console.log ("--- removeDevice ---")
    console.log ("deviceIndex", deviceIndex)
    console.log ("devices", this.devices)

    // LoadingController to show a time demanding feature to the user
    let loading = await this.loadingCtrl.create();
    loading.present();

    // Remove the device from the local devices array
    this.devices.splice(deviceIndex, 1)
    console.log ("devices", this.devices)
    
    // Update the exposant firestore document
    updateDoc(this.exposantRef, {"devices": this.devices})

    loading.dismiss()

    this.close()
  }

  close(): void {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  ngOnInit() {
  }

}
