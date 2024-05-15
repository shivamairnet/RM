import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';

@Component({
  selector: 'app-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss']
})
export class GoogleMapsComponent implements OnInit {


  @Input() latitude;
  @Input() longitude

  constructor() {}

  ngOnInit() {
    this.initMap();
  }
   map: google.maps.Map;
   async  initMap(): Promise<void> {
    // The location of Uluru
    const position = { lat: parseInt(this.latitude), lng: parseInt(this.longitude) };
  
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
  
    // The map, centered at Uluru
    this.map = new Map(
      document.getElementById('map') as HTMLElement,
      {
        zoom: 13,
        center: position,
        mapId: 'DEMO_MAP_ID',
      }
    );
  
    // The marker, positioned at Uluru
    const marker = new AdvancedMarkerElement({
      map: this.map,
      position: position,
      title: 'Uluru'
    });
  }

}
