import { Component, Input, OnInit } from "@angular/core";
import { nature_of_trip } from "./nature";
import { nature_of_traveller } from "./nature";
import { HttpClient } from "@angular/common/http";
import { Route, Router } from "@angular/router";
import { CustomerInfoService } from "src/app/Services/customer-info.service";
import { log } from "console";
import { Subject, debounceTime } from "rxjs";
import { DebounceCallsService } from "src/app/Services/DebounceCalls/debounce-calls.service";
import * as dayjs from 'dayjs';
import { CrmServiceService } from "src/app/Services/CRM/crm-service.service";

@Component({
  selector: "app-enq-itinerary",
  templateUrl: "./enq-itinerary.component.html",
  styleUrls: ["./enq-itinerary.component.scss"],
})
export class EnqItineraryComponent implements OnInit {
  @Input() enq: any;
  @Input() update: any;

  natureofTrip = nature_of_trip;

  natureofTraveller = nature_of_traveller;

 
  selectedDateRange: any;
  dateRangeOptions: any = {
    autoApply: true,
    alwaysShowCalendars: true,
    opens: "left",
  };

  travellerCount: any[] = [
    { id: 1, type: "Adult", number: 0 },
    { id: 2, type: "Children", number: 0 },
    { id: 3, type: "Infant", number: 0 },
   
  ];

  itinerary: {
    contactNumber: string;
    merchantId: string;

    nationality: string;
    startDate: string;
    endDate:string,
    numberOfTravellers: any[];
    origin: string;
    destinations: string[];
    interestLevel: string;
    enquiryDetails: string;
    followUpDate: string;
    remarks: string;
    natureOfTraveller: string | null;
    natureOfTrip: string[];
  } = {
    contactNumber: "",
    merchantId: "tyh65tr",
    nationality: "",
    startDate: "",
    endDate:"",
    numberOfTravellers: [],
    origin: "",
    destinations: [],
    interestLevel: "high",
    enquiryDetails: "",
    followUpDate: "",
    remarks: "",
    natureOfTraveller: null,
    natureOfTrip: [],
  };

  // onContChange(event: any, type: string) {
  //   // This method is called whenever the input value changes
  //   switch (type) {
  //     case "Nationality":
  //       this.itinerary.nationality = event.target.value;
  //       break;
  //     case "Date":
  //       this.itinerary.dates = event.target.value;
  //       break;
  //     case "Departure":
  //       this.itinerary.origin = event.target.value;
  //       break;
  //     default:
  //       break;
  //   }
  //   console.log(this.itinerary);

  //   // Update the variable with the new value
  // }
  private departureSearchSubject = new Subject<string>();
  private nationalitySearchSubject = new Subject<string>();
  private destinationSearchSubject = new Subject<string>();

  userData: any;

 startDate;
 endDate;
 dateRange;
  dis: boolean = false;
  showAdvanceOptions: boolean = false;

  cities: string[] = [];
  selectedNatureOfTrip: any[] = [];
  selectedEnquiryDetails: string = "";
  interestLevel: string = "";

  ntrav: boolean = false;
  selectedNatureOfTraveller: string = "";

