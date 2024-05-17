import { Component, OnInit } from '@angular/core';
import {  Input, OnChanges, SimpleChanges, EventEmitter, Output  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Route, Router, } from "@angular/router";
import { Subject, debounceTime } from 'rxjs';
import { DebounceCallsService } from 'src/app/Services/DebounceCalls/debounce-calls.service';

@Component({
  selector: 'app-enq-multiway',
  templateUrl: './enq-multiway.component.html',
  styleUrls: ['./enq-multiway.component.scss']
})
export class EnqMultiwayComponent implements OnInit {

  @Input() enqCust:any;
  @Input() data: any;
  @Input() click:boolean;
  @Input() update:any

  selectedDateRange: any;
  dateRangeOptions: any = {
    autoApply: true,
    alwaysShowCalendars: true,
    opens: 'left'
    // You can customize options as needed
  };

  items: any[] = [
    { id: 1, content: 'Adult',    number:0 },
    { id: 2, content: 'Children', number:0 },
    { id: 3, content: 'Infant', number:0 },
   
    // Add more items as needed
  ]; 

 multicity:{merchantId:string,contactNumber:string, journeyType:string,fairType:string,numberOfTravellers:string[],dates:any,nationality:string,origin:string[],destinations:string[],interestLevel:string,enquiryDetails:string,followUpDate:string,remarks:string}={
    merchantId:"nvv",
		contactNumber:"",
		journeyType:"",
		fairType:"",
		numberOfTravellers:[],
		dates:"",
		nationality:"",
		origin:[],
		destinations:[],
		interestLevel:"",
		enquiryDetails:"",
		followUpDate:"",
		remarks:""
  }

  dis:boolean=false
  dis2:boolean=false
  Fair:string ="Regular Fair"

  datesEnq:string=""
  dis3:boolean=false
  private departureSearchSubject = new Subject<string>();
  private nationalitySearchSubject = new Subject<string>();
  private destinationSearchSubject = new Subject<string>();
  constructor(
   private http: HttpClient,
   private router: Router,
   private debounce: DebounceCallsService,
  ) { }

  userData:any

  ngOnInit(): void {
    this.userData=JSON.parse(localStorage.getItem("user-data"))

    console.log(this.enqCust);
    this.departureSearchSubject
    .pipe(
      debounceTime(500) // Adjust debounce time as needed (300 milliseconds in this example)
    )
    .subscribe(() => {
      this.onDepartureSearch();
    });
    this.destinationSearchSubject
      .pipe(
        debounceTime(500) // Adjust debounce time as needed (300 milliseconds in this example)
      )
      .subscribe(() => {
        this.onDestinationSearch();
      });

      this.nationalitySearchSubject
      .pipe(
        debounceTime(500) // Adjust debounce time as needed (300 milliseconds in this example)
      )
      .subscribe(() => {
        this.onNationalitySearch();
      });
    if(this.enqCust.numberOfTravellers!==undefined){
      this.multicity=this.enqCust
      this.items=this.enqCust.numberOfTravellers
      this.cities=this.enqCust.destinations
      this.originCities=this.enqCust.origin
      this.datesEnq=this.multicity.dates.startDate.slice(0,10)+" - "+this.multicity.dates.endDate.slice(0,10)
      console.log(this.datesEnq);
      this.datechng=false
      this.dateNew=this.multicity.dates
      
    }
  }
  dateNew:any

  ChngTraveller(item:any,x:string){
    if(x==="inc"){
      item.number+=1
    console.log(item.number);
    }
    if(x==="dec"){
      if(item.number>=1){
      item.number-=1
    console.log(item.number);
      }
      else{
        item.number=0
      }
    }
    
    
  }
  
  
  

  
  show(){
    this.dis=!this.dis
    console.log(this.dis);
    
  }
  div1(){
    this.dis2=!this.dis2
    console.log(this.dis2);
    
  }
  div2(){
    this.dis3=!this.dis3
    console.log(this.dis3);
    
  }

  fareType(fare:string){
    this.Fair=fare
  }

  origin:string=""
  originCities:any[]=[]

  arrival:string=""

  cities:any[]=[]

  flightCard:boolean=false

  addcity(){
    this.cities.push(this.arrival)
    this.originCities.push(this.origin)
    this.flightCard=true
    console.log(this.cities);
    
  }

  detail:string=""

