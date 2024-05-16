import { DatePipe } from "@angular/common";
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import {
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import axios from "axios";
import { Papa } from "ngx-papaparse";
import * as CryptoJS from "crypto-js";
import { FlightsService } from "src/app/Services/flights_api/flights.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Airports } from "src/app/classes/airport";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { DebounceCallsService } from "src/app/Services/DebounceCalls/debounce-calls.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-flight-input-sidebar",
  templateUrl: "./flight-input-sidebar.component.html",
  styleUrls: ["./flight-input-sidebar.component.scss"],
})
export class FlightInputSidebarComponent implements OnInit {
  @Input() response: any;

  dateFromModel: NgbDateStruct;
  endDateFromModel: NgbDateStruct;
  placement = "bottom";

  journeyType: number = 1;
  hoveredDate: NgbDate | null = null;

  fareType: number = 2;
  filteredAirports: any;
  airportCodes: any;
  numberFormControl = new FormControl(0);
  numberFormControl1 = new FormControl(0);
  numberFormControl3 = new FormControl(0);
  ageInputValue: number;
  numberFormControl2: FormArray;
  noOfChildren: number = 0;
  selectedAirport: any;
  active: number;
  adultsValue: number;
  childrenValue: number;
  selectedCity: string;
  searchText2: any;
  filteredCities: any;
  selectedStartDate: string = "";
  selectedEndDate: string = "";
  source: string = "";
  destination: string = "";
  @ViewChild("collapseTwoElement") collapseTwoElement: ElementRef;

  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  filteredData: any;
  searchText: any;
  searchText1: string;
  datepicker: any;

  trips = [] as any;
  selectedDate: NgbDateStruct;
  showDatepicker = false;
  tripDate: string = "";
  minDate: NgbDateStruct;

  calendarFare: any;
  private key: string = "ABCD1234";
  @Output() tripsData: EventEmitter<any> = new EventEmitter<any>();
  @Output() responseData: EventEmitter<any> = new EventEmitter<any>();
  @Output() journeyData: EventEmitter<any> = new EventEmitter<any>();
  @Output() calendarData: EventEmitter<any> = new EventEmitter<any>();

  private departureSearchSubject = new Subject<string>();
  private destinationSearchSubject = new Subject<string>();
  constructor(
    private calendar: NgbCalendar,
    private spinner: NgxSpinnerService,
    public formatter: NgbDateParserFormatter,
    private papa: Papa,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private flights: FlightsService,
    private debounce: DebounceCallsService,
    private ngbDateParserFormatter: NgbDateParserFormatter
  ) {
    const currentDate = new Date();
    this.selectedDate = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };

