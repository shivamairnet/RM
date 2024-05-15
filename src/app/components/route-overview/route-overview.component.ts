import { Component, Input, OnInit } from '@angular/core';
import { HotelsService } from 'src/app/Services/hotels_api/hotels.service';


interface connection{
  currentCityAirportCode:string,
  currentCityName:string,
  efficientTransportMode:string,
  nextCityAirportCode:string,
  nextCityName:string,
  possibleTransportModes:string[],
  total_duration:number
}
interface Connections{
  connections:connection[]
}

@Component({
  selector: 'app-route-overview',
  templateUrl: './route-overview.component.html',
  styleUrls: ['./route-overview.component.scss']
})
export class RouteOverviewComponent implements OnInit {

  @Input() connections:Connections;
  @Input() cities:string[];
  @Input() departureCity:string;

  constructor( ) { }

  ngOnInit(): void {
  }

 
}