  enqDetail(x:string){
      this.detail=x
   
  }

  intLevel:string=""

  interest(v:string){
   this.intLevel=v
  }

  submit(){
    
    this.multicity.fairType=this.Fair
    this.multicity.journeyType=this.data
    this.multicity.contactNumber=this.userData[0].contactNumber
    this.multicity.enquiryDetails=this.detail
    this.multicity.numberOfTravellers=this.items
    this.multicity.destinations=this.cities
    this.multicity.origin=this.originCities
    this.multicity.interestLevel=this.intLevel
    this.multicity.merchantId=this.userData[0].merchantId
    this.multicity.dates=this.dateNew

    console.log(this.multicity);
    
    this.postData(this.multicity)
  }

  

  async postData(data:any){
    try {
      const res= await this.http.post("http://localhost:4000/crm/flightsEnquiry", data).toPromise()

      console.log(res);
      this.router.navigate(['/customer'])
      
    } catch (error) {
      
    }
  }
  datechng:boolean=true
  dateReset(){
    this.datechng=!this.datechng
  }


  selectedCity;
  destination;

  selectedAirport
  guestNationality

  onCitySelect(airport: any): void {
    this.selectedCity = `${airport?.city_name}, ${airport?.iata}`;

    this.destination = airport?.iata;

    console.log(this.selectedCity);
    console.log(this.destination);
  }

  onAirportSelect(airport: any): void {
    // this.countryService.setSelectedAirport(airport?.cityName);
    this.selectedAirport = `${airport?.city || airport?.city_name}, ${
      airport?.iata
    }`;
    console.log(this.selectedAirport);
    // this.source = airport?.iata;
    // this.active = 4;
  }

  // to get the guest nationality
  onCountrySelect(event:any){
    this.guestNationality=event.country_code;
    console.log(this.guestNationality)
    console.log(event)
  }
  // DEPARTURE-----------------------------------

  departureSearchText: string;
  departureSearchAirports = [];

  async onDepartureSearch() {
    try {
      // Check if search text is null, empty, or whitespace
      if (!this.departureSearchText || this.departureSearchText.trim() === "") {
        // Clear search results
        this.departureSearchAirports = [];
        return; // Stop execution
      }
      console.log("Departure Search:", this.departureSearchText);

      const responseAirports = await this.debounce.getAirports(
        this.departureSearchText
      );

      console.log(responseAirports);
      if (responseAirports) {
        this.departureSearchAirports = responseAirports.data.airports;
      }
    } catch (err) {
      console.error(err.message);
    }
  }
  onDepartureInputChange(): void {
    this.departureSearchSubject.next(this.departureSearchText);
  }
  // DESTINATIONS---------------------------------------------

  destinationSearchText: string;
  destinationSearchAirports = [];

  async onDestinationSearch() {
    try {
      // Check if search text is null, empty, or whitespace
      if (
        !this.destinationSearchText ||
        this.destinationSearchText.trim() === ""
      ) {
        // Clear search results
        this.destinationSearchAirports = [];

        return; // Stop execution
      }
      console.log("Search in destination:", this.destinationSearchText);

      const responseAirports = await this.debounce.getAirports(
        this.destinationSearchText
      );

      console.log(responseAirports);

      this.destinationSearchAirports = responseAirports.data.airports;

      console.log(this.destinationSearchAirports);
    } catch (err) {
      console.error(err.message);
    }
  }
  onDestinationInputChange(): void {
    this.destinationSearchSubject.next(this.destinationSearchText);
  }

  // ==================================================

  
  nationalitySearchText: string;
  nationalitySearchArr = [];

  async onNationalitySearch() {
    try {
      // Check if search text is null, empty, or whitespace
      if (!this.nationalitySearchText || this.nationalitySearchText.trim() === "") {
        // Clear search results
        this.nationalitySearchArr = [];
        return; // Stop execution
      }
      console.log("Departure Search:", this.nationalitySearchText);

      const responseAirports = await this.debounce.getCountries(
        this.nationalitySearchText
      );

      console.log(responseAirports);
      if(responseAirports){
        this.nationalitySearchArr = responseAirports.data.countries;

      }
    } catch (err) {
      console.error(err.message);
    }
  }
  onNationalityInputChange(): void {
    this.nationalitySearchSubject.next(this.nationalitySearchText);
  }




  

}