    // Set the minDate to today
    this.minDate = {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
    };
  }

  ngOnInit(): void {
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

    // this.convertCSVToJson()
    this.numberFormControl.setValue(0);
    this.numberFormControl1.setValue(0);

    if (sessionStorage.getItem("flights")) {
      const decrypt = this.decryptObject(sessionStorage.getItem("flights"));
      // this.numberFormControl.setValue(decrypt)
      console.log(decrypt);
      this.handlePayload(decrypt.trip);
    }

    this.trips = [];
  }

  ResetDate() {
    this.selectedEndDate = "";
    this.selectedStartDate = "";
    this.tripDate = "";
  }

  async handlePayload(payload: any) {
    this.numberFormControl.setValue(payload.AdultCount);
    this.numberFormControl1.setValue(payload.ChildCount);
    this.numberFormControl3.setValue(payload.ChildCount);
    this.journeyType = payload.JourneyType;
    this.fareType = payload.ResultFareType;
    if (this.journeyType === 3) {
      this.trips = payload.Segments;
    } else if (this.journeyType === 2) {
      this.selectedStartDate = payload.Segments[0].PreferredArrivalTime;
      this.selectedEndDate = payload.Segments[1].PreferredArrivalTime;
      this.source = payload.Segments[0].Origin;
      this.destination = payload.Segments[0].Destination;
      this.selectedAirport = this.source;
      this.selectedCity = this.destination;
    } else if (this.journeyType === 1) {
      this.tripDate = payload.Segments[0].PreferredArrivalTime;
      this.source = payload.Segments[0].Origin;
      this.destination = payload.Segments[0].Destination;
      this.selectedAirport = this.source;
      this.selectedCity = this.destination;
    }
    // this.journeyData.emit(payload)
    // await this.sendRequestInitial(payload)
  }

  onDateChanged(event: any) {
    // 'event' contains the selected date
    console.log("Selected Date:", event);
  }

  onDateChanges(event: NgbDateStruct) {
    // 'event' contains the selected date
    console.log("Selected Date:", event);

    // Close the datepicker dialog
    this.showDatepicker = false;

    this.tripDate = `${event.year}-${event.month}-${event.day}`;
    console.log(this.tripDate);
  }

  toggleDatepicker(dp: any) {
    this.showDatepicker = !this.showDatepicker;
    if (this.showDatepicker) {
      dp.open();
    } else {
      dp.close();
    }
  }

  // we are getting airport codes to show from here
  async convertCSVToJson() {
    console.log();
    // const res = await fetch(`${environment.BACKEND_BASE_URL}/hotel/getCsvData`);
    const res = await this.flights.getCsvData();
    const csvData = await res.text();

    // Now you can parse the CSV data and work with it
    this.papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        // The parsed CSV data is available in the 'result.data' array
        const jsonData = result.data;
        console.log("JSON data:", jsonData);
        this.airportCodes = jsonData;
        console.log(this.airportCodes);
        // this.filterData();
        // this.filterAirports();
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
      },
    });
  }

  filterData(): void {
    console.log(this.searchText);
    this.filteredData = this.airportCodes.filter((data) =>
      data?.cityName?.toLowerCase().includes(this.searchText.toLowerCase())
    );
    console.log("filtered", this.filteredData);
  }
  // filterAirports(): void {
  //   this.filteredAirports = Airports.filter((airport) =>
  //     airport.toLowerCase().includes(this.searchText1.toLowerCase())
  //   );
  // }
  // filterAirports(): void {
  //   this.filteredAirports = this.airportCodes.filter(
  //     (airport) =>
  //       (airport?.cityName &&
  //         airport.cityName
  //           .toLowerCase()
  //           .includes(this.searchText1.toLowerCase())) ||
  //       (airport?.cityCode &&
  //         airport.cityCode
  //           .toLowerCase()
  //           .includes(this.searchText1.toLowerCase()))
  //   );
  //   console.log("filtered airports", this.filteredAirports);
  // }

  incAdultCount() {
    const currentValue = this.numberFormControl.value;
    console.log(currentValue);
    if (currentValue !== null) {
      const newValue = currentValue + 1;
      this.numberFormControl.setValue(newValue);
      // const formGroup = this.addTripModelFormGroup();
      // formGroup.controls['travellers'].setValue(newValue);
    }
    // console.log(this.numberFormControl)
  }

  decAdultCount() {
    const currentValue = this.numberFormControl.value;
    console.log(currentValue);
    if (currentValue !== null) {
      const newValue = currentValue - 1;
      this.numberFormControl.setValue(newValue);
    }
    // console.log(this.numberFormControl)
  }

  incChildCount() {
    const currentValue1 = this.numberFormControl1.value;
    if (currentValue1 !== null) {
      this.numberFormControl1.setValue(currentValue1 + 1);
    }
  }

  decChildCount() {
    const currentValue1 = this.numberFormControl1.value;
    if (currentValue1 !== null) {
      this.numberFormControl1.setValue(currentValue1 - 1);
    }
  }

  incInfantCount() {
    const currentValue1 = this.numberFormControl3.value;
    if (currentValue1 !== null) {
      this.numberFormControl3.setValue(currentValue1 + 1);
    }
  }

  decInfantCount() {
    const currentValue1 = this.numberFormControl3.value;
    if (currentValue1 !== null) {
      this.numberFormControl3.setValue(currentValue1 - 1);
    }
  }

  onAirportSelect(airport: any): void {
    // this.countryService.setSelectedAirport(airport?.cityName);
    this.selectedAirport = `${airport?.city || airport?.city_name}, ${
      airport?.iata
    }`;
    this.source = airport?.iata;
    // this.active = 4;
  }

  onSearchChange1(): void {
    console.log("search called");
    // this.filterAirports();
  }

  // selectNature(nature: string): void {
  //   this.countryService.setSelectedNature(nature);
  //   this.selectedNature = nature;
  // }

  noOfTraveler(value: string): void {
    const adults = this.numberFormControl.value || 0;
    const children = this.numberFormControl1.value || 0;

    // Convert adults and children values to strings
    const adultsStr = adults.toString();
    const childrenStr = children.toString();

    this.adultsValue = adults;
    this.childrenValue = children;
    this.active = 6;
  }

  formatSingleDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDateRange(startDateStr: string, endDateStr: string): string {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const startDay = startDate.getDate().toString().padStart(2, "0");
    const endDay = endDate.getDate().toString().padStart(2, "0");
    const startMonth = (startDate.getMonth() + 1).toString().padStart(2, "0");
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, "0");
    const year = startDate.getFullYear();

    return `${startDay}/${startMonth}-${endDay}/${endMonth},${year}`;
  }

  onCitySelect(airport: any): void {
    this.selectedCity = `${airport?.city_name}, ${airport?.iata}`;

    this.destination = airport?.iata;
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

  filterCities(): void {
    console.log("filter city");

    this.filteredCities = this.airportCodes.filter(
      (airport) =>
        airport?.cityName
          ?.toLowerCase()
          .includes(this.searchText2.toLowerCase()) ||
        airport?.cityCode
          ?.toLowerCase()
          .includes(this.searchText2.toLowerCase())
    );
    console.log("filtered city", this.filteredCities);
  }

  createChildFormGroup(index: number, age: number): FormGroup {
    return this.fb.group({
      index: this.fb.control(index), // Set the index value
      age: this.fb.control(age), // Set the age value
    });
  }

  createDocument() {
    const data = {
      selectedAirport: this.selectedAirport,

      // selectedDate: this.selectedDate,

      adultsValue: this.numberFormControl.value,
      childrenValue: this.numberFormControl1.value,
      selectedCities: this.selectedCity,

      JourneyType: this.journeyType,
      FareType: this.fareType,
      startDate: this.selectedStartDate,
      endDate: this.selectedEndDate,
    };
    window.sessionStorage.setItem("myData", JSON.stringify(data));
    console.log(data);
    // setDoc(doc(this.db, collectionName, documentId), data)
    const storedData = window.sessionStorage.getItem("myData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      console.log("session Data:", parsedData);
    }
  }

  buildItinerary(): void {
    console.log("building");

    this.createDocument();
  }

  toggleJourney(cabin: number, isChecked: boolean) {
    if (isChecked) {
      this.journeyType = cabin;
    } else {
      this.journeyType = 1;
    }

    console.log(this.journeyType);
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
      this.toggleCollapse();
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    this.selectedStartDate = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
    this.selectedEndDate = this.toDate
      ? `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}`
      : "";

    console.log(this.selectedStartDate);
    console.log(this.selectedEndDate);
  }
  onJourneyTypeNot2() {
    // Close the datepicker
    this.datepicker.close();
    // Store the selected date in selectedStartDate
    this.selectedStartDate = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
  }
  toggleCollapse() {
    const collapseElement: HTMLElement = this.collapseTwoElement.nativeElement;
    if (collapseElement.classList.contains("show")) {
      // Collapse is currently open, close it.
      collapseElement.classList.remove("show");
    } else {
      // Collapse is currently closed, open it.
      collapseElement.classList.add("show");
    }
  }
  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  selectFareType(index: number, isChecked: boolean) {
    if (isChecked) {
      this.fareType = index;
    } else {
      this.fareType = 2;
    }
    console.log(this.fareType);
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  destinationsArr: string[] = [];
  datesArr: string[] = [];

  addCity() {
    this.trips.push({
      Origin: this.source,
      Destination: this.destination,
      FlightCabinClass: 1,
      PreferredDepartureTime: this.tripDate,
      PreferredArrivalTime: this.tripDate,
    });
    this.destinationsArr.push(this.destination);
    this.datesArr.push(this.tripDate);
    console.log(this.trips);
    this.source = "";
    this.destination = "";
    this.selectedStartDate = "";
    this.selectedAirport = "";
    this.selectedCity = "";
    // this.searchText2 = "";
    // this.searchText1 = "";
    this.fromDate = null;
    this.toDate = null;
    this.tripDate = "";
    this.tripsData.emit(this.trips);
  }
  encryptObject(obj: any): string {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(obj),
      this.key
    ).toString();
    return encrypted;
  }
  decryptObject(encryptedData: string): any {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.key).toString(
      CryptoJS.enc.Utf8
    );
    return JSON.parse(decrypted);
  }



  async sendRequest() {
    console.log("in send");

    try {
      const payload = this.createFlightPayload();
      this.journeyData.emit(payload);
    this.tripsData.emit(this.trips);

      const searchFlightPromise = axios.post(
        `${environment.BACKEND_BASE_URL}/flight/searchflight`,
        payload
      );

      let calendarFarePromise;

      if (this.journeyType === 1) {
        calendarFarePromise = axios.post(
          `${environment.BACKEND_BASE_URL}/flight/calendarFare`,
          payload
        );
      }

      const searchFlightResponse = await searchFlightPromise;

      if (searchFlightResponse) {
        console.log("Got response from flight/searchflight:");
        console.log(searchFlightResponse.data);
        this.response = searchFlightResponse.data;
        this.responseData.emit(this.response);
      }

      if (calendarFarePromise) {
        calendarFarePromise
          .then((calendarFareResponse) => {
            console.log("Got response from flight/calendarFare:");
            console.log(calendarFareResponse.data, "calendar response");
            this.calendarFare = calendarFareResponse.data.data;
            this.calendarData.emit(this.calendarFare);
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // async sendRequest() {
  //   console.log("in send");

  //   try {
  //     const payload = this.createFlightPayload();
  //     this.journeyData.emit(payload);

  //     const res = await axios.post(
  //       `${environment.BACKEND_BASE_URL}/flight/searchflight`,
  //       payload
  //     );

  //     if(this.journeyType===1){
  //             this.getCalendarFare()
  //           }

  //     if (res) {
  //       console.log(res);

  //       this.response = res.data;

  //       this.responseData.emit(this.response);
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // }
  // async getCalendarFare() {
  //   const payload = this.createFlightPayload();

  //   try {
  //     const {data} = await axios.post(
  //       `${environment.BACKEND_BASE_URL}/flight/calendarFare`,
  //       payload
  //     );
  //     console.log("Got response from  flight/calendarFare")
  //     console.log(data, "calendar resposne")
  //     this.calendarFare = data.data.data;
  //     this.calendarData.emit(this.calendarFare);
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // }
  async sendRequestInitial(payload: any) {
    console.log("in send");
    try {
      const res = await axios.post(
        `${environment.BACKEND_BASE_URL}/flight/searchflight`,
        payload
      );

      if (res) {
        console.log(res);

        this.response = res.data;

        this.responseData.emit(this.response);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // HELPER
  createFlightPayload() {
    const commonPayload = {
      AdultCount: this.numberFormControl.value,
      ChildCount: this.numberFormControl1.value,
      InfantCount: this.numberFormControl3.value,
      ResultFareType: this.fareType,
    };
    console.log(commonPayload);

    if (this.journeyType === 1) {
      return {
        ...commonPayload,
        JourneyType: this.journeyType,
        Segments: [
          {
            Origin: this.source,
            Destination: this.destination,
            FlightCabinClass: "1",
            PreferredDepartureTime: this.tripDate,
            PreferredArrivalTime: this.tripDate,
          },
        ],
        Sources: null,
      };
    } else if (this.journeyType === 2) {
      return {
        ...commonPayload,
        JourneyType: this.journeyType,
        Segments: [
          {
            Origin: this.source,
            Destination: this.destination,
            FlightCabinClass: "1",
            PreferredDepartureTime: this.selectedStartDate,
            PreferredArrivalTime: this.selectedStartDate,
          },
          {
            Origin: this.destination,
            Destination: this.source,
            FlightCabinClass: "1",
            PreferredDepartureTime: this.selectedEndDate,
            PreferredArrivalTime: this.selectedEndDate,
          },
        ],
        Sources: null,
      };
    } else if (this.journeyType === 3) {
      return {
        ...commonPayload,
        JourneyType: this.journeyType,
        Segments: this.trips,
        Sources: null,
      };
    }

    console.log(commonPayload);
  }

  formatDate(date: string): string {
    const dateTimeString = date + "T00:00:00";

    // Convert string to Date object
    const dateTimeObject = new Date(dateTimeString);

    // Format the Date using DatePipe

    return this.datePipe.transform(dateTimeObject, "yyyy-MM-ddTHH:mm:ss") || "";
  }

  onDateChange() {
    const dateString1 = this.ngbDateParserFormatter.format(this.dateFromModel);
    const dateString2 = this.ngbDateParserFormatter.format(
      this.endDateFromModel
    );
    console.log("Date changed:", this.dateFromModel);
    console.log(this.journeyType);
    if (this.journeyType == 2) {
      this.selectedStartDate = dateString1;
      this.selectedEndDate = dateString2;
      console.log("start", this.selectedStartDate);
      console.log("end", this.selectedEndDate);
    } else {
      this.tripDate = dateString1;

      console.log("selected date", dateString1);
    }
  }
}
