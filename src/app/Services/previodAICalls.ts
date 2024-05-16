// import { HttpClient, HttpHeaders } from "@angular/common/http";
// import { Injectable } from "@angular/core";
// import { CountriesService } from "./countries.service";
// import { combineLatest, map } from "rxjs";
// import { ToastrService } from "ngx-toastr";

// import { forkJoin } from "rxjs";
// import axios from "axios";
// import { environment } from "src/environments/environment";

// interface Connection {
//   transportMode: string;
//   currentCityAirportCode: string;
//   nextCityAirportCode: string;
//   totalDurationOfTravelInMinutes: number;
// }

// interface Itinerary {
//   suggestedDurationInCities: number[];
//   connections: Connection[];
//   city_utc_offsets: any[];
// }
// @Injectable({
//   providedIn: "root",
// })
// export class PostReqService {
//   constructor(
//     private http: HttpClient,
//     private countriesService: CountriesService,
//     private toast: ToastrService
//   ) {}

//   trip;

//   suggestedDurationInCities: any = [];
//   cities;
//   connections: Connection[] = [];

//   finalItineraryArr = [];
//   finalItineraryObject = {};

//   citiesArrivalDates = [];
 

//   // --------------------------------Helper functions-------------------------------------------------------------
//   calculateArrivalDateTimeWithTimezone(startDate, city1Offset, city2Offset) {
//     // console.log({
//     //   "startDate":startDate,
//     //   "city1Offset":city1Offset,
//     //   "city2Offset":city2Offset
//     // })
//     // Calculate time difference between city1 and city2 in milliseconds
//     const timeDifference = (parseInt( city2Offset.UTC_offset) -parseInt( city1Offset.UTC_offset))*60 * 60 * 1000;

//     // console.log(timeDifference,"calculated timediffernce");

//     // console.log(startDate.getTime(),"startDate ka time in miliseconds")
//     // Adjust the start date according to the time difference
//     const arrivalDateTime = new Date(startDate.getTime() + timeDifference);

//     // console.log(arrivalDateTime,"dateTime after adding teh timeZone effect")
//     // If the time difference results in a change of date, adjust the date accordingly
//     // const currentDay = startDate.getDate();
//     // const arrivalDay = arrivalDateTime.getDate();
//     // if (currentDay !== arrivalDay) {
//     //     // Adjust the date to match the arrival day
//     //     arrivalDateTime.setDate(currentDay);
//     // }

//     return arrivalDateTime;
// }


//   dateAfterAddingTravel(givenStartDate: string, utcOffsets: number[]) {
//     let startDate;
//     // console.log(givenStartDate, "start date at the star tof the trip")
//     this.connections.forEach((ele, idx) => {
//       if (idx === 0) {
//         const dateComponents = givenStartDate.split("-");
//         const y = parseInt(dateComponents[0], 10);
//         const m = parseInt(dateComponents[1], 10) - 1;
//         const d = parseInt(dateComponents[2], 10);
//         startDate = new Date(y, m, d, 12, 0, 0, 0); // Set time to 12 PM
//         // console.log("start date whe nidx==0",startDate);
//       } else {
//         startDate = new Date(this.citiesArrivalDates[idx - 1]);
//         startDate.setDate(
//           startDate.getDate() + this.suggestedDurationInCities[idx - 1]
//         );
//         startDate.setHours(12, 0, 0, 0); // Set time to 12 PM
//         // console.log("start date when idx !== 0",startDate);
//         // console.log("number of days stayed in previous city",this.suggestedDurationInCities[idx - 1])

//       }

//          const hoursToAdd = Math.floor((startDate.getHours() - 12) );
//          const totalMinutes =
//            startDate.getMinutes() +
//            ele.totalDurationOfTravelInMinutes +
//            hoursToAdd * 60;
     
//          startDate.setHours(startDate.getHours() + Math.floor(totalMinutes / 60));
//          startDate.setMinutes(totalMinutes % 60);
     
