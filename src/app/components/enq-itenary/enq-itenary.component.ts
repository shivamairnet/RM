import { Component, Input, OnInit } from "@angular/core";
import { nature_of_trip } from "./nature";
import { nature_of_traveller } from "./nature";
import { HttpClient } from "@angular/common/http";
import { Route, Router } from "@angular/router";
import { CustomerInfoService } from "src/app/Services/customer-info.service";
import { log } from "console";
import { Subject, debounceTime } from "rxjs";
import { DebounceCallsService } from "src/app/Services/DebounceCalls/debounce-calls.service";

@Component({
  selector: "app-enq-itenary",
  templateUrl: "./enq-itenary.component.html",
  styleUrls: ["./enq-itenary.component.scss"],
})
export class EnqItenaryComponent implements OnInit {
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

  items: any[] = [
    { id: 1, content: "Adult", number: 0 },
    { id: 2, content: "Children", number: 0 },
    { id: 3, content: "Infant", number: 0 },
    // Add more items as needed
  ];

  itenary: {
    contactNumber: string;
    merchantId: string;
    continent: string;
    nationality: string;
    dates: any;
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
    continent: "",
    nationality: "",
    dates: "",
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

  onContChange(event: any, type: string) {
    // This method is called whenever the input value changes
    switch (type) {
      case "Continent":
        this.itenary.continent = event.target.value;
        break;
      case "Nationality":
        this.itenary.nationality = event.target.value;
        break;
      case "Date":
        this.itenary.dates = event.target.value;
        break;
      case "Departure":
        this.itenary.origin = event.target.value;
        break;
      default:
        break;
    }
    console.log(this.itenary);

    // Update the variable with the new value
  }
  private departureSearchSubject = new Subject<string>();
  private nationalitySearchSubject = new Subject<string>();
  private destinationSearchSubject = new Subject<string>();

  userData: any;

  dateNew: any;

  dis: boolean = false;
  dis2: boolean = false;

  constructor(
    private debounce: DebounceCallsService,
    private http: HttpClient,
    private userDataService: CustomerInfoService,
    private router: Router
  ) {}

  datesEnq: any = "";

  ngOnInit(): void {
    // this.userData = JSON.parse(localStorage.getItem("user-data"));

    // console.log(this.userData);
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
    //   this.itenary = this.enq;
    //   this.items = this.enq.numberOfTravellers;
    //   this.cities = this.enq.destinations;
    //   console.log(this.itenary.dates.startDate.slice(0, 10));
    //   console.log(this.itenary.dates.endDate.slice(0, 10));
    //   this.datesEnq =
    //     this.itenary.dates.startDate.slice(0, 10) +
    //     " - " +
    //     this.itenary.dates.endDate.slice(0, 10);
    //   console.log(this.datesEnq, "hiii");
    //   this.datechng = false;
    //   this.dateNew = this.itenary.dates;
    // }
  }


  show() {
    this.dis = !this.dis;
    console.log(this.dis);
  }
  advance() {
    this.dis2 = !this.dis2;
    console.log(this.dis2);
  }
  ChngTraveller(item: any, x: string) {
    if (x === "inc") {
      item.number += 1;
      console.log(item.number);
    }
    if (x === "dec") {
      if (item.number >= 1) {
        item.number -= 1;
        console.log(item.number);
      } else {
        item.number = 0;
      }
    }
  }

  cities: string[] = [];

  addcity(value: string) {
    console.log("12");

    if (value !== "") {
      this.cities.push(value);
      console.log("34");
      console.log(this.cities);

      console.log(this.itenary);
    }
  }

  ntrav: boolean = false;
  traveller: string = "";

  ntrip: boolean = false;

  ntr() {
    this.ntrav = !this.ntrav;
  }
  ntrp() {
    this.ntrip = !this.ntrip;
  }
  chooseTrav(trav: string) {
    this.traveller = trav;
  }

  trip: any[] = [];

  addTrip(nature: any, ind) {
    console.log(nature.check);

    switch (nature.check) {
      case true:
        this.trip.splice(ind, 1);
        console.log(this.trip);
        break;
      case false:
        this.trip.push(nature);
        console.log(this.trip, "hii");
        nature.check = !nature.check;
        break;

      default:
        break;
    }
  }

  detail: string = "";

  enqDetail(x: string) {
    this.detail = x;
  }

  intLevel: string = "";

  interest(v: string) {
    this.intLevel = v;
  }

  submit() {
    console.log(this.userData);

    this.itenary.contactNumber = this.userData[0].contactNumber;
    this.itenary.enquiryDetails = this.detail;
    this.itenary.interestLevel = this.intLevel;
    this.itenary.numberOfTravellers = this.items;
    this.itenary.natureOfTraveller = this.traveller;
    this.itenary.dates = this.dateNew;
    // this.itenary.natureOfTrip=this.traveller
    this.itenary.merchantId = this.userData[0].merchantId;
    this.itenary.natureOfTrip = this.trip;

    console.log(this.itenary.contactNumber);

    this.postData(this.itenary);
  }
  async postData(data: any) {
    const res = await this.http
      .post("http://localhost:4000/crm/itineraryEnquiry", data)
      .toPromise();
    console.log(res);
    this.router.navigate(["/customer"]);
  }

  datechng: boolean = true;
  dateReset() {
    this.datechng = !this.datechng;
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
