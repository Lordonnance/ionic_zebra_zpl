import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';
import { indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { BootService } from './services/boot.service';

import { Firestore, FirestoreSettings, enableIndexedDbPersistence, PersistenceSettings, initializeFirestore } from '@angular/fire/firestore';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private router: Router,
    private bootService: BootService,
    private firestore: Firestore,
    private platform: Platform
  ) {
    // Enable offline firestore persistence
    this.enableFirestorePersistence()

    // Start the navigation with the start and register screens
    this.router.navigateByUrl('start')

    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back button was called from component level !');
      console.log('this.router.url', this.router.url);

      if (
        this.router.url === "/tabs/list/profile" ||
        this.router.url === "/tabs/list/profile/tags" ||
        this.router.url === "/tabs/settings/terms"
      )
        processNextHandler()
    });

    // Initialize bootService
    this.bootService.init()
  }

  enableFirestorePersistence() {
    console.info ("--- enableFirestorePersistence ---")

    try {
      enableIndexedDbPersistence(this.firestore)
    } catch (error) {
      console.error ("Error enabling Firestore persistence")
      console.error (error.code)
      console.error (error)
      if (error.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
      } else if (error.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
      }
    }
  }
}
