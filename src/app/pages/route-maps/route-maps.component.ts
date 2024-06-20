import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-route-maps',
  templateUrl: './route-maps.component.html',
  styleUrls: ['./route-maps.component.scss']
})
export class RouteMapsComponent implements OnInit {

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  async ngAfterViewInit(): Promise<void> {
    const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

    const map = new Map(this.mapContainer.nativeElement, {
      center: { lat: 37.4239163, lng: -122.0947209 },
      zoom: 14,
      mapId: '4504f8b37365c3d0'
    });

    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: 37.4239163, lng: -122.0947209 },
    });
  }
}
