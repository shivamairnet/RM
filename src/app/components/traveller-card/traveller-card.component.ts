import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { HotelsService } from "src/app/Services/hotels_api/hotels.service";
import { PackageService } from "src/app/Services/package/package.service";
import { DatePipe } from "@angular/common";
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDatepicker,
} from "@ng-bootstrap/ng-bootstrap";
import { FlightsService } from "src/app/Services/flights_api/flights.service";
import { Papa } from "ngx-papaparse";
import { debounceTime, Subject } from "rxjs";
import { DebounceCallsService } from "src/app/Services/DebounceCalls/debounce-calls.service";
import axios from "axios";
import { Traveler } from "src/app/classes/packageCheckoutInterface";
import { findSourceMap } from "module";
import * as CryptoJS from "crypto-js";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-traveller-card",
  templateUrl: "./traveller-card.component.html",
  styleUrls: ["./traveller-card.component.scss"],
})
export class TravellerCardComponent implements OnInit {
  @ViewChild("dpInput") dpInput: any;

  @Input() dialog: boolean;

  @Input() travelers: any[];
  @Input() currentTravelerUid: string;

  @Input() isLCC: boolean;
  @Input() ssr: any;

  // @Input() seatPrice: any;
  // @Input() baggagePrice: any;
  // @Input() mealPrice: any;

  @Input() RoomGuests: any[];
  @Input() NoOfTravellers: number;

  @Output() closeDialog: EventEmitter<string> = new EventEmitter<string>();
  @Output() updatedTravelerArr: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() priceChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  travelData: any;
  passengerData: any;

  travelerForm: FormGroup;

  selectedCard: number = 0;
  currentTravellerCount = 1;
  totalAdultsCount: number = 0;
  primary: boolean = false;
  currentIndex: number = 0;
  ssrData: any;
  seatMapDialog: boolean = false;
  shouldUpdateFormValues: boolean = false;

  isChild: boolean = false;
  price = [] as any;
  // date
  selectedDate: Date;

  // Add any other necessary properties
  // In your component.ts
  countryCodes: any;
  showBaggageDropdown: any;
  showDropdown: any;
  selectedNationality: any;
  selectedCountry: any;
  filteredCountry: any;
  searchText: any;

  seatsArray = [] as any;
  ssrNo: number;
  RowSeats: any;
  selectedSeatMapIndex: number;

  private departureSearchSubject = new Subject<string>();
  private nationalitySearchSubject = new Subject<string>();
  private countrySearchSubject = new Subject<string>();

  constructor(
    private hotels: HotelsService,
    private flights: FlightsService,
    private papa: Papa,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private pack: PackageService,
    private debounce: DebounceCallsService
  ) {}

  ngOnInit(): void {
    console.log("travelers:", this.travelers);
    console.log("currentTravelerUid:", this.currentTravelerUid);

    console.log("SSR:", this.ssr);
    console.log("IS LCC:", this.isLCC);

    this.departureSearchSubject
      .pipe(
        debounceTime(500) // Adjust debounce time as needed (300 milliseconds in this example)
      )
      .subscribe(() => {
        this.onDepartureSearch();
      });
    this.nationalitySearchSubject
      .pipe(
        debounceTime(500) // Adjust debounce time as needed (300 milliseconds in this example)
      )
      .subscribe(() => {
        this.onNationalitySearch();
      });
    this.countrySearchSubject
      .pipe(
        debounceTime(500) // Adjust debounce time as needed (300 milliseconds in this example)
      )
      .subscribe(() => {
        this.onCountrySearch();
      });
    // this.getData();s
    this.initializeForm();
    
    // this.loadTravelerDetails();



    // if(this.ssr){
    //   this.handleSSR('ssr',)
    // }
    // if (this.editIndex !== undefined) {
    //   this.handleCardClick(this.editIndex);

    //   this.currentIndex = this.editIndex;
    //   if (this.travelers[this.currentIndex]) {
    //     this.travelerForm.setValue(this.travelers[this.currentIndex]);
    //     console.log(this.travelerForm.value);
    //   }
    // }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.convertCSVToJson();
    console.log("HotelCardsComponent ngOnChanges", changes);

    this.ssrData = this.ssr.Response;
  }

