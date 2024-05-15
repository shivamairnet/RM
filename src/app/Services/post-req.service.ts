import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CountriesService } from "./countries.service";
import { combineLatest, map } from "rxjs";
import { ToastrService } from "ngx-toastr";

import { forkJoin } from "rxjs";
import axios from "axios";
import { environment } from "src/environments/environment";

interface Connection {
  transportMode: string;
  currentCityAirportCode: string;
  nextCityAirportCode: string;
  totalDurationOfTravelInMinutes: number;
}

interface Itinerary {
  suggestedDurationInCities: number[];
  connections: Connection[];
  city_utc_offsets: any[];
}
@Injectable({
  providedIn: "root",
})
export class PostReqService {
  constructor(
    private http: HttpClient,
    private countriesService: CountriesService,
    private toast: ToastrService
  ) {}

  trip;

  suggestedDurationInCities: any = [];
  cities;
  connections: Connection[] = [];

  finalItineraryArr = [];
  finalItineraryObject = {};

  citiesArrivalDates = [];
 

  // --------------------------------Helper functions-------------------------------------------------------------
  calculateArrivalDateTimeWithTimezone(startDate, city1Offset, city2Offset) {
    // console.log({
    //   "startDate":startDate,
    //   "city1Offset":city1Offset,
    //   "city2Offset":city2Offset
    // })
    // Calculate time difference between city1 and city2 in milliseconds
    const timeDifference = (parseInt( city2Offset.UTC_offset) -parseInt( city1Offset.UTC_offset))*60 * 60 * 1000;

    // console.log(timeDifference,"calculated timediffernce");

    // console.log(startDate.getTime(),"startDate ka time in miliseconds")
    // Adjust the start date according to the time difference
    const arrivalDateTime = new Date(startDate.getTime() + timeDifference);

    // console.log(arrivalDateTime,"dateTime after adding teh timeZone effect")
    // If the time difference results in a change of date, adjust the date accordingly
    // const currentDay = startDate.getDate();
    // const arrivalDay = arrivalDateTime.getDate();
    // if (currentDay !== arrivalDay) {
    //     // Adjust the date to match the arrival day
    //     arrivalDateTime.setDate(currentDay);
    // }

    return arrivalDateTime;
}


  dateAfterAddingTravel(givenStartDate: string, utcOffsets: number[]) {
    let startDate;
    // console.log(givenStartDate, "start date at the star tof the trip")
    this.connections.forEach((ele, idx) => {
      if (idx === 0) {
        const dateComponents = givenStartDate.split("-");
        const y = parseInt(dateComponents[0], 10);
        const m = parseInt(dateComponents[1], 10) - 1;
        const d = parseInt(dateComponents[2], 10);
        startDate = new Date(y, m, d, 12, 0, 0, 0); // Set time to 12 PM
        // console.log("start date whe nidx==0",startDate);
      } else {
        startDate = new Date(this.citiesArrivalDates[idx - 1]);
        startDate.setDate(
          startDate.getDate() + this.suggestedDurationInCities[idx - 1]
        );
        startDate.setHours(12, 0, 0, 0); // Set time to 12 PM
        // console.log("start date when idx !== 0",startDate);
        // console.log("number of days stayed in previous city",this.suggestedDurationInCities[idx - 1])

      }

         const hoursToAdd = Math.floor((startDate.getHours() - 12) );
         const totalMinutes =
           startDate.getMinutes() +
           ele.totalDurationOfTravelInMinutes +
           hoursToAdd * 60;
     
         startDate.setHours(startDate.getHours() + Math.floor(totalMinutes / 60));
         startDate.setMinutes(totalMinutes % 60);
     
         // Check if hours exceed 24, and add to the date
         if (startDate.getHours() >= 24) {
           startDate.setDate(
             startDate.getDate() + Math.floor(startDate.getHours() / 24)
           );
           startDate.setHours(startDate.getHours() % 24);
         }

        //  console.log({" date after adding the flight duration":startDate,
        //  "flightSuration":ele.totalDurationOfTravelInMinutes
        // })

       
    

      // Calculate arrival date and time
      let arrivalDateTime;
      if (idx >= this.connections.length - 1) {
        // Last connection, use the first UTC offset again\
      
        // console.log("called last connection")
        // console.log({
        //   "first":utcOffsets[idx],
        //   "second":utcOffsets[0]
        // })
        arrivalDateTime = this.calculateArrivalDateTimeWithTimezone(
          startDate,
          utcOffsets[idx],
          utcOffsets[0]
        );
      } else {
        arrivalDateTime = this.calculateArrivalDateTimeWithTimezone(
          startDate,
          utcOffsets[idx],
          utcOffsets[idx + 1]
        );
      }


      // Format arrival date and time
      const year = arrivalDateTime.getFullYear();
      const month = arrivalDateTime.getMonth() + 1;
      const day = arrivalDateTime.getDate();
      const hours = arrivalDateTime.getHours();
      const minutes = arrivalDateTime.getMinutes();

      const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")} ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

        // console.log("end result after all steps" , formattedDate)
        this.citiesArrivalDates.push(formattedDate);
    });

    // console.log(this.citiesArrivalDates);
    return ;
  }
  // ---------------------------------------------------------------------------------------------------
 

  async buildMyItinerary(){
    console.log("call recieved to build itinerary")
    const storedData = window.sessionStorage.getItem("myData");

    if(storedData){
      const parsedData = JSON.parse(storedData);

      const payload={
        formData:parsedData
      }

      try{

        const {data}=await axios.post(`${environment.BACKEND_BASE_URL}/itinerary/getFullItinerary`,payload);
        
        if(data){
          console.log(data);

          this.countriesService.setResponseData(data);
        }else{
          console.log("did not recieved any itinerary data from backend")
        }
      }
      catch(error){
        return "Unable to make an itinerary "
      }

    }


  }


}
