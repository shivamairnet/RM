import {
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { HotelsService } from "src/app/Services/hotels_api/hotels.service";
import { Cashfree, load } from "@cashfreepayments/cashfree-js";
import { cashfree } from "./util";
import axios from "axios";
import { TransactionsService } from "src/app/Services/transactions.service";
import { hotel_details } from "../../components/package-cancellation/hotel_details";
import { DatePipe } from "@angular/common";
import { PackageService } from "src/app/Services/package/package.service";
import { NgxSpinnerService } from "ngx-spinner";
import { FlightsService } from "src/app/Services/flights_api/flights.service";
import { environment } from "src/environments/environment";
import * as CryptoJS from "crypto-js";
import { Room, Traveler } from "src/app/classes/packageCheckoutInterface";
import { v4 as uuidv4 } from "uuid";
import { fareQuote } from "src/app/components/combined-policy/flight_details";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-package-checkout",
  templateUrl: "./package-checkout.component.html",
  styleUrls: ["./package-checkout.component.scss"],
})
export class PackageCheckoutComponent implements OnInit, OnChanges {
  dialog: boolean = false;
  contactForm: FormGroup;
  seeAllTravellers: boolean = false;
  merchantShare: number = 0;

  travelers: Traveler[] = [];

  editIndex: number = 0;
  @Input() TraceId: any;
  @Input() ResultIndex: any;
  transactionFee: number;
  totalCost: any;
  initialCost: any;
  loading: boolean;
  sessionId: string;
  version: string;
  pay: boolean = false;
  gst: number = 0;
  ssrPrice: any;
  baggagePrice: number;
  seatPrice: number;
  mealPrice: number;
  ssr: any;
  ssr1: any;
  ssr2: any;
  isToggle: boolean = true;
  isCollapsed: boolean = true;
  isDateCollapsed: boolean = true;
  isExclusionCollapsed: boolean = true;
  arrowTermDirection = "down";
  arrowDirection = "down";
  arrowDateDirection = "down";
  arrowExclusionDirection = "down";
  taxesSectionExpanded: boolean = false;

  // checkbox
  checkBox1: boolean = false;
  checkBox2: boolean = false;

  // dialog box variables
  privacyDialog: boolean = false;
  termsDialog: boolean = false;
  refundibleDialog: boolean = false;

  // cancel variables

  packageDialog: boolean;

  recievedHotels;
  recievedFlights;
  docUid: string;

  tripObj;