  ntrip: boolean = false;
  constructor(
    private debounce: DebounceCallsService,
    private http: HttpClient,
    private userDataService: CustomerInfoService,
    private router: Router,
    private crmService:CrmServiceService
  ) {}



  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem("customer-details"));

    console.log(this.userData);

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

    console.log(this.enq);
    console.log(this.update);
    // if (this.enq.numberOfTravellers !== undefined) {
    //   this.itinerary = this.enq;
    //   this.items = this.enq.numberOfTravellers;
    //   this.cities = this.enq.destinations;
    //   console.log(this.itinerary.dates.startDate.slice(0, 10));
    //   console.log(this.itinerary.dates.endDate.slice(0, 10));
    //   this.datesEnq =
    //     this.itinerary.dates.startDate.slice(0, 10) +
    //     " - " +
    //     this.itinerary.dates.endDate.slice(0, 10);
    //   console.log(this.datesEnq, "hiii");
    //   this.datechng = false;
    //   this.dateNew = this.itinerary.dates;
    // }
  }

  show() {
    this.dis = !this.dis;
    console.log(this.dis);
  }
  advance() {
    this.showAdvanceOptions = !this.showAdvanceOptions;
   
  }
  ntr() {
    this.ntrav = !this.ntrav;
  }
  ntrp() {
    this.ntrip = !this.ntrip;
  }


  // inc dec pax values
  ChngTraveller(item: any, x: string) {
    if (x === "inc") {
      item.number += 1;
    }
    if (x === "dec") {
      if (item.number >= 1) {
        item.number -= 1;
      } else {
        item.number = 0;
      }
    }
  }

  // addcity(value: string) {
  //   console.log("12");

  //   if (value !== "") {
  //     this.cities.push(value);
  //     console.log("34");
  //     console.log(this.cities);

  //     console.log(this.itinerary);
  //   }
  // }

  

  selectNatureOfTraveller(selectedType: string) {
    this.selectedNatureOfTraveller = selectedType;
  }
  selectNatureofTrip(nature: any, ind: number) {
    console.log(nature.check);

    if (nature.check) {
      // Remove the item from the selectedNatureOfTrip array by finding its index
      this.selectedNatureOfTrip.splice(
        this.selectedNatureOfTrip.findIndex(
          (item) => item.name === nature.name
        ),
        1
      );
      console.log(this.selectedNatureOfTrip);
    } else {
      // Add the item to the selectedNatureOfTrip array
      this.selectedNatureOfTrip.push(nature);
      console.log(this.selectedNatureOfTrip, "hii");
    }
    // Toggle the check property
    nature.check = !nature.check;
  }
  selectInterestLevel(interestLevel: number):void {

    if(interestLevel==1) this.interestLevel = "low";
    else if(interestLevel==2) this.interestLevel = "moderate";
    else if(interestLevel==3) this.interestLevel = "high";
    
  }
  selectEnquiryDetail(enqDetail: string) {
    this.selectedEnquiryDetails = enqDetail;
  }


  setStartAndEndDates(startDateObj: any, endDateObj: any) {
    if (startDateObj && endDateObj) {
      if (startDateObj.$d && endDateObj.$d) {
        const startDate = dayjs(startDateObj.$d);
        const endDate = dayjs(endDateObj.$d);

        // Format the dates as dd/mm/yyyy
        const formattedStartDate = startDate.format('DD/MM/YYYY');
        const formattedEndDate = endDate.format('DD/MM/YYYY');

        // Assign to Angular component variables
        this.startDate = formattedStartDate;
        this.endDate = formattedEndDate;

        console.log('Start Date:', formattedStartDate);
        console.log('End Date:', formattedEndDate);
      } else {
        console.error('Invalid Day.js objects passed.');
      }
    } else {
      console.error('Please provide both start and end date objects.');
    }
  }


  submitEnquiry() {

    this.setStartAndEndDates(this.dateRange.startDate,this.dateRange.endDate)
   
    this.itinerary.contactNumber = this.userData.contactNumber;
    this.itinerary.merchantId = this.userData.merchantId;

    this.itinerary.startDate = this.startDate;
    this.itinerary.endDate = this.endDate;
    this.itinerary.numberOfTravellers = this.travellerCount;

    this.itinerary.origin=this.selectedDeparture;
    this.itinerary.destinations=this.selectedDestinations;
    this.itinerary.nationality=this.guestNationality
    
    this.itinerary.natureOfTrip = this.selectedNatureOfTrip;
    this.itinerary.natureOfTraveller = this.selectedNatureOfTraveller;

    this.itinerary.interestLevel = this.interestLevel;
    this.itinerary.enquiryDetails = this.selectedEnquiryDetails;


    console.log(this.itinerary);

    this.postData(this.itinerary);
  }

  async postData(data: any) {

    const res=await this.crmService.registerItineraryEnquiry(data);
    console.log(res);

    
    if(res.success)this.router.navigate(["/customer"]);



  }

  datechng: boolean = true;
  dateReset() {
    this.datechng = !this.datechng;
  }

  
  // ---------------------------------------------------------------------------------
  selectedDestinations = [];
  onDestinationSelect(destination: any, destiantionType: number): void {
    if (destiantionType == 1)
      destination = { ...destination, destiantionType: "airport" };
    else if (destiantionType == 2)
      destination = { ...destination, destiantionType: "city" };

    this.selectedDestinations.push(destination);

    console.log(this.selectedDestinations);
  }

  removeCity(cityToRemove: string) {
    // Check if selectedDestinations is an array and cityToRemove is a valid string
    if (!Array.isArray(this.selectedDestinations)) {
      console.error("selectedDestinations is not an array.");
      return;
    }

    if (typeof cityToRemove !== "string" || cityToRemove.trim() === "") {
      console.error("Invalid cityToRemove.");
      return;
    }

    // Filter out the city to remove
    this.selectedDestinations = this.selectedDestinations.filter(
      (destination) => destination && destination.city_name !== cityToRemove
    );
  }

  selectedDeparture;
  onDepartureSelect(departure: any, departureType: number): void {
    // if departureType == 1  --> airport is selected
    // if departureType == 2  --> city is selected
    if (departureType == 1){
      this.selectedDeparture = { ...departure, departureType: "airport" };}
    else if (departureType == 2){
      this.selectedDeparture = { ...departure, departureType: "city" };
    }
    console.log(this.selectedDeparture);
  }

  // to get the guest nationality
  guestNationality;
  onCountrySelect(event: any) {
    this.guestNationality = event.country_code;
    console.log(this.guestNationality);
    console.log(event);
  }

  // DEPARTURE------- Airports & Cities----------------------------
  departureSearchText: string;
  departureSearchAirports = [];
  departureSearchCities = [];

  async onDepartureSearch() {
    try {
      // Check if search text is null, empty, or whitespace
      if (!this.departureSearchText || this.departureSearchText.trim() === "") {
        // Clear search results
        this.departureSearchAirports = [];
        this.departureSearchCities = [];
        return; // Stop execution
      }

      console.log("Departure Search:", this.departureSearchText);

      // Execute both requests in parallel
      const [responseAirports, responseCities] = await Promise.all([
        this.debounce.getAirports(this.departureSearchText),
        this.debounce.getCities(this.departureSearchText),
      ]);

      console.log(responseAirports);
      console.log(responseCities);

      // Update state if responses are available
      if (responseAirports) {
        this.departureSearchAirports = responseAirports.data.airports;
      }
      if (responseCities) {
        this.departureSearchCities = responseCities.data.cities;
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  onDepartureInputChange(): void {
    this.departureSearchSubject.next(this.departureSearchText);
  }

  // DESTINATIONS-- Airports & Cities-------------------------------------------
  destinationSearchText: string;
  destinationSearchAirports = [];
  destinationSearchCities = [];

  async onDestinationSearch() {
    try {
      // Check if search text is null, empty, or whitespace
      if (
        !this.destinationSearchText ||
        this.destinationSearchText.trim() === ""
      ) {
        // Clear search results
        this.destinationSearchAirports = [];
        this.destinationSearchCities = [];
        return; // Stop execution
      }
      console.log("Search in destination:", this.destinationSearchText);

      // Execute both requests in parallel
      const [responseAirports, responseCities] = await Promise.all([
        this.debounce.getAirports(this.destinationSearchText),
        this.debounce.getCities(this.destinationSearchText),
      ]);

      console.log(responseAirports);
      console.log(responseCities);

      // Update state if responses are available
      if (responseAirports) {
        this.destinationSearchAirports = responseAirports.data.airports;
      }
      if (responseCities) {
        this.destinationSearchCities = responseCities.data.cities;
      }
      
      this.destinationSearchText=""
    } catch (err) {
      console.error(err.message);
    }
  }
  onDestinationInputChange(): void {
    this.destinationSearchSubject.next(this.destinationSearchText);
  }

  // =================NATIONALITY=================================
  nationalitySearchText: string;
  nationalitySearchArr = [];

  async onNationalitySearch() {
    try {
      // Check if search text is null, empty, or whitespace
      if (
        !this.nationalitySearchText ||
        this.nationalitySearchText.trim() === ""
      ) {
        // Clear search results
        this.nationalitySearchArr = [];
        return; // Stop execution
      }
      console.log("Departure Search:", this.nationalitySearchText);

      const responseAirports = await this.debounce.getCountries(
        this.nationalitySearchText
      );

      console.log(responseAirports);
      if (responseAirports) {
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