//          // Check if hours exceed 24, and add to the date
//          if (startDate.getHours() >= 24) {
//            startDate.setDate(
//              startDate.getDate() + Math.floor(startDate.getHours() / 24)
//            );
//            startDate.setHours(startDate.getHours() % 24);
//          }

//         //  console.log({" date after adding the flight duration":startDate,
//         //  "flightSuration":ele.totalDurationOfTravelInMinutes
//         // })

//       // Calculate arrival date and time
//       let arrivalDateTime;
//       if (idx >= this.connections.length - 1) {
//         // Last connection, use the first UTC offset again\
      
//         // console.log("called last connection")
//         // console.log({
//         //   "first":utcOffsets[idx],
//         //   "second":utcOffsets[0]
//         // })
//         arrivalDateTime = this.calculateArrivalDateTimeWithTimezone(
//           startDate,
//           utcOffsets[idx],
//           utcOffsets[0]
//         );
//       } else {
//         arrivalDateTime = this.calculateArrivalDateTimeWithTimezone(
//           startDate,
//           utcOffsets[idx],
//           utcOffsets[idx + 1]
//         );
//       }


//       // Format arrival date and time
//       const year = arrivalDateTime.getFullYear();
//       const month = arrivalDateTime.getMonth() + 1;
//       const day = arrivalDateTime.getDate();
//       const hours = arrivalDateTime.getHours();
//       const minutes = arrivalDateTime.getMinutes();

//       const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
//         .toString()
//         .padStart(2, "0")} ${hours.toString().padStart(2, "0")}:${minutes
//         .toString()
//         .padStart(2, "0")}`;

//         // console.log("end result after all steps" , formattedDate)
//         this.citiesArrivalDates.push(formattedDate);
//     });

//     // console.log(this.citiesArrivalDates);
//     return ;
//   }
//   // ---------------------------------------------------------------------------------------------------
 
//   // primary function  (secondary is getting called in this)
//  async getDaysAndConnections() {
//     console.log("call recieved to build itinerary")
//     const storedData = window.sessionStorage.getItem("myData");
//     // console.log(storedData)
//     if (storedData) {
//       const parsedData = JSON.parse(storedData);

//       const getTotalNumberOfDaysOfTrip = (
//         startDate: string | Date,
//         endDate: string | Date
//       ): number => {
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         const timeDifference = end.getTime() - start.getTime(); // Use getTime() to get the time in milliseconds
//         const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
//         return Math.round(daysDifference);
//       };

//       // Example usage:
//       this.trip = {
//         start_date: parsedData.selectedStartDate,
//         end_date: parsedData.selectedEndDate,
//         numbers_of_days: getTotalNumberOfDaysOfTrip(
//           parsedData.selectedStartDate,
//           parsedData.selectedEndDate
//         ),
//         cities: parsedData.selectedCities,
//         nature_of_trip: parsedData.selectedNature,
//         departure_airport: parsedData.selectedAirport,
//       };

//       this.cities = this.trip.cities;

//       // console.log(parsedData);
//       // console.log(this.trip);
//       // console.log(this.cities);

//       const url = "https://api.openai.com/v1/chat/completions";
//       const openAiKey = environment.OPENAI_API_KEY;
//       const headers = new HttpHeaders()
//         .set("Content-Type", "application/json")
//         .set("Authorization", `Bearer ${openAiKey}`);
//       // .set('Authorization', 'Bearer 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');

