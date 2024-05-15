import { ScheduleService } from '../../Services/schedule_api/schedule.service';
import { createUserWithEmailAndPassword } from "@angular/fire/auth";
import {
  Component,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import { FlightsService } from "src/app/Services/flights_api/flights.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HotelsService } from "src/app/Services/hotels_api/hotels.service";

import { ChangeDetectorRef } from "@angular/core";
import { CombinedItineraryComponent } from "src/app/components/combined-itinerary/combined-itinerary.component";
import { ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { addCommasIndianNumberSystem } from "src/app/helpers/utility.helper";
import axios from 'axios';

import { AxiosRequestConfig } from 'axios'; // Import AxiosRequestConfig type
import { environment } from 'src/environments/environment';

declare const google: any; 


interface activity{
  activity_name:string,
  activity_timeperiod:string,
  activity_timestamp:string,
  location:string
}

interface Timestamp {
  _nanoseconds: number;
  _seconds: number;
}

interface day{
  Date: Timestamp;
  activities:activity[];
  dayNumber:1
}

interface property{
  checkInDate:string;
  checkOutDate?:string;
  numberOfNights:number;
  propertyNumber:number
}

interface city{
  Properties:property[];
  cityDetails:{
    cityId:number,
    cityName:string,
    countryCode:string,
    temperature?:string,
    weather?:string
  };
  days:day[]
}

interface room{
  ChildAge:number[];
  NoOfAdults:number;
  NoOfChild:number
}

interface connection{
  currentCityAirportCode:string,
  currentCityName:string,
  efficientTransportMode:string,
  nextCityAirportCode:string,
  nextCityName:string,
  possibleTransportModes:string[],
  total_duration:number
}

interface Document{
  // cities:city[];
  itineraryName:string
  trip:{
    RoomGuests:room[],
    cities:string[],
    citiesArrivalDates:string[],
    connections:connection[],
    departure_airport:string,
    // departure_city:string
    end_date:string,
    nature_of_trip:string,
    numbers_of_days:number,
    start_date:string,
    suggestedDurationInCities:number[],
    travellers:{
      adultCount:number,
      // childAge:number[],
      childCount:number[],
      infantCount:number
    }
  }
}



@Component({
  selector: "app-itinerary",
  templateUrl: "./itinerary.component.html",
  styleUrls: ["./itinerary.component.scss"],
})
export class ItineraryComponent implements OnInit, OnChanges {
  
  // global variable for the flights
  allFlights = [];
  currentFlightSetIndex: string=null;


  // global variables for the hotels

  allHotels: any[] = [];
  resultCount: number = 5   ;
  gotAllHotels: boolean = false;


  currentCity: string | undefined;
  cities: any;

  docUid: string;

  document:Document;
  // document:any;

  // BOOLEAN VALUES
  document_available:boolean=false;
  gotAllFlights: boolean = false;

  constructor(
    private flightApiService: FlightsService,
    private hotels: HotelsService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private documentService:ScheduleService,
  ) {}

  ngOnInit(): void {

    this.route.params.subscribe((params) => {
     
      this.docUid = params.uid;
    
      if (this.docUid) {
        this.getDocument(this.docUid)

        this.getFlightsHotels(this.docUid);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.allFlights) {
      // console.log(changes.allFlights.currentValue);
    }
    if (changes.allHotels) {
      // console.log(changes.allHotels.currentValue);
    }
  }



  //-----------------------------GLOBAL CALLS-------------------------------------------------- 


 async getDocument(docId:string){
    
    try{
      const payload ={
        uid:docId,
        desiredFieldsArr:["trip","itineraryName"]    
      }
      const {data}=await axios.post(`${environment.BACKEND_BASE_URL}/package/getPackageData`,payload);
      
      
      console.log(data.result);
      this.document=data.result;
      this.document_available=true;
      console.log("DOCUMent",this.document);
    }
    catch(err){
      return err.message
    }
      
  }
  getItineraryName(){
      return this.document.itineraryName
  }

// not in use
  // async authenticateFlightApi() { 
  //   try{
  //      const {data} = await this.flightApiService.authenticate();

      
  //     localStorage.setItem("authenticateToken", data.token);
  //   }
  //   catch(err){
  //     console.error("Error occurred during authentication:", err);
  //   }
   

  //   // this.flightApiService.authenticate().subscribe(
  //   //   (data: { token: string }) => {
  //   //     console.log("Authentication successful. Token:", data.token);
  //   //     localStorage.setItem("authenticateToken", data.token);
  //   //   },
  //   //   (err) => {
  //   //     console.error("Error occurred during authentication:", err);
  //   //     console.log("Error occurred during authentication:", err); // Duplicate log for clarity
  //   //   }
  //   // );
  // }

    getFlightsHotels(docUid: string) {
    console.log("calls to flight and hotels have been made");
    this.multiStopSearchFlightsV2(docUid);
    this.getHotelData(docUid);
  }

  // FLIGHT Search Call
   async multiStopSearchFlightsV2(docUid) {
    try {
      const startTime = performance.now(); // Start measuring time
  
      const data = await this.flightApiService.multiStopSearchFlights(docUid);
  
      const endTime = performance.now(); // End measuring time
      const responseTime = endTime - startTime; // Calculate response time
  
      console.log("Response Time:", responseTime, "milliseconds");
  
      if (data) {
        this.allFlights = data.flightsData;
        console.log(this.allFlights, "ALL FLIGHTS");
        this.currentFlightSetIndex = this.allFlights[0].resultIndex;

        // this is used to set up flights published and incentive FARE
        this.getCurrentFlightSet(this.currentFlightSetIndex);

        this.gotAllFlights = true;
      }
    } catch (err) {
      console.log(err);
    }
  }
  

  // HOTEL Search Call
  async getHotelData(docUid) {
    try {
      const { fullJourneyHotels } = await this.hotels.getAllDetails(
        this.resultCount,
        docUid
      );
      console.log(fullJourneyHotels, "In component");
      this.allHotels = fullJourneyHotels;
      console.log(this.allHotels);
      this.gotAllHotels = true;
      // if (this.gotAllFlights && this.gotAllHotels) {
      //   this.spinner.hide();
      // }
    } catch (error) {
      console.log(error);
    }
  }
// --------------------------------------------------------------------------------------------

  getCurrentFlightSet(resultIdx: string) {
    const currentFlightSet = this.allFlights.filter(
      (flightSet) => flightSet.resultIndex === resultIdx
    );
    this.setFlightPublishedFare(currentFlightSet);
    this.setFlightsIncentive(currentFlightSet);
  }

  // Flights functions
  gotCurrentFlightSetIdx(updatedFlightCurrentIdx) {
    console.log("got udated flight Idx");
    this.currentFlightSetIndex = updatedFlightCurrentIdx;
    this.getCurrentFlightSet(this.currentFlightSetIndex);
    return;
  }

  // Hotels functions
  allSelectedHotels = [];
  gotAllSelectedHotels(allHotels) {
    this.allSelectedHotels = allHotels;
    console.log(this.allSelectedHotels,"Got all the default hotels in itinerary");
    
    this.setHotelPublishedFare(this.allSelectedHotels)
    this.setHotelIncentive(this.allSelectedHotels)
  }

  // ------------------------------Fare Summary CALLS--------------------------------------------
  
  flightPublishedFare: string = "calculating...";
  flightIncentive: string = "calculating...";

  // what i used to do
  // [flightIncentive]="gotAllFlights ? flightIncentive : 'calculating...' "

  setFlightPublishedFare(flightSet) {
    
    let publishedFare = flightSet[0].fare.PublishedFare.toString();
    this.flightPublishedFare = addCommasIndianNumberSystem(publishedFare);

    return;
  }

  setFlightsIncentive(flightSet) {

    const incentive = (
      flightSet[0].fare.CommissionEarned +
      flightSet[0].fare.IncentiveEarned +
      flightSet[0].fare.AdditionalTxnFeePub +
      flightSet[0].fare.PLBEarned
    ).toString();
    this.flightIncentive = addCommasIndianNumberSystem(incentive);

    return;
  }

  HotelsPublishedFare:string="calculating..."
  HotelsIncentive:string="calculating..."

  setHotelPublishedFare(allSelectedHotels){
    let totalPublishedFare=0;
    allSelectedHotels.forEach(cityHotels=>{
     
      cityHotels.hotels.forEach(hotel=>{
          hotel.roomDetails.forEach(room=>{
            totalPublishedFare+=room.room.Price.PublishedPriceRoundedOff;
          })
      })
    })
    this.HotelsPublishedFare=totalPublishedFare.toString();
    return;
  }

  
  setHotelIncentive(allSelectedHotels){

    let totalIncentive=0;
    allSelectedHotels.forEach(cityHotels=>{
     
      cityHotels.hotels.forEach(hotel=>{
          hotel.roomDetails.forEach(room=>{
            totalIncentive+=room.room.Price.AgentCommission;
          })
      })
    })
    this.HotelsIncentive=totalIncentive.toString();
    return;
  }



  // combinedHotelPublishedFare:number=0;
  // getHotelPublishedFare(){
  //   this.allSelectedHotels.forEach(city=>{
  //     city.hotels.forEach(property=>{
  //       // console.log(property.hotel.search.Price.PublishedPriceRoundedOff)
  //       this.combinedHotelPublishedFare+=property.hotel.search.Price.PublishedPriceRoundedOff;
  //       // console.log(this.combinedHotelPublishedFare)
  //     })
  //   })
  //       console.log(this.combinedHotelPublishedFare)

  //   return this.combinedHotelPublishedFare
  //   // console.log(this.combinedHotelPublishedFare)
  // }

  // @ViewChild('combinedItinerary') combinedItinerary: CombinedItineraryComponent;

  // finalFlightSetResultIdx:string;

  // triggerFlightEmitter(){
  //    // Call a method in Component B and get data
  //    const gotCurretnFlightResultIdx = this.combinedItinerary.currentFlightSetIndex;

  //    // Pass data to Component C
  //    this.finalFlightSetResultIdx = gotCurretnFlightResultIdx;

  // }
}