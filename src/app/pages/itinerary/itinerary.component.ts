import { ScheduleService } from "../../Services/schedule_api/schedule.service";
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
import axios from "axios";

import { AxiosRequestConfig } from "axios"; // Import AxiosRequestConfig type
import { environment } from "src/environments/environment";
import { Route, Router } from "@angular/router";
import * as CryptoJS from "crypto-js";
import { initializeApp } from '@angular/fire/app';
import { PackageService } from "src/app/Services/package/package.service";


declare const google: any;

interface activity {
  activity_name: string;
  activity_timeperiod: string;
  activity_timestamp: string;
  location: string;
}

interface Timestamp {
  _nanoseconds: number;
  _seconds: number;
}

interface day {
  Date: Timestamp;
  activities: activity[];
  dayNumber: 1;
}

interface property {
  checkInDate: string;
  checkOutDate?: string;
  numberOfNights: number;
  propertyNumber: number;
}

interface city {
  Properties: property[];
  cityDetails: {
    cityId: number;
    cityName: string;
    countryCode: string;
    temperature?: string;
    weather?: string;
  };
  days: day[];
}

interface room {
  ChildAge: number[];
  NoOfAdults: number;
  NoOfChild: number;
}

interface connection {
  currentCityAirportCode: string;
  currentCityName: string;
  efficientTransportMode: string;
  nextCityAirportCode: string;
  nextCityName: string;
  possibleTransportModes: string[];
  total_duration: number;
}

interface Document {
  // cities:city[];
  itineraryName: string;
  trip: {
    RoomGuests: room[];
    cities: string[];
    citiesArrivalDates: string[];
    connections: connection[];
    departure_airport: string;
    // departure_city:string
    end_date: string;
    nature_of_trip: string;
    numbers_of_days: number;
    start_date: string;
    suggestedDurationInCities: number[];
    travellers: {
      adultCount: number;
      // childAge:number[],
      childCount: number[];
      infantCount: number;
    };
  };
}

@Component({
  selector: "app-itinerary",
  templateUrl: "./itinerary.component.html",
  styleUrls: ["./itinerary.component.scss"],
})
export class ItineraryComponent implements OnInit, OnChanges {
  // global variable for the flights
  allFlights = [];
  flightTraceId: string;
  currentFlightSetIndex: string = null;

  // global variables for the hotels

  allHotels: any[] = [];
  resultCount: number = 5;
  gotAllHotels: boolean = false;

  currentCity: string | undefined;
  cities: any;

  docUid: string;

  document: Document;
  // document:any;

  // BOOLEAN VALUES
  document_available: boolean = false;
  gotAllFlights: boolean = false;

  constructor(
    private flightApiService: FlightsService,
    private hotels: HotelsService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private documentService: ScheduleService,
    private packageSerivce:PackageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.docUid = params.uid;

      if (this.docUid) {
        this.getDocument(this.docUid);

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

  async goToCheckout(event) {
    if (event) {

      // 1. to intitalize traveler array in backend in trip.travelers
      // 2. Flights -> result idx , trace Id 
      // 3. Hotels -> Hotel anme , hotel Code , rooms array , result idx , trace id

      console.log("CHECKING OUT TO PACKAGE BROOOOOOOOOOOOOOOOOOOOOOOOO");
      console.log(event);
      console.log(this.allSelectedHotels);
      console.log(this.currentFlightSet);

      const initializeTravelerArr=await this.packageSerivce.initializeTravelerArr(this.docUid);

      if(initializeTravelerArr){
        console.log(initializeTravelerArr.message)

        const flightDetails = [...this.currentFlightSet ];







      

      // const encryptedDocument = this.encryptObject(this.document);
      const encryptedHotels = this.encryptObject(this.allSelectedHotels);
      // Encrypt the object
     
      const flightTraceId = this.flightTraceId;
      const encryptedFlights = this.encryptObject({ flightDetails, flightTraceId });

      // sessionStorage.setItem("document", encryptedDocument);
      sessionStorage.setItem("hotels", encryptedHotels);
      sessionStorage.setItem("flights", encryptedFlights);

      this.router.navigate(["/package-checkout"]);
    }

    }
  }
  // to encrypt the data
  encryptObject(obj: any): string {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(obj),
      environment.ENCRYPT_KEY
    ).toString();
    return encrypted;
  }

  // to decrypt the data
  decryptObject(encryptedData: string): any {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      environment.ENCRYPT_KEY
    ).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  }

  //-----------------------------GLOBAL CALLS--------------------------------------------------

  async getDocument(docId: string) {
    try {
      const payload = {
        uid: docId,
        desiredFieldsArr: ["trip", "itineraryName"],
      };
      const { data } = await axios.post(
        `${environment.BACKEND_BASE_URL}/package/getPackageData`,
        payload
      );

      console.log(data.result);
      this.document = data.result;
      this.document_available = true;
      console.log("DOCUMent", this.document);
    } catch (err) {
      return err.message;
    }
  }
  getItineraryName() {
    return this.document.itineraryName;
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
      console.log(data)
      if(data.errorCode!==-1){
         console.error(data.errorMessage);
        return 
      }
      const endTime = performance.now(); // End measuring time
      const responseTime = endTime - startTime; // Calculate response time

      console.log("Response Time:", responseTime, "milliseconds");

      if (data.errorCode==-1) {
        this.flightTraceId = data.TraceId;
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
  currentFlightSet;
  getCurrentFlightSet(resultIdx: string) {
    const currentFlightSet = this.allFlights.filter(
      (flightSet) => flightSet.resultIndex === resultIdx
    );
    this.setFlightPublishedFare(currentFlightSet);
    this.setFlightsIncentive(currentFlightSet);
    return currentFlightSet;
  }

  // Flights functions
  gotCurrentFlightSetIdx(updatedFlightCurrentIdx) {
    console.log("got udated flight Idx");
    this.currentFlightSetIndex = updatedFlightCurrentIdx;
    this.currentFlightSet = this.getCurrentFlightSet(
      this.currentFlightSetIndex
    );
    return;
  }

  // Hotels functions
  allSelectedHotels = [];
  gotAllSelectedHotels(allHotels) {
    this.allSelectedHotels = allHotels;
    console.log(
      this.allSelectedHotels,
      "Got all the default hotels in itinerary"
    );

    this.setHotelPublishedFare(this.allSelectedHotels);
    this.setHotelIncentive(this.allSelectedHotels);
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

  HotelsPublishedFare: string = "calculating...";
  HotelsIncentive: string = "calculating...";

  setHotelPublishedFare(allSelectedHotels) {
    let totalPublishedFare = 0;
    allSelectedHotels.forEach((cityHotels) => {
      cityHotels.hotels.forEach((hotel) => {
        hotel.roomDetails.forEach((room) => {
          totalPublishedFare += room.room.Price.PublishedPriceRoundedOff;
        });
      });
    });
    this.HotelsPublishedFare = totalPublishedFare.toString();
    return;
  }

  setHotelIncentive(allSelectedHotels) {
    let totalIncentive = 0;
    allSelectedHotels.forEach((cityHotels) => {
      cityHotels.hotels.forEach((hotel) => {
        hotel.roomDetails.forEach((room) => {
          totalIncentive += room.room.Price.AgentCommission;
        });
      });
    });
    this.HotelsIncentive = totalIncentive.toString();
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