//       const requestBody = {
//         model: "gpt-3.5-turbo",
//         temperature: 1,
//         // "max_tokens": 2000,
//         n: 1,
//         messages: [
//           {
//             role: "system",
//             content: `Generate me a JSON response
//             {
//               "suggestedDurationInCities": ["<number>",...],
//               "connections": [
//                 {
//                   "transportMode": "<string>",
//                   "currentCityAirportCode": "<string>",
//                   "nextCityAirportCode": "<string>",
//                   "totalDurationOfTravelInMinutes": <number>,
//                 },
//               ]
//               "city_utc_offsets":[ 
//                 {
//                 "city": "<string>",
//                 "UTC_offset": "<string>"
//                 }
//               ]
//             }
//             `,
//           },
//           {
//             role: "user",
//             content: ` Generate me a JSON response of an array named suggestedDurationInCities for a trip to ${this.cities.join(
//               ","
//             )}for ${
//               this.trip.numbers_of_days
//             } days and also provide me with valid reasons why are you suggesting us to stay that much number of days in a city. 
//             suggestedDurationInCities should have a length of ${
//               this.cities.join(",").length
//             } and it is a number only array & refers to the number of days suggested by you to spend
//             in a city depending upon factors like popularity, touristic activities, famous restaurants etc.Ensure that none of the element should be 0 or undefined.
//             The array's elements must sum up precisely to ${
//               this.trip.numbers_of_days
//             } —non-negotiable.
//             The departure and return airport is ${this.trip.departure_airport}. 
//             Also generate an array of connections detailing the transport mode, current city airport code , next city airport code,
//              & total duration of travel in minutes for each connection . Note that it is a Round trip, need to get back to origin.
//              Also generate an array named city_utc_offsets for the cities of  ${
//                this.trip.departure_airport
//              } & ${this.cities.join(",")}.
//             The array should contain the UTC offsets inclusive of DST offsets ,if any.
//              Also make ensure that response directly start with the required result without any info string.
//              `,
//           },
//         ],
//       };

//       const startTime = Date.now(); // Record the start time

//       this.http
//         .post(url, requestBody, {
//           headers,
//           reportProgress: true,
//           observe: "body",
//         })
//         .pipe(
//           map((ele) => {
//             console.log(">>> ", ele);    
//             return ele;
//           })
//         )
//         .subscribe({
//           next: (response) => {
       
//             // Record the end time and calculate response time
//             const endTime = Date.now();
//             const responseTime = endTime - startTime;
//             console.log("Response Time:", responseTime, "ms");

//             // Process the API response
//             const jsonResponse = response as {
//               choices: { message: { content: string } }[];
//             };
//             // console.log(jsonResponse);

//             const itineraryStr: any = jsonResponse.choices[0].message.content;
//             const itinerary: Itinerary = JSON.parse(itineraryStr);
//             // console.log(itinerary);
//             this.suggestedDurationInCities =
//               itinerary.suggestedDurationInCities;
//             this.connections = itinerary.connections;

//             this.dateAfterAddingTravel(
//               this.trip.start_date,
//               itinerary.city_utc_offsets
//             );

//             this.trip.suggestedDurationInCities =
//               itinerary.suggestedDurationInCities;
//             this.trip.connections = itinerary.connections;
//             this.trip.citiesArrivalDates = this.citiesArrivalDates;

//             // --------------------SECONDARY FUNCTION GETTING CALLED---------------------------------------------------
//             this.getDayWiseItinerary();

//             // console.log(itinerary.suggestedDurationInCities);
//             // console.log(itinerary.connections);

//             // this.countriesService.setResponseData(itinerary);
//           },
//           error: (error) => {
//             // Handle error and log response time if needed
//             const endTime = Date.now();
//             const responseTime = endTime - startTime;
//             console.error("Error making API call:", error);
//             console.log("Response Time (on error):", responseTime, "ms");
//             this.toast.error(`Error Generating Itinerary`);
//           },
//           complete: () => {
//             console.log("Request completed");
//           },
//         });
//     }
//   }

//   // getting called in secondary function
//   makeApiCall(city: string, duration: number, arrDate: string) {
//     // console.log(Date.now());
//     // console.log(city, duration, arrDate);
//     const url = "https://api.openai.com/v1/chat/completions";
//     const openAiKey = environment.OPENAI_API_KEY;
//     const headers = new HttpHeaders()
//       .set("Content-Type", "application/json")
//       .set("Authorization", `Bearer ${openAiKey}`);

//     const requestBody = {
//       model: "gpt-3.5-turbo-16k",
//       temperature: 1,
//       n: 1,

