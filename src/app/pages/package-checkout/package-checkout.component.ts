import {
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnInit,
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

@Component({
  selector: "app-package-checkout",
  templateUrl: "./package-checkout.component.html",
  styleUrls: ["./package-checkout.component.scss"],
})
export class PackageCheckoutComponent implements OnInit {
  NoOfRooms: number = 0;
  NoOfAdults: number = 0;
  NoOfChild: number = 0;
  travelData: any;
  dialog: boolean = false;
  contactForm: FormGroup;
  Travellers: boolean = true;
  merchantShare: number = 0;
  travelers = [] as any[];
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
  NoOfTravellers: number;
  RoomGuests: any;

  recievedHotels;
  recievedFlights;
  recievedDocument;

  constructor(
    private hotels: HotelsService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private zone: NgZone,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private transact: TransactionsService,
    private pack: PackageService,
    private flight: FlightsService
  ) {}

  ngOnInit(): void {
    // Retrieve and decrypt session storage data
    if (sessionStorage.getItem("hotels") && sessionStorage.getItem("flights")) {
      try {
        const encryptedDocument = sessionStorage.getItem("document");
        const encryptedHotels = sessionStorage.getItem("hotels");
        const encryptedFlights = sessionStorage.getItem("flights");

        this.recievedDocument = this.decryptObject(encryptedDocument);
        this.recievedHotels = this.decryptObject(encryptedHotels);
        this.recievedFlights = this.decryptObject(encryptedFlights);

        console.log("Document:", this.recievedDocument);
        console.log("Hotels:", this.recievedHotels);
        console.log("Flights:", this.recievedFlights);
      } catch (error) {
        console.error("Error decrypting data:", error);
      }
    }

    // getting the data from the DB with respect to the UID store in  the session storage
    this.getData();

    // calling the fare quote call for the flight set
    this.getFareQuote();

    this.getSSR();

    // getting the passengers data if already present
    // this.getPassengerData();

    // initializing the primary contact details form
    // this.initializeForm();
  }

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

  // ===================================FLIGHTS CALLS============================================

  // 1.Fare RULE

  // 2.FARE QUOTE
  async getFareQuote() {
    const payload = {
      traceId: this.recievedFlights.traceId,
      resultIndex: this.recievedFlights.flightDetails[0].resultIndex,
    };
    try {
      const { fareRule } = await this.flight.fareQuote(payload);
      console.log("FARE QUOTE RESPONSE", fareRule);

      if (fareRule && fareRule?.Response?.Error.ErrorCode === 0) {
        if (fareRule?.Response?.IsPriceChanged) {
          // price has changed, need to notify and refresh
          const changedPublishedFare =
            fareRule?.Response?.Results?.Fare.PublishedFare;
        } else {
          // need to set the all the FLIGHT FARES from here
        }
      } else {
        // error while getting fareQuote Response

        const errorCode = fareRule?.Response?.Error.ErrorCode;
        const errorMessage = fareRule?.Response?.Error.ErrorMessage;
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // 3. SSR
  recievedSrrOptions;
  async getSSR() {
    const payload = {
      traceId: this.recievedFlights.traceId,
      resultIndex: this.recievedFlights.flightDetails[0].resultIndex,
    };

    try {
      const { ssr } = await this.flight.ssrCall(payload);

      console.log("SSR RESPONSE :", ssr);

      if (ssr.ResponseStatus == 1 && ssr.Response.Error.ErrorCode === 0) {
        this.recievedSrrOptions = {
          meals: ssr.Response.Meal,
          seats: ssr.Response.SeatPreference,
        };
      } else {
        console.log("error in fetching ssr");

        const errorCode = ssr?.Response?.Error.ErrorCode;
        const errorMessage = ssr?.Response?.Error.ErrorMessage;
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  async holdNonLCC(){

    const payload = {
      traceId: this.recievedFlights.traceId,
      resultIndex: this.recievedFlights.flightDetails[0].resultIndex,
    };

  }






  async getData() {
    console.log("fetching");

    try {
      if (this.recievedDocument) {
        this.travelData = this.recievedDocument;
        this.RoomGuests = this.travelData.trip.RoomGuests;
        this.NoOfRooms = this.RoomGuests.length;
        this.NoOfAdults = this.RoomGuests.reduce((total, room) => total + room.NoOfAdults,0);
        this.NoOfChild = this.RoomGuests.reduce((total, room) => total + room.NoOfChild,0);
        this.NoOfTravellers = this.NoOfAdults + this.NoOfChild;
        console.log("hotels to call block room", this.recievedHotels);
        // this.callHotelBlockRooom(this.recievedHotels);
      } else {
        console.log("No search info received from getSearchInfo");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async callHotelBlockRooom(hotels) {
    try {
      // // Convert the array of objects to a JSON string
      // const jsonString = JSON.stringify(hotels, null, 2); // Pretty-print with indentation

      // // Create a Blob from the JSON string
      // const blob = new Blob([jsonString], { type: "application/json" });
      // const blobUrl = URL.createObjectURL(blob);
      // console.log("Blob URL:", blobUrl);

      console.log(hotels, "in call block room");
      for (const item of hotels) {
        for (const hotel of item.hotels) {
          const payload = {
            ResultIndex: hotel?.hotel.search?.ResultIndex,
            HotelName: hotel?.hotel.search?.HotelName,
            HotelCode: hotel?.hotel.search?.HotelCode,
            NoOfRooms: hotel?.roomDetails?.length,
            // IsVoucherBooking: environment.HOTEL_Is_Voucher_Booking,
            // GuestNationality: environment.HOTEL_GUEST_NATIONALITY,
            HotelRoomsDetails: hotel?.roomDetails?.map((room) => room.room),
            TraceId: hotel?.hotel?.info.HotelInfoResult.TraceId,
          };

          console.log(payload);

          const res = await this.hotels.hotelBlockRoom(payload);
          console.log(res);
          // to update the rooms array in the DB in the according to the response
          // this.updateRoomDetails(
          //   res?.BlockRoomResult?.HotelRoomsDetails,
          //   item.checkInDate,
          //   item.cityName
          // );
        }
      }
    } catch (error) {
      console.log(error.message);
      // Handle the error appropriately, e.g., display an error message to the user
    } finally {
      // Ensure that the spinner is hidden after all iterations
      this.spinner.hide();
    }
  }

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

  handleTravelerArrayChange(travelerArray: any[]): void {
    // Process the traveler array data received from the child component
    console.log(travelerArray);
    this.travelers = travelerArray;
    console.log(this.travelers);
    this.zone.run(() => {
      this.cdr.detectChanges();
    });
  }

  async getPassengerData() {
    console.log("passengers fetching");
    try {
      const res = await this.pack.getPassengerDetails();
      console.log(res.passengers);

      if (
        this.NoOfTravellers > 0 &&
        Array.isArray(res.passengers) &&
        res.passengers.length > 0
      ) {
        this.travelers = res.passengers
          .slice(0, this.NoOfTravellers)
          .map((passengerData) => {
            const { personalInfo, ssr, dates, guardianDetails } = passengerData;
            return {
              personalInfo: {
                ...personalInfo,
                LeadPassenger: personalInfo.LeadPassenger || true,
              },
              ssr: { ...ssr },
              dates: { ...dates },
              guardianDetails: { ...guardianDetails },
            };
          });
      } else {
        this.initializeTravelersArray();
      }
      console.log("traveler", this.travelers);
    } catch (error) {
      console.log(error);
    }
  }

  initializeTravelersArray() {
    this.travelers = [];
    for (let i = 0; i < this.NoOfTravellers; i++) {
      const isLeadPassenger = i === 0;
      const paxType = isLeadPassenger ? 1 : 2;
      this.travelers.push({
        personalInfo: {
          FirstName: "",
          Title: "",
          LastName: "",
          DateOfBirth: "",
          Gender: "",
          Nationality: "",
          AddressLine1: "",
          AddressLine2: "",
          Email: "",
          ContactNo: "",
          PAN: "",
          PassportNo: "",
          PassportIssueDate: "",
          PassportExpDate: "",
          PassportExpiry: "",
          Age: "",
          PaxType: paxType,
          CountryCode: "",
          City: "",
          CountryName: "",
          LeadPassenger: isLeadPassenger,
        },
        dates: {
          dob: { day: "", month: "", year: "" },
          passportIssue: { day: "", month: "", year: "" },
          passportExpiry: { day: "", month: "", year: "" },
        },
        guardianDetails: {
          Title: "",
          FirstName: "",
          LastName: "",
          PAN: "",
          PassportNo: "",
        },
        ssr: {
          extraBaggage: "",
          meal: "",
          seat: "",
        },
      });
    }
  }
  private initializeForm(): void {
    this.contactForm = this.fb.group({
      name: ["", Validators.required],
      phone: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      address: [""],
    });
  }

  //  dialogBox functions
  dialogbox(index: number) {
    console.log(index);
    this.dialog = !this.dialog;
    this.editIndex = index;
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
    this.pay = true;
    console.log(this.contactForm.value);
    console.log(this.travelers);
    await this.pack.updatePrimaryContact(
      this.contactForm.value,
      localStorage.getItem("uid")
    );
    await this.pack.savePassengerDetails(
      this.travelers,
      localStorage.getItem("uid")
    );
  }

  addBox() {
    this.Travellers = !this.Travellers;
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
}
