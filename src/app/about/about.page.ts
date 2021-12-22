import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../services/global.service';
import { ScanService } from '../services/scan.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

  constructor(
    private router: Router,
    public globalService: GlobalService,
    private scanService: ScanService
  ) { }

  ngOnInit() {}

  // Log out the user from the app and erase user Credentials in Ionic local storage
  logout() {
    // Reset scanService attributes
    this.scanService.resetScanAttributes()

    // Logout from firebase and go to login page
    this.globalService.logout()
  }
}
