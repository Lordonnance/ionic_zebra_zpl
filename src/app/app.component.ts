import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';
import { indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { environment } from 'src/environments/environment';
import { BootService } from './services/boot.service';

import { Firestore, FirestoreSettings, enableIndexedDbPersistence, PersistenceSettings, initializeFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private router: Router,
    private bootService: BootService,
    private firestore: Firestore
  ) {
    // Enable offline firestore persistence
    this.enableFirestorePersistence()

    // Capcitor apps require special AngularFire initialization code
    /*
    console.log ("Before initializeApp")
    const app = initializeApp(environment.firebase);
    if (Capacitor.isNativePlatform) {
      console.log ("After initializeApp")
      initializeAuth(app, {
        persistence: indexedDBLocalPersistence
      });
    }
    */

    // Start the navigation with the start and register screens
    this.router.navigateByUrl('start')

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