  constructor(
    private hotels: HotelsService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private zone: NgZone,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private transact: TransactionsService,
    private pack: PackageService,
    private flight: FlightsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.docUid = params.uid;

      if (this.docUid) {
        // getting the data from the DB with respect to the UID store in  the session storage
        this.getData(this.docUid);
      }
    });

    // Retrieve and decrypt session storage data
    if (sessionStorage.getItem("hotels") && sessionStorage.getItem("flights")) {
      try {
        const encryptedHotels = sessionStorage.getItem("hotels");
        const encryptedFlights = sessionStorage.getItem("flights");

        this.recievedHotels = this.decryptObject(encryptedHotels);
        this.recievedFlights = this.decryptObject(encryptedFlights);

        console.log("Hotels:", this.recievedHotels);
        console.log("Flights:", this.recievedFlights);
      } catch (error) {
        console.error("Error decrypting data:", error);
      }
    }

    // calling the fare quote call for the flight set
    this.getFareQuote();

    // getting the passengers data if already present
    // this.getPassengerData();

    // initializing the primary contact details form
    // this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["travelers"]) {
      this.allDetailsOnceFilled();
    }
  }

  // using recieved document
  NoOfRooms: number = 0;
  NoOfAdults: number = 0;
  NoOfChild: number = 0;
  NoOfInfants:number= 0;
  travelData: any;
  NoOfTravellers: number;
  roomGuests: any;

  async getData(docUid: string) {
    console.log("Fetching data...");

    try {
      const res = await this.pack.getTripData(docUid);

      console.log("GOT TRIP DATA FROM BACKEND", res);
      if (res?.result?.trip) {
        this.tripObj = res.result.trip;

        this.roomGuests=this.tripObj.RoomGuests;
        this.travelers = this.tripObj.travellers.travelersArr;


        this.NoOfTravellers = this.travelers.length;
        this.NoOfAdults = this.travelers.filter(
          (traveler) => traveler.travelerTypeCode === 1
        ).length;
        this.NoOfChild = this.travelers.filter(
          (traveler) => traveler.travelerTypeCode === 2
        ).length;
        this.NoOfInfants = this.travelers.filter(
          (traveler) => traveler.travelerTypeCode === 3
        ).length;
        this.NoOfRooms=this.roomGuests.length;

        console.log(this.travelers);
      }
    } catch (err) {
      console.error("Not able fetch document from Database");
      this.tripObj = -1;
    }

    // try {
    //   if (this.recievedDocument) {
    //     const { trip: { RoomGuests } } = this.recievedDocument;
    //     this.travelData = this.recievedDocument;
    //     this.RoomGuests = RoomGuests;
    //     this.NoOfRooms = RoomGuests.length;

    //     const totals = RoomGuests.reduce((acc, room) => {
    //       acc.NoOfAdults += room.NoOfAdults;
    //       acc.NoOfChild += room.NoOfChild;
    //       return acc;
    //     }, { NoOfAdults: 0, NoOfChild: 0 });

    //     RoomGuests.forEach(room=>{
    //      const childAge= room.ChildAge
    //     })

    //     this.NoOfAdults = totals.NoOfAdults;
    //     this.NoOfChild = totals.NoOfChild;
    //     this.NoOfTravellers = this.NoOfAdults + this.NoOfChild;

    //     // Uncomment and use if needed
    //     // console.log("Hotels to call block room", this.recievedHotels);
    //     // this.callHotelBlockRooom(this.recievedHotels);
    //   } else {
    //     console.log("Unable to retrieve the document containing room guests from session storage.");
    //   }
    // } catch (error) {
    //   console.error("An error occurred:", error);
    // }
  }


  // age needs to be calculated from DOB . we will only get the number of adults , child and infants

  //  processRoomGuests(roomGuests: Room[]): Traveler[] {

  //   const defaultDate = new Date();

  //   const travelers: Traveler[] = [];

  //   roomGuests.forEach((room) => {
  //     // Process adults
  //     for (let i = 0; i < room.NoOfAdults; i++) {
  //       travelers.push({
  //         travelerType: 'adult',
  //         travelerTypeCode: 1,
  //         age: -1,
  //         uid: uuidv4(),
  //         personalInfoCompleted:false,
  //         personalInfo: {
  //           FirstName: '',
  //           Title: '',
  //           LastName: '',
  //           DateOfBirth: defaultDate,
  //           Gender: '',
  //           Nationality: '',
  //           AddressLine1: '',
  //           AddressLine2: '',
  //           Email: '',
  //           ContactNo: '',
  //           Phoneno: 0,
  //           PAN: '',
  //           PassportNo: '',
  //           PassportIssueDate: defaultDate,
  //           PassportExpDate: defaultDate,
  //           PassportExpiry: defaultDate,
  //           Age: -1,
  //           PaxType: 0,
  //           CountryCode: '',
  //           City: '',
  //           CountryName: '',
  //           LeadPassenger: false,
  //         },
  //         guardian: {
  //           Title: '',
  //           FirstName: '',
  //           LastName: '',
  //           PAN: '',
  //           PassportNo: '',
  //         },
  //         ssr: {
  //           extraBaggage: '',
  //           meal: '',
  //           seat: '',
  //         },
  //       });
  //     }

  //     // Process children
  //     if(room.NoOfChild>0){

  //     room.ChildAge.forEach((age) => {
  //       // child age greater than 2 and lesser or eqaul to 11
  //       if (age > 2 && age <= 11) {
  //         travelers.push({
  //           travelerType: 'child',
  //           travelerTypeCode: 2,
  //           age,
  //           uid: uuidv4(),
  //           personalInfoCompleted:false,
  //           personalInfo: {
  //             FirstName: '',
  //             Title: '',
  //             LastName: '',
  //             DateOfBirth: defaultDate,
  //             Gender: '',
  //             Nationality: '',
  //             AddressLine1: '',
  //             AddressLine2: '',
  //             Email: '',
  //             ContactNo: '',
  //             Phoneno: 0,
  //             PAN: '',
  //             PassportNo: '',
  //             PassportIssueDate: defaultDate,
  //             PassportExpDate: defaultDate,
  //             PassportExpiry: defaultDate,
  //             Age: age,
  //             PaxType: 0,
  //             CountryCode: '',
  //             City: '',
  //             CountryName: '',
  //             LeadPassenger: false,
  //           },
  //           guardian: {
  //             Title: '',
  //             FirstName: '',
  //             LastName: '',
  //             PAN: '',
  //             PassportNo: '',
  //           },
  //           ssr: {
  //             extraBaggage: '',
  //             meal: '',
  //             seat: '',
  //           },
  //         });
  //       }
  //       // infant be lesser than 2 and greaer than 0
  //       else if (age <= 2 && age>0) {
  //         travelers.push({
  //           travelerType: 'infant',
  //           travelerTypeCode: 3,
  //           age,
  //           uid: uuidv4(),
  //           personalInfoCompleted:false,
  //           personalInfo: {
  //             FirstName: '',
  //             Title: '',
  //             LastName: '',
  //             DateOfBirth: defaultDate,
  //             Gender: '',
  //             Nationality: '',
  //             AddressLine1: '',
  //             AddressLine2: '',
  //             Email: '',
  //             ContactNo: '',
  //             Phoneno: 0,
  //             PAN: '',
  //             PassportNo: '',
  //             PassportIssueDate: defaultDate,
  //             PassportExpDate: defaultDate,
  //             PassportExpiry: defaultDate,
  //             Age: age,
  //             PaxType: 0,
  //             CountryCode: '',
  //             City: '',
  //             CountryName: '',
  //             LeadPassenger: false,
  //           },
  //           guardian: {
  //             Title: '',
  //             FirstName: '',
  //             LastName: '',
  //             PAN: '',
  //             PassportNo: '',
  //           },
  //           ssr: {
  //             extraBaggage: '',
  //             meal: '',
  //             seat: '',
  //           },
  //         });
  //       }
  //     });
  //   }

  //   });

  //   return travelers;
  // }

  // helper for getData


  getPluralLabel(value, singular, plural) {
    return value === 1 ? singular : plural;
  }

  // helper for Frontend
  formatRoomGuests(NoOfRooms, NoOfAdults, NoOfChild, NoOfInfant) {
    const roomLabel = this.getPluralLabel(NoOfRooms, "Room", "Rooms");
    const adultLabel = this.getPluralLabel(NoOfAdults, "Adult", "Adults");
    const childLabel = this.getPluralLabel(NoOfChild, "Child", "Children");
    const infantLabel = this.getPluralLabel(NoOfInfant, "Infant", "Infants");
  
    const parts = [];
  
    if (NoOfRooms > 0) {
      parts.push(`${NoOfRooms} ${roomLabel}`);
    }
    if (NoOfAdults > 0) {
      parts.push(`${NoOfAdults} ${adultLabel}`);
    }
    if (NoOfChild > 0) {
      parts.push(`${NoOfChild} ${childLabel}`);
    }
    if (NoOfInfant > 0) {
      parts.push(`${NoOfInfant} ${infantLabel}`);
    }
  
    return parts.join(' | ');
  }
  

  // ===================================FLIGHTS CALLS============================================

  // 1.Fare RULE

  // 2.FARE QUOTE
  fareQuote;

    isFareQuoteSuccess:boolean=false
  async getFareQuote() {
    const payload = {
      traceId: this.recievedFlights.flightTraceId,
      resultIndex: this.recievedFlights.flightResultIndex,
    };

    try {
      const { fareQuote } = await this.flight.fareQuote(payload);
      console.log("FARE QUOTE RESPONSE", fareQuote);

      if (fareQuote && fareQuote?.Response?.Error.ErrorCode === 0) {
        if (fareQuote?.Response?.IsPriceChanged) {
          // price has changed, need to notify and refresh
          const changedPublishedFare =
            fareQuote?.Response?.Results?.Fare.PublishedFare;
        } else {
          // need to set the all the FLIGHT FARES from here
        }

        this.fareQuote = fareQuote?.Response;
        this.isFareQuoteSuccess=true;
        this.getSSR();
      } else {
        // error while getting fareQuote Response
        const errorCode = fareQuote?.Response?.Error.ErrorCode;
        const errorMessage = fareQuote?.Response?.Error.ErrorMessage;

        console.error(errorCode,errorMessage)
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // 3. SSR
  flightSSR;
  async getSSR() {
    const payload = {
      traceId: this.recievedFlights.flightTraceId,
      resultIndex: this.recievedFlights.flightResultIndex,
    };

    try {
      const { ssr } = await this.flight.ssrCall(payload);

      console.log("SSR RESPONSE :", ssr);

      if (
        ssr.Response.ResponseStatus == 1 &&
        ssr.Response.Error.ErrorCode === 0
      ) {
        this.flightSSR = {
          meals: ssr.Response.Meal,
          seats: ssr.Response.SeatPreference,
        };

        console.log(this.flightSSR);
      } else {
        console.log("error in fetching ssr");

        const errorCode = ssr?.Response?.Error.ErrorCode;
        const errorMessage = ssr?.Response?.Error.ErrorMessage;
      }
    } catch (err) {
      console.log(err.message);
    }
  }

 

  leadPassengerUid: string = "";

  setLeadPassenger(uid: string) {
    this.travelers.forEach((traveler) => {
      traveler.personalInfo.LeadPassenger = traveler.uid === uid;
    });
  }

  allDetailsFilled: boolean = false;
  allDetailsOnceFilled() {
    this.allDetailsFilled = this.travelers.every(
      (traveler) => traveler.personalInfoCompleted
    );
  }

  finalBookPackage() {
    // flights
    // hotels
  }

  async hotelBlockRoom() {
    try {
      const payload = {
        recievedHotels: this.recievedHotels,
      };
      const res = await this.hotels.hotelBlockRoom(payload);
      console.log(res);
    } catch (err) {
      console.log(err.message);
    }
  }   



  // ==============================================================================================================
  // async callHotelBlockRooom(hotels) {
  //   try {
  //     // // Convert the array of objects to a JSON string
  //     // const jsonString = JSON.stringify(hotels, null, 2); // Pretty-print with indentation

  //     // // Create a Blob from the JSON string
  //     // const blob = new Blob([jsonString], { type: "application/json" });
  //     // const blobUrl = URL.createObjectURL(blob);
  //     // console.log("Blob URL:", blobUrl);

  //     console.log(hotels, "in call block room");
  //     for (const item of hotels) {
  //       for (const hotel of item.hotels) {
  //         const payload = {
  //           ResultIndex: hotel?.hotel.search?.ResultIndex,
  //           HotelName: hotel?.hotel.search?.HotelName,
  //           HotelCode: hotel?.hotel.search?.HotelCode,
  //           NoOfRooms: hotel?.roomDetails?.length,
  //           // IsVoucherBooking: environment.HOTEL_Is_Voucher_Booking,
  //           // GuestNationality: environment.HOTEL_GUEST_NATIONALITY,
  //           HotelRoomsDetails: hotel?.roomDetails?.map((room) => room.room),
  //           TraceId: hotel?.hotel?.info.HotelInfoResult.TraceId,
  //         };

  //         console.log(payload);

  //         const res = await this.hotels.hotelBlockRoom(payload);
  //         console.log(res);
  //         // to update the rooms array in the DB in the according to the response
  //         // this.updateRoomDetails(
  //         //   res?.BlockRoomResult?.HotelRoomsDetails,
  //         //   item.checkInDate,
  //         //   item.cityName
  //         // );
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //     // Handle the error appropriately, e.g., display an error message to the user
  //   } finally {
  //     // Ensure that the spinner is hidden after all iterations
  //     this.spinner.hide();
  //   }
  // }

  // to update the rooms details of the hotel according to the cityName and checkInDate in the DB ---> pending
  
  async updateRoomDetails(rooms: any, checkInDate: string, cityName) {
    const hotelRooms = rooms.map((item: any) => {
      if (item) {
        const {
          RoomIndex,
          RoomTypeCode,
          RoomTypeName,
          RatePlanCode,
          BedTypeCode,
          SmokingPreference,
          Supplements,
          Price,
        } = item;

        // Mapping SmokingPreference values to the corresponding numeric values
        let updatedSmokingPreference;
        switch (SmokingPreference) {
          case "NoPreference":
            updatedSmokingPreference = 0;
            break;
          case "Smoking":
            updatedSmokingPreference = 1;
            break;
          case "NonSmoking":
            updatedSmokingPreference = 2;
            break;
          case "Either":
            updatedSmokingPreference = 3;
            break;
          default:
            updatedSmokingPreference = SmokingPreference; // Keeping original value if not recognized
        }

        const updatedRoom = {
          RoomIndex: RoomIndex || "",
          RoomTypeCode: RoomTypeCode || "",
          RoomTypeName: RoomTypeName || "",
          RatePlanCode: RatePlanCode || "",
          BedTypeCode: BedTypeCode || "",
          SmokingPreference: updatedSmokingPreference, // Updated SmokingPreference value
          Supplements: Supplements || "",
          Price: Price || "",
        };

        return {
          updatedRoom,
        };
      }

      // If item.room doesn't exist, return the original item
      return item;
    });

    console.log(hotelRooms);
    try {
      const res = await this.pack.updateRoomDetails(
        hotelRooms,
        sessionStorage.getItem("uid"),
        checkInDate,
        cityName
      );
      console.log(res);
    } catch (error) {
      console.log(error.message);
    }
  }

  toggleExclusionCollapse() {
    this.isExclusionCollapsed = !this.isExclusionCollapsed;
    this.arrowExclusionDirection = this.isExclusionCollapsed ? "down" : "up";
  }

  areAllCheckboxesChecked(): boolean {
    return this.checkBox1 && this.checkBox2;
  }

  handleupdationInTravelerArr(travelerArray: Traveler[]): void {
    // // Process the traveler array data received from the child component
    console.log(travelerArray);
    // this.travelers = travelerArray;
    // console.log(this.travelers);
    // this.zone.run(() => {
    //   this.cdr.detectChanges();
    // });
  }

  async getPassengerData() {
    // console.log("passengers fetching");
    // try {
    //   const res = await this.pack.getPassengerDetails();
    //   console.log(res.passengers);
    //   if (
    //     this.NoOfTravellers > 0 &&
    //     Array.isArray(res.passengers) &&
    //     res.passengers.length > 0
    //   ) {
    //     this.travelers = res.passengers
    //       .slice(0, this.NoOfTravellers)
    //       .map((passengerData) => {
    //         const { personalInfo, ssr, dates, guardianDetails } = passengerData;
    //         return {
    //           personalInfo: {
    //             ...personalInfo,
    //             LeadPassenger: personalInfo.LeadPassenger || true,
    //           },
    //           ssr: { ...ssr },
    //           dates: { ...dates },
    //           guardianDetails: { ...guardianDetails },
    //         };
    //       });
    //   } else {
    //     this.initializeTravelersArray();
    //   }
    //   console.log("traveler", this.travelers);
    // } catch (error) {
    //   console.log(error);
    // }
  }

  initializeTravelersArray() {
    // this.travelers = [];
    // for (let i = 0; i < this.NoOfTravellers; i++) {
    //   const isLeadPassenger = i === 0;
    //   const paxType = isLeadPassenger ? 1 : 2;
    //   this.travelers.push({
    //     personalInfo: {
    //       FirstName: "",
    //       Title: "",
    //       LastName: "",
    //       DateOfBirth: "",
    //       Gender: "",
    //       Nationality: "",
    //       AddressLine1: "",
    //       AddressLine2: "",
    //       Email: "",
    //       ContactNo: "",
    //       PAN: "",
    //       PassportNo: "",
    //       PassportIssueDate: "",
    //       PassportExpDate: "",
    //       PassportExpiry: "",
    //       Age: "",
    //       PaxType: paxType,
    //       CountryCode: "",
    //       City: "",
    //       CountryName: "",
    //       LeadPassenger: isLeadPassenger,
    //     },
    //     dates: {
    //       dob: { day: "", month: "", year: "" },
    //       passportIssue: { day: "", month: "", year: "" },
    //       passportExpiry: { day: "", month: "", year: "" },
    //     },
    //     guardianDetails: {
    //       Title: "",
    //       FirstName: "",
    //       LastName: "",
    //       PAN: "",
    //       PassportNo: "",
    //     },
    //     ssr: {
    //       extraBaggage: "",
    //       meal: "",
    //       seat: "",
    //     },
    //   });
    // }
  }
  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ["", Validators.required],
      phone: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      address: [""],
    });
  }

  currentTravelerUid: string;

  dialogbox(uid: string) {
    console.log(uid);
    this.dialog = !this.dialog;
    this.currentTravelerUid = uid;
  }

  privacyDialogBox() {
    console.log("privacy");
    this.privacyDialog = !this.privacyDialog;
  }
  termsDialogBox() {
    console.log("terms");
    this.termsDialog = !this.termsDialog;
  }
  refundibleDialogBox() {
    console.log("refundible");
    this.refundibleDialog = !this.refundibleDialog;
  }
  packageDialogBox() {
    console.log("package");
    this.packageDialog = !this.packageDialog;
  }

  async submit() {
    // this.pay = true;
    // console.log(this.contactForm.value);
    // console.log(this.travelers);
    // await this.pack.updatePrimaryContact(
    //   this.contactForm.value,
    //   localStorage.getItem("uid")
    // );
    // await this.pack.savePassengerDetails(
    //   this.travelers,
    //   localStorage.getItem("uid")
    // );
  }

  addBox() {
    this.seeAllTravellers = !this.seeAllTravellers;
  }
  // to convert number into array
  getArray(length: number): any[] {
    return new Array(length);
  }

  // when ever merchant changes its share than the total price will be calculated by this function
  onMerchantShareChange() {
    console.log("Merchant Share changed:", this.merchantShare);

    const costChange = this.totalCost - this.initialCost;
    this.gst = this.merchantShare * 0.18;
    this.gst = +this.gst.toFixed(2);
    this.totalCost = this.initialCost + this.merchantShare + this.gst;
    this.transactionFee = 0.0175 * this.totalCost;

    // Round to two decimal places
    this.transactionFee = +this.transactionFee.toFixed(2);

    // Update totalCost with the transaction fee
    this.totalCost += this.transactionFee;

    // Update initialTotalCost to the latest totalCost
    if (this.merchantShare == null || this.merchantShare === 0) {
      this.totalCost = this.initialCost;
    }

    // Round totalCost to two decimal places
    this.totalCost = +this.totalCost.toFixed(2);
  }

  // Pay Now flow
  getPaymentLink() {
    const formValues = this.contactForm.value;
    formValues.totalCost = this.totalCost;
    formValues.transactionFee = this.transactionFee;
    formValues.merchantShare = this.merchantShare;
    formValues.flightCost = this.travelData.cost.flightCost;
    formValues.hotelCost = this.travelData.cost.taxes;
    formValues.taxes = this.travelData.cost.hotelCost;

    this.saveUserDetails(formValues);
  }

  // save transaction details
  async saveUserDetails(formValues: any) {
    console.log("saving");
    try {
      const res = await this.transact.saveUserPaymentDetails(formValues);
      console.log(res);
      // Assuming 'this.router' is an instance of the Angular Router service
      this.getSessionId(res, formValues);
    } catch (error) {
      console.log(error);
    }
  }

  async initializeCashfree(): Promise<void> {
    try {
      const cashfree: Cashfree = await load({ mode: "sandbox" }); // Adjust the initialization based on the actual structure of your Cashfree library
      this.version = cashfree.version(); // Assuming a default version
    } catch (error) {
      console.error("Error initializing Cashfree:", error);
    }
  }

  async getSessionId(order_id: string, form: any): Promise<void> {
    this.loading = true;

    try {
      const res = await axios.post("http://localhost:4000/createOrder", {
        version: this.version,
        form: form,
        order_id: order_id,
      });
      this.loading = false;
      this.sessionId = res.data;
      if (res.data.success) {
        // const redirectUrl = res.data.data.payments.url;
        // window.location.href = redirectUrl;
        // console.log(res.data.data)
        const sessionId = res.data.data.payment_session_id;
        this.handlePayment(sessionId, order_id);
      }
    } catch (err) {
      this.loading = false;
      console.error("Error fetching sessionId:", err);
    }
  }
  handlePayment(sessionId: string, order_id: string): void {
    const checkoutOptions = {
      paymentSessionId: sessionId,
      returnUrl: `http://localhost:4200/success/${localStorage.getItem("uid")}`,
    };

    cashfree.then((cf) => {
      cf.checkout(checkoutOptions).then(function (result) {
        if (result.error) {
          alert(result.error.message);
        }
        if (result.redirect) {
          console.log("Redirection");
          console.log(result);
        }
      });
    });
  }

  // generate payment link flow

  // booking calls

  async bookNonLCCflights() {
    const payload = {
      travelers: this.travelers,
      fareQuote: this.fareQuote,
    };

    // Create a Blob from the payload
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const payloadBlobUrl = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const tempLink = document.createElement("a");
    tempLink.href = payloadBlobUrl;
    tempLink.download = "payload.txt"; // Name of the file to be downloaded
    tempLink.style.display = "none";
    document.body.appendChild(tempLink);
    tempLink.click(); // Trigger the download
    document.body.removeChild(tempLink); // Clean up the DOM

    try {
      const { data } = await axios.post(
        `${environment.BACKEND_BASE_URL}/flight/nonLCCFlightBook`,
        payload
      );
      console.log(data);
    } catch (err) {
      console.log(err.message);
    }
  }

  ticketFlights() {}

  // ========see more  & see less functionaity  for traveler cards===================================
  showAllRows = false;

  get firstRowTravelers() {
    return this.travelers.slice(0, 4);
  }

  get remainingTravelers() {
    return this.travelers.slice(4);
  }

  toggleRows() {
    this.showAllRows = !this.showAllRows;
  }

  // ====================================================================

  // Decrypt the data using AES
  decryptObject(encryptedData: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(
        encryptedData,
        environment.ENCRYPT_KEY
      ).toString(CryptoJS.enc.Utf8);

      return JSON.parse(decrypted);
    } catch (error) {
      console.error("Decryption failed:", error);
      return null; // or handle the error as needed
    }
  }
}
