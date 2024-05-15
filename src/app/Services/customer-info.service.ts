import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomerInfoService {

  userData: any;

  setUserData(userData: any) {
    this.userData = userData;
  }

  getUserData() {
    return this.userData;
  }

  constructor() { }
}
