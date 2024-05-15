import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsServiceService {

  constructor() { }

  loadMap(mapElement: HTMLElement): Observable<void> {
    const { Map } = window.google.maps;

    if (!Map) {
      return of(null); // Handle error if API not loaded
    }

    const position = { lat: -25.344, lng: 131.031 };
    const map = new Map(mapElement, {
      zoom: 4,
      center: position,
      mapId: 'DEMO_MAP_ID'
    });

    // Add marker logic here or in a separate method
    const marker = new window.google.maps.Marker({
      map: map,
      position: position,
      title: 'Uluru'
    });

    return of(null); // Observable to indicate completion (optional)
  }
}