  adult() {
    this.isChild = false;
  }
  child() {
    this.isChild = true;
  }

  handleSeatMapClick(index: number, rowseats: any, ssrNo: number) {
    this.ssrNo = ssrNo;
    this.RowSeats = rowseats;
    this.seatMapDialog = !this.seatMapDialog;
    this.selectedSeatMapIndex = index;
  }

  handleSeatMapData(data: any) {
    console.log("Received data from seat map component:", data);

    this.seatsArray[data.index] = data.seat;
    console.log(this.seatsArray);
    const personalInfoGroup = this.travelerForm.get("ssr") as FormGroup;

    const seatControl = personalInfoGroup.get("seat");
    seatControl.setValue(this.seatsArray);
    this.updatePrice();
  }

  private calculateAge(dob: string): number {
    const currentDate = new Date();
    const birthDate = new Date(dob);

    let age = currentDate.getFullYear() - birthDate.getFullYear();

    // Adjust age if the birthday hasn't occurred yet this year
    if (
      currentDate.getMonth() < birthDate.getMonth() ||
      (currentDate.getMonth() === birthDate.getMonth() &&
        currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  private initializeForm(): void {
    const traveler: Traveler = this.findTraveler(this.currentTravelerUid);

    // Get current date
    const currentDate = new Date();

    // Initialize the form
    this.travelerForm = this.fb.group({
      personalInfo: this.fb.group({
        FirstName: ["", [Validators.required]],
        Title: ["", [Validators.required]],
        LastName: ["", [Validators.required]],
        DateOfBirth: [currentDate, [Validators.required]],
        Gender: ["", [Validators.required]],
        Nationality: ["", [Validators.required]],
        CountryCode: [""],
        City: [""],
        CountryName: [""],
        AddressLine1: ["", [Validators.required]],
        AddressLine2: [""],
        Email: ["", [Validators.required]],
        ContactNo: ["", [Validators.required]],
        Phoneno: [""],
        PAN: [""],
        PassportNo: [""],
        PassportIssueDate: [currentDate, [Validators.required]],
        PassportExpDate: [currentDate, [Validators.required]],
        PassportExpiry: [""],
        Age: [""],
        LeadPassenger: [false],
      }),
      guardianDetails: this.fb.group({
        Title: [null],
        FirstName: [null],
        LastName: [null],
        PAN: [null],
        PassportNo: [null],
      }),
      ssr: this.fb.group({
        extraBaggage: [null],
        meal: [null, [Validators.required]], // Initializing with null for "No Preference"
        seat: [null, [Validators.required]], // Initializing with null for "No Preference"
      }),
    });

    // Fill the form with pre-filled data if it exists
    if (traveler.personalInfoCompleted) {
      this.travelerForm.patchValue({
        personalInfo: {
          FirstName: traveler.personalInfo?.FirstName || "",
          Title: traveler.personalInfo?.Title || "",
          LastName: traveler.personalInfo?.LastName || "",
          DateOfBirth: traveler.personalInfo?.DateOfBirth || currentDate,
          Gender: traveler.personalInfo?.Gender || "",
          Nationality: traveler.personalInfo?.Nationality || "",
          CountryCode: traveler.personalInfo?.CountryCode || "",
          City: traveler.personalInfo?.City || "",
          CountryName: traveler.personalInfo?.CountryName || "",
          AddressLine1: traveler.personalInfo?.AddressLine1 || "",
          AddressLine2: traveler.personalInfo?.AddressLine2 || "",
          Email: traveler.personalInfo?.Email || "",
          ContactNo: traveler.personalInfo?.ContactNo || "",
          Phoneno: traveler.personalInfo?.Phoneno || "",
          PAN: traveler.personalInfo?.PAN || "",
          PassportNo: traveler.personalInfo?.PassportNo || "",
          PassportIssueDate:
            traveler.personalInfo?.PassportIssueDate || currentDate,
          PassportExpDate:
            traveler.personalInfo?.PassportExpDate || currentDate,
          PassportExpiry: traveler.personalInfo?.PassportExpiry || "",
          Age: traveler.personalInfo?.Age || "",
          LeadPassenger: traveler.personalInfo?.LeadPassenger || false,
        },
        guardianDetails: {
          Title: traveler.guardian?.Title || null,
          FirstName: traveler.guardian?.FirstName || null,
          LastName: traveler.guardian?.LastName || null,
          PAN: traveler.guardian?.PAN || null,
          PassportNo: traveler.guardian?.PassportNo || null,
        },
        ssr: {
          extraBaggage: traveler.ssr?.extraBaggage || null,
          meal: traveler.ssr?.meal || null,
          seat: traveler.ssr?.seat || null,
        },
      });
    }

    // these 3 below cloning calls are being made to cater the needs of both hotels and flights coz example they both demand phone number but one with "ContactNo"d and other "Phoneno"
    this.travelerForm
      .get("personalInfo.ContactNo")
      .valueChanges.subscribe((contactNo) => {
        this.travelerForm.get("personalInfo.Phoneno").setValue(contactNo);
      });

    this.travelerForm
      .get("personalInfo.PassportExpiry")
      .valueChanges.subscribe((contactNo) => {
        // Check if the flag is set to true before updating the form
        // Set the value of Phoneno field to the same value as ContactNo
        this.travelerForm
          .get("personalInfo.PassportExpDate")
          .setValue(contactNo);
      });

    this.travelerForm
      .get("personalInfo.DateOfBirth")
      .valueChanges.subscribe((dob) => {
        // Update the Age field when Date of Birth changes
        const age = this.calculateAge(dob);
        this.travelerForm.get("personalInfo.Age").setValue(age);
        console.log(age);
      });
  }

  onCitySelected(city) {
    this.travelerForm.patchValue({
      personalInfo: {
        City: city.city_name,
      },
    });
  }
  onNationalitySelected(country) {
    this.travelerForm.patchValue({
      personalInfo: {
        Nationality: country.country_code,
      },
    });
  }
  onCountrySelected(country) {
    this.travelerForm.patchValue({
      personalInfo: {
        CountryName: country.country_name,
        CountryCode: country.country_code,
      },
    });
  }

  getFormValues(): any {
    const formValues = this.travelerForm.value;
    console.log("Form Values:", formValues);
    return formValues;
  }

  seeSavedUser() {
    const formValues = this.travelerForm.value;
    console.log("Form Values:", formValues);
    return formValues;
  }

  findTraveler(uid: string) {
    return this.travelers.find((t) => t.uid === uid);
  }

  async addOrUpdateTraveler(currentTravelerUid) {
    console.log(currentTravelerUid)
    // Find the traveler from the travelers array based on the UID
    const traveler = this.findTraveler(currentTravelerUid);

    console.log(traveler);
    // If traveler is found, update its data from the form
    if (traveler) {
      const personalInfo = this.travelerForm.get("personalInfo").value;
      const guardianDetails = this.travelerForm.get("guardianDetails").value;
      const ssr = this.travelerForm.get("ssr").value;

      // Update traveler's personalInfo, guardian, and ssr properties
      traveler.personalInfo = personalInfo;
      traveler.guardian = guardianDetails;
      traveler.ssr = ssr;
      traveler.personalInfoCompleted = true;

      // Encrypt the travelers array
      const encryptedTravelers = this.encryptObject(this.travelers);

      // Store the encrypted travelers array in session storage
      sessionStorage.setItem("travelers", encryptedTravelers);

      // Emit the updated travelers array
      this.updatedTravelerArr.emit(this.travelers);

      // Close the dialog box
      this.dialogbox();
      console.log(this.travelers);
    } else {
      console.error("Traveler not found with UID:", this.currentTravelerUid);
    }
  }

  dialogbox() {
    this.closeDialog.emit(this.currentTravelerUid);
  }

  resetTravelerDetails(currentTravelerUid: string) {
    // Find the traveler from the travelers array based on the UID
    const travelerIndex = this.travelers.findIndex(
      (traveler) => traveler.uid === currentTravelerUid
    );

    if (travelerIndex !== -1) {
      // Get current date
      const currentDate = new Date();

      // Reset the traveler's details to default values
      this.travelers[travelerIndex] = {
        ...this.travelers[travelerIndex],
        personalInfo: {
          Title: "",
          FirstName: "",
          LastName: "",
          PaxType: "",
          DateOfBirth: currentDate,
          Gender: "",
          GSTCompanyAddress: "",
          GSTCompanyContactNumber: "",
          GSTCompanyName: "",
          GSTNumber: "",
          GSTCompanyEmail: "",
          PassportNo: "",
          PassportIssueDate: currentDate,
          PassportExpiry: currentDate,
          AddressLine1: "",
          AddressLine2: "",
          City: "",
          CountryCode: "",
          CountryName: "",
          ContactNo: "",
          Nationality: "",
          Email: "",
          Phoneno: "",
          PAN: "",
          Age: "",
          LeadPassenger: false,
        },
        guardian: {
          Title: null,
          FirstName: null,
          LastName: null,
          PAN: null,
          PassportNo: null,
        },
        ssr: {
          extraBaggage: null,
          meal: null,
          seat: null,
        },
        personalInfoCompleted: false,
      };

      // Encrypt the travelers array
      const encryptedTravelers = this.encryptObject(this.travelers);

      // Update the session storage
      sessionStorage.setItem("travelers", encryptedTravelers);

      // Emit the updated travelers array
      this.updatedTravelerArr.emit(this.travelers);

      console.log("Traveler details reset:", this.travelers[travelerIndex]);
    } else {
      console.error("Traveler not found with UID:", currentTravelerUid);
    }
  }


  loadTravelerDetails() {
    const encryptedTravelers = sessionStorage.getItem('travelers');
    if (encryptedTravelers) {
      this.travelers = this.decryptObject(encryptedTravelers);
      if (this.travelers.length > 0) {
        
       const traveler=this.findTraveler(this.currentTravelerUid);
      console.log(traveler );
      console.log(this.travelers)
        this.fillTravelerForm(traveler);
      }
    }
  }

  fillTravelerForm(traveler:Traveler) {
    this.travelerForm.patchValue({
      ...traveler,
      personalInfo: {
        Title: traveler.personalInfo.Title,
        FirstName: traveler.personalInfo.FirstName,
        LastName: traveler.personalInfo.LastName,
        DateOfBirth: new Date(traveler.personalInfo.DateOfBirth),
        Gender: traveler.personalInfo.Gender,
        Nationality: traveler.personalInfo.Nationality,
        CountryCode: traveler.personalInfo.CountryCode,
        City: traveler.personalInfo.City,
        CountryName: traveler.personalInfo.CountryName,
        AddressLine1: traveler.personalInfo.AddressLine1,
        AddressLine2: traveler.personalInfo.AddressLine2,
        Email: traveler.personalInfo.Email,
        ContactNo: traveler.personalInfo.ContactNo,
        Phoneno: traveler.personalInfo.Phoneno,
        PAN: traveler.personalInfo.PAN,
        PassportNo: traveler.personalInfo.PassportNo,
        PassportIssueDate: new Date(traveler.personalInfo.PassportIssueDate),
        PassportExpDate: new Date(traveler.personalInfo.PassportExpDate),
        PassportExpiry: traveler.personalInfo.PassportExpiry,
        Age: traveler.personalInfo.Age,
        LeadPassenger: traveler.personalInfo.LeadPassenger,
      },
      guardianDetails: {
        Title: traveler.guardian.Title,
        FirstName: traveler.guardian.FirstName,
        LastName: traveler.guardian.LastName,
        PAN: traveler.guardian.PAN,
        PassportNo: traveler.guardian.PassportNo,
      },
      ssr: {
        extraBaggage: traveler.ssr.extraBaggage,
        meal: traveler.ssr.meal,
        seat: traveler.ssr.seat,
      }
    });
    console.log(traveler,"In fill travel forms")
  }

  encryptObject(obj: any): string {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(obj),
      environment.ENCRYPT_KEY
    ).toString();
    return encrypted;
  }

  decryptObject(encryptedData: string): any {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData,
      environment.ENCRYPT_KEY
    ).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  }














  // handleSSR(formGroupName: string, controlName: string, item: any): void {
  //   console.log(item);
  //   this.travelerForm.get(formGroupName).get(controlName).setValue(item);
  //   const srrGroup = this.travelerForm.get(formGroupName) as FormGroup;

  //   const ssr = srrGroup.get(controlName);
  //   ssr.setValue(item);

  //   this.updatePrice();

  //   console.log(this.travelerForm.value);
  // }

  updatePrice(): void {
    if (!this.price[this.currentIndex]) {
      this.price[this.currentIndex] = { baggage: 0, meal: 0, seat: 0 };
    }
    const ssrForm = this.travelerForm.get("ssr") as FormGroup;
    if (this.ssr) {
      // Update this.price based on ssr values
      this.price[this.currentIndex].baggage =
        ssrForm.get("extraBaggage").value?.Price || 0;
      this.price[this.currentIndex].meal =
        ssrForm.get("meal").value?.Price || 0;
      this.price[this.currentIndex].seat = Number(
        (ssrForm.get("seat").value || []).map((item) => {
          const price = parseFloat(item.Price);
          return isNaN(price) ? 0 : price;
        })
      );
    }
  }

  async addTraveler() {
    const traveler = this.travelers.find(
      (traveler) => traveler.uid === this.currentTravelerUid
    );

    // Extract traveler data from the form
    const newTraveler = { ...this.travelerForm.value };

    // Save passenger data
    // await this.savePassengerData(newTraveler);

    // Update traveler at current index
    this.travelers[this.currentIndex] = newTraveler;

    // Reset form and emit changes
    this.travelerForm.reset();
    this.updatedTravelerArr.emit(this.travelers);

    // Increment index and check if reached the end
    this.currentIndex++;
    if (this.currentIndex >= this.NoOfTravellers) {
      this.dialogbox();
      this.priceChange.emit(this.price);
    }
    // Increment current traveler count
    if (this.currentTravellerCount <= this.NoOfTravellers) {
      this.currentTravellerCount++;
    }
    // Increment selected card
    this.selectedCard++;
  }

  // async savePassengerData(form: any) {
  //   try {
  //     const res = await this.pack.savePerPassengerData(
  //       form,
  //       this.currentIndex,
  //       localStorage.getItem("uid")
  //     );
  //     console.log(res);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // updateTraveller() {
  //   this.shouldUpdateFormValues = true;
  //   const updatedTraveler = { ...this.travelerForm.value };

  //   this.travelers[this.currentIndex] = {
  //     ...this.travelers[this.currentIndex],
  //     ...this.travelerForm.value,
  //   };

  //   this.savePassengerData(this.travelers);
  //   console.log(this.travelers);
  //   console.log("in update end");
  //   this.shouldUpdateFormValues = false;
  // }

  // to convert number into array
  getArray(length: number): any[] {
    return new Array(length);
  }

  handleCardClick(index: number) {
    console.log("Before update:", this.currentIndex);

    this.zone.run(() => {
      // this.editIndex=index;
      this.currentIndex = index;
      console.log(this.currentIndex);
      this.selectedCard = index;
      this.cdr.detectChanges();
      const travelerData = this.travelers[this.currentIndex];
      console.log(this.travelData);

      if (travelerData) {
        this.travelerForm.patchValue({
          personalInfo: {
            FirstName: travelerData?.personalInfo?.FirstName || "",
            Title: travelerData?.personalInfo?.Title || "",
            LastName: travelerData?.personalInfo?.LastName || "",
            DateOfBirth: travelerData?.personalInfo?.DateOfBirth || "",
            Gender: travelerData?.personalInfo?.Gender || "",
            Nationality: travelerData?.personalInfo?.Nationality || "",
            PAN: travelerData?.personalInfo?.PAN || "",
            AddressLine1: travelerData?.personalInfo?.AddressLine1 || "",
            AddressLine2: travelerData?.personalInfo?.AddressLine2 || "",
            Email: travelerData?.personalInfo?.Email || "",
            ContactNo: travelerData?.personalInfo?.ContactNo || "",
            PassportNo: travelerData?.personalInfo?.PassportNo || "",
            PassportIssueDate:
              travelerData?.personalInfo?.PassportIssueDate || "",
            PassportExpiryDate:
              travelerData?.personalInfo?.PassportExpiryDate || "",
            Age: travelerData?.personalInfo?.Age || "",
            City: travelerData?.personalInfo?.City || "",
            Country: travelerData?.personalInfo?.Country || "",
          },
          dates: {
            dob: {
              day: travelerData?.dates?.dob?.day || "",
              month: travelerData?.dates?.dob?.month || "",
              year: travelerData?.dates?.dob?.year || "",
            },
            passportIssue: {
              day: travelerData?.dates?.passportIssue?.day || "",
              month: travelerData?.dates?.passportIssue?.month || "",
              year: travelerData?.dates?.passportIssue?.year || "",
            },
            passportExpiry: {
              day: travelerData?.dates?.passportExpiry?.day || "",
              month: travelerData?.dates?.passportExpiry?.month || "",
              year: travelerData?.dates?.passportExpiry?.year || "",
            },
          },
          guardianDetails: {
            Title: travelerData?.guardianDetails?.Title || "",
            FirstName: travelerData?.guardianDetails?.FirstName || "",
            LastName: travelerData?.guardianDetails?.LastName || "",
            PAN: travelerData?.guardianDetails?.PAN || "",
            PassportNo: travelerData?.guardianDetails?.PassportNo || "",
          },
          ssr: {
            extraBaggage: travelerData?.ssr?.extraBaggage || "",
            meal: travelerData?.ssr?.meal || "",

            seat: travelerData?.ssr?.seat || "",
          },
        });
        console.log(this.travelerForm.value);
      }
    });
  }

  // DEPARTURE------- Airports & Cities----------------------------
  citySearchText: string;
  citySearchResponse = [];

  async onDepartureSearch() {
    try {
      // Check if search text is null, empty, or whitespace
      if (!this.citySearchText || this.citySearchText.trim() === "") {
        // Clear search results

        this.citySearchResponse = [];
        return; // Stop execution
      }

      console.log("Departure Search:", this.citySearchText);

      const responseCities = await this.debounce.getCities(this.citySearchText);

      console.log(responseCities);

      // Update state if responses are available

      if (responseCities) {
        this.citySearchResponse = responseCities.data.cities;
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  onCityInputChange(): void {
    this.departureSearchSubject.next(this.citySearchText);
  }

  // =================NATIONALITY =================================

  nationalitySearchText: string;
  nationalitySearchArr = [];

  async onNationalitySearch() {
    console.log("in onNationalitySearch");
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

      const responseCountries = await this.debounce.getCountries(
        this.nationalitySearchText
      );

      console.log(responseCountries);
      if (responseCountries) {
        this.nationalitySearchArr = responseCountries.data.countries;
      }
    } catch (err) {
      console.error(err.message);
    }
  }
  onNationalityInputChange(): void {
    console.log("in onNationalityInputChange");
    this.nationalitySearchSubject.next(this.nationalitySearchText);
  }

  // ================================COUNTRY=========================================
  countrySearchText: string;
  countrySearchArr = [];

  async onCountrySearch() {
    try {
      // Check if search text is null, empty, or whitespace

      if (!this.countrySearchText || this.countrySearchText.trim() === "") {
        // Clear search results

        this.countrySearchArr = [];
        return; // Stop execution
      }
      console.log("Departure Search:", this.countrySearchText);

      const responseCountries = await this.debounce.getCountries(
        this.countrySearchText
      );

      console.log(responseCountries);
      if (responseCountries) {
        this.countrySearchArr = responseCountries.data.countries;
      }
    } catch (err) {
      console.error(err.message);
    }
  }
  onCountryInputChange(): void {
    console.log("in onCountryInputChange");
    this.countrySearchSubject.next(this.countrySearchText);
  }
}
