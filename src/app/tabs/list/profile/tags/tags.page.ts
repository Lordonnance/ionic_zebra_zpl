import { Component, OnInit } from '@angular/core';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { ScanService } from 'src/app/services/scan.service';
import { environment } from '../../../../../environments/environment';
import { GlobalService } from '../../../../services/global.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.page.html',
  styleUrls: ['./tags.page.scss'],
})
export class TagsPage implements OnInit {
  tags: Array<any> = []
  SelectedOnes = []

  constructor(
    private alertCtrl: AlertController,
    private router: Router,
    private globalService: GlobalService,
    private scanService: ScanService,
    private firestore: Firestore) { }

  ngOnInit() {
    this.globalService.tagsList.forEach(tagName => {
      this.tags.push({ title: tagName, checked: false })
    });

    this.SelectedOnes = this.scanService.selectedScanData["tags"];
    this.SelectedOnes.forEach(element => {
      for (var i = 0; i < this.tags.length; i++) {
        if (element == this.tags[i]["title"]) {
          this.tags[i]["checked"] = true;
        }
      }
    });
  }

  // customLabelFunc(e) {
  //   e.preventDefault();
  //   alert('label clicked')
  // }

  // Add a new tag element into exposant firestore document
  async tagAdd() {
    const alert = await this.alertCtrl.create({
      header: 'Nouveau tag',
      inputs: [
        {
          name: 'Title',
          placeholder: 'Votre tag'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ajouter',
          handler: data => {
            if (data.Title != "") {
              this.tags.push({ title: data.Title, checked: false });
              this.globalService.updateExposantTags(this.tags)
            } else {
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // Update a tag element into firestore
  async tagEdit(index) {
    const alert = await this.alertCtrl.create({
      header: 'Modifier le tag',
      inputs: [
        {
          name: 'Title',
          placeholder: 'nouveau nom'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Modifier',
          handler: data => {
            if (data.Title != "") {
              this.tags[index]["title"] = data.Title
              this.globalService.updateExposantTags(this.tags)
            } else {
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // Delete a tag from exposant firestore document
  async tagDelete(index) {
    const alert = await this.alertCtrl.create({
      header: 'Suppression du tag ' + this.tags[index].title + " ?",
      message: 'Etes-vous sûr de vouloir supprimer ce tag ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Supprimer',
          handler: () => {
            this.tags.splice(index, 1);
            this.globalService.updateExposantTags(this.tags)
          }
        }
      ]
    });
    await alert.present();
  }

  // Set all selected tags to firestore scan document
  saveTags() {
    this.scanService.selectedScanData["tags"] = []
    for (var i = 0; i < this.tags.length; i++) {
      if (this.tags[i]["checked"])
        this.scanService.selectedScanData["tags"].push(this.tags[i]['title'])
    }

    // Update scan firestore document
    const scanRef = doc(this.firestore, "clients/" + environment.clientId + "/salons/" + this.globalService.userCredentials.salonId + "/exposants/" + this.globalService.userCredentials.exposantId + "/scans/" + this.scanService.selectedScanData["scanId"])
    updateDoc(scanRef, {tags: this.scanService.selectedScanData["tags"]})

    /*
    // Update local scans array and set in Storage
    // FIRESTORE PERSISENCE NO NEED TO KEEP A LOCAL COPY OF SCANS
    this.scanService.scansList[this.scanService.selectedScanIndex] = this.scanService.selectedScanData;
    this.scanService.setScansList();
    */

    // Go back Profile page
    this.router.navigateByUrl('tabs/list/profile');
  }
}