//       messages: [
//         {
//           role: "system",
//           content: `Generate a JSON itinerary for a trip to ${city} lasting ${duration} days. 
            
//           "city_name": "<string>", 
//           "countryCode": "<string>",
//           "weather":"<string>",
//           "temperature":"<string>",
//             "itinerary": [
//                 {
//                   "dayNumber": <number>,
//                   "activities": [
//                     {
//                       "activity_timeperiod": "morning",
//                       "activity_name": "<string>",
//                       "location": "<string>"
//                     },
//                     {
//                       "activity_timeperiod": "afternoon",
//                       "activity_name": "<string>",
//                       "location": "<string>"
//                     },
//                     {
//                       "activity_timeperiod": "evening",
//                       "activity_name": "<string>",
//                       "location": "<string>"
//                     },
//                     {
//                       "activity_timeperiod": "night",
//                       "activity_name": "<string>",
//                       "location": "<string>"
//                     }
//                   ]
//                 },
//                 // Repeat similar structure for each day in the itinerary
//               ]`,
//         },
//         {
//           role: "user",
//           content: `Generate a JSON Day-wise itinerary for a ${duration}-day trip to ${city}. 
//               keep in mind while recommending activites or restaurants , it is a ${this.trip.nature_of_trip} trip .Always provide me with weather and usual temperature in celsius for ${city} around ${arrDate} as per previous records.
//               Strictly respond me with the asked keys only. Repeat for each day
//               `,
//         },
//       ],
//     };

//     return this.http.post(url, requestBody, {
//       headers,
//       reportProgress: true,
//       observe: "body",
//     });
//   }

//   // Secondary function  (getting called in primary function) 
//   getDayWiseItinerary() {
//     // Create an array of observables for each API call
//     const apiCalls = this.cities.map((city, index) =>
//       this.makeApiCall.call(
//         this,
//         city,
//         this.suggestedDurationInCities[index],
//         this.citiesArrivalDates[index]
//       )
//     );

//     const startTime = Date.now(); // Record the start time

//     // Make multiple API calls in parallel
//     forkJoin(apiCalls).subscribe({
//       next: (responses: any) => {
//         // Record the end time and calculate response time
//         const endTime = Date.now();
//         const responseTime = endTime - startTime;
//         console.log("Response Time:", responseTime, "ms");

//         // Process the API responses
//         responses.forEach((response, index) => {
//           const jsonResponse = response as {
//             choices: { message: { content: string } }[];
//           };
//           // console.log(`Response for ${this.cities[index]}:`, jsonResponse);

//           const itineraryStr = jsonResponse.choices[0].message.content;
//           const itinerary = JSON.parse(itineraryStr);
//           // console.log(itinerary);
//           this.finalItineraryArr.push(itinerary);
//         });

//         this.finalItineraryObject = {
//           itinerary: this.finalItineraryArr,
//           trip: this.trip,
//         };

//         // Convert the object to a JSON-formatted string
//         const jsonString = JSON.stringify(this.finalItineraryObject, null, 2); // The '2' is for indentation

//         // Create a Blob containing the JSON string
//         const blob = new Blob([jsonString], { type: "text/plain" });

//         // Create a link element
//         const link = document.createElement("a");

//         // Set the download attribute and create a URL pointing to the Blob
//         link.download = "yourObject.txt";
//         link.href = window.URL.createObjectURL(blob);

//         console.log(link);
        

//         // console.log(this.finalItineraryObject);
//         this.countriesService.setResponseData(this.finalItineraryObject);
//       },
//       error: (error) => {
//         // Handle error and log response time if needed
//         const endTime = Date.now();
//         const responseTime = endTime - startTime;
//         console.error("Error making API call:", error);
//         console.log("Response Time (on error):", responseTime, "ms");
//         this.toast.error("Error Generating Itinerary");
//       },
//       complete: () => {
//         console.log("All requests completed");
//       },
//     });
//   }
// }
