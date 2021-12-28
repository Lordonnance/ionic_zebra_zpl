import { Injectable } from '@angular/core';
import { Device, DeviceId, DeviceInfo } from '@capacitor/device';
import { App, AppInfo } from '@capacitor/app';
import { ConnectionStatus, Network } from '@capacitor/network';
import { Observable, Subject } from 'rxjs';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class BootService {
  applicationVersion: string = "1.0.3"
  liveDeployVersion: string = "2"

  devicePlatform: string = "android"
  deviceUUID: string = ""

  networkStatus: ConnectionStatus = {} as ConnectionStatus
  networkSubject: Subject<ConnectionStatus> = new Subject()
  networkStatus$: Observable<ConnectionStatus> = this.networkSubject.asObservable()

  constructor(
    private globalService: GlobalService
  ) {

  }

  // Startup boot service
  init() {
    console.info ("--- bootService init ---")

    // PREVENTICA: Getting all salons for this client in firestore and filter for only opened salon
    this.globalService.getAllSalons()

    // Check Internet connection and observe any change on the connection status
    this.initNetworkMonitoring()

    // Get device platform and application version
    this.initDeviceInfo()
  }



  // Check Internet connection and observe any change on the connection status
  async initNetworkMonitoring() {
    console.info ("--- initNetworkMonitoring ---")

    // Initialize networkStatus value
    this.networkStatus = await Network.getStatus();
    console.log ("network status", this.networkStatus)
    this.networkSubject.next(this.networkStatus)

    // Listen for any networkStatus change (connection type, offline => online, ...)
    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      console.log("Network status changed", status)

      this.networkStatus = status
      this.networkSubject.next(status)
    });
  }

  // Get device platform and application version
  async initDeviceInfo() {
    console.info ("--- initDeviceInfo ---")

    // Read App version from App info
    const appInfo: AppInfo = await App.getInfo()
    console.log ("appInfo.version", appInfo.build)
    this.applicationVersion = appInfo.build + "." + this.liveDeployVersion

    // Get device platform Android || iOS || web || electron
    const deviceInfo: DeviceInfo = await Device.getInfo()
    console.log ("deviceInfo.platform", deviceInfo.platform)
    this.devicePlatform = deviceInfo.platform
    // Get device unique identifier
    const deviceId: DeviceId = await Device.getId()
    this.deviceUUID = deviceId.uuid
  }
}
