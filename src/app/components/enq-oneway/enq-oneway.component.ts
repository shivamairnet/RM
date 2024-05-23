import { Component, OnInit } from '@angular/core';
import {  Input, OnChanges, SimpleChanges, EventEmitter, Output  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Route, Router, } from "@angular/router";
import { DebounceCallsService } from 'src/app/Services/DebounceCalls/debounce-calls.service';
import { Subject, debounceTime } from 'rxjs';
import { CrmServiceService } from 'src/app/Services/CRM/crm-service.service';


interface Departure{
  alternatenames:string[],
  city_id:number,
  city_name:string,
  country_code:string,
  country_id:number,
  nationality:string[],
  state_code:string[],
  state_name:string,
  departureType:string,
}
interface Destination{
  alternatenames:string[],
  city_id:number,
  city_name:string,
  country_code:string,
  country_id:number,
  nationality:string[],
  state_code:string[],
  state_name:string,
  destinationType:string,
}

interface Payload{merchantId:string,contactNumber:string, journeyType:string,fairType:string,numberOfTravellers:string[],departureDate:string,nationality:string,origin:Departure,destinations:Destination[],interestLevel:string,enquiryDetails:string,followUpDate:string,remarks:string}

@Component({
  selector: 'app-enq-oneway',
  templateUrl: './enq-oneway.component.html',
  styleUrls: ['./enq-oneway.component.scss']
})
export class EnqOnewayComponent implements OnInit {

  // one-way round or multi
  @Input() data: any;

  @Input() click:boolean;

  @Input() enqCust:any;

  @Input() update:any


  items:any[] = [
    { id: 1, content: 'Adult',    number:0 },
    { id: 2, content: 'Children', number:0 },
    { id: 3, content: 'Infant', number:0 },
   
    // Add more items as needed
  ]; 
  

  oneway:Payload={
    merchantId:"nvv",
		contactNumber:"",
		journeyType:"",
		fairType:"",
		numberOfTravellers:[],
		departureDate:"",
		nationality:"",
		origin:null,
		destinations:[],
		interestLevel:"",
		enquiryDetails:"",
		followUpDate:"",
		remarks:""
  }

  private departureSearchSubject = new Subject<string>();
  private nationalitySearchSubject = new Subject<string>();
  private destinationSearchSubject = new Subject<string>();

  showNumberOfTravellers:boolean=false
  showFareType:boolean=false
  fair:string ="Regular Fair"
  userData:any

  constructor(
   private http: HttpClient,
   private router:Router,
   private debounce: DebounceCallsService,
   private crmService:CrmServiceService
  ) { }


  ngOnInit(): void {
    this.userData=JSON.parse(localStorage.getItem("customer-details"));

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


      // to get back to enquiry
    if(this.enqCust){
      if(this.enqCust.numberOfTravellers!==undefined){
        this.items=this.enqCust.numberOfTravellers
      this.fair=this.enqCust.fairType
      console.log(this.enqCust.destinations[0]);
      this.selectedDestination=this.enqCust.destinations
      this.oneway=this.enqCust
      }
    }
    
   
  }
 
  triggerShowFareType(){
    this.showFareType=!this.showFareType
    console.log(this.showFareType);
    
  }

  fareType(fare:string){
    this.fair=fare
  }

  triggerShowNumberOfTravellers(){
    this.showNumberOfTravellers=!this.showNumberOfTravellers
    console.log(this.showNumberOfTravellers);
    
  }

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



  // follow up or dont follow up
  detail:string=""
  enqDetail(x:string){
      this.detail=x
  }
  // high moderate low
  intLevel:string=""
  interest(v:string){
   this.intLevel=v
  }



  selectedDeparture:Departure;
  onDepartureSelect(departure: Departure, departureType: number): void {
    // if departureType == 1  --> airport is selected
    // if departureType == 2  --> city is selected
    if (departureType == 1){
      this.selectedDeparture = { ...departure, departureType: "airport" };}
    else if (departureType == 2){
      this.selectedDeparture = { ...departure, departureType: "city" };
    }
    console.log(this.selectedDeparture);
  }

  selectedDestination:Destination[];
  onDestinationSelect(destination: Destination, destinationType: number): void {
     // if departureType == 1  --> airport is selected
    // if departureType == 2  --> city is selected

    if (destinationType == 1){
       this.selectedDestination = [{ ...destination, destinationType:"airport" }];}
    else if (destinationType == 2){
      this.selectedDestination = [{ ...destination,  destinationType:"airport" }];
    }
    console.log(this.selectedDestination);

  }

  guestNationality
  onCountrySelect(country:any){
    this.guestNationality=country;
  
  }


  // ================DEPARTURE-----------------------------------
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


  //================= DESTINATIONS---------------------------------------------
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


  // ==================NATIONALITY==========================================
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

      const responseCountries = await this.debounce.getCountries(
        this.nationalitySearchText
      );

      console.log(responseCountries);
      if(responseCountries){
        this.nationalitySearchArr = responseCountries.data.countries;
      }
    } catch (err) {
      console.error(err.message);
    }
  }
  onNationalityInputChange(): void {
    this.nationalitySearchSubject.next(this.nationalitySearchText);
  }



  loginAndUpdateEnquiry(){

    this.oneway.contactNumber=this.userData.contactNumber
    this.oneway.merchantId=this.userData.merchantId
    
    this.oneway.journeyType=this.data
    this.oneway.fairType=this.fair
    this.oneway.numberOfTravellers=this.items

    this.oneway.origin=this.selectedDeparture
    this.oneway.destinations=this.selectedDestination;

    this.oneway.enquiryDetails=this.detail
    this.oneway.interestLevel=this.intLevel

    console.log(this.oneway);
    
    this.postData(this.oneway)
  }

  async postData(data:Payload){
    try {

      const res=await this.crmService.registerFlightsEnquiry(data);

      if(res.success){
       this.router.navigate(['/customer'])

      }else{
        console.error("Error occured")
      }
      
    } catch (error) {
        console.log(error.message)
    }
  }
  


  
}
