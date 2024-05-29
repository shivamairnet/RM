import { ShareService } from "./../../Services/share-service/share.service";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
	AbstractControl,
	FormArray,
	FormBuilder,
	FormControl,
	FormGroup,
	NgForm,
	Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
	NgbCalendar,
	NgbDate,
	NgbDateParserFormatter,
	NgbDateStruct,
	NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { Subscription, combineLatest } from "rxjs";
import { CountriesService } from "src/app/Services/countries.service";
import { MonthData, monthsData } from "src/app/classes/MonthData";
import { CityDetail } from "src/app/classes/city";
import { Countries } from "src/app/classes/countries";
import { Trip } from "src/app/model/trip.model";
import { PostReqService } from "src/app/Services/post-req.service";
import { HttpClient } from "@angular/common/http";
import { CITY_DETAIL } from "src/app/classes/cityDetail";
import { CITY_JSON } from "src/app/classes/citiesJson";
import { City, SelectedCity } from "src/app/model/city.model";
import { Airports } from "src/app/classes/airport";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
import { DatePipe } from "@angular/common";
import { AuthService } from "src/app/Services/auth.service";
import { ToastrService } from "ngx-toastr";
import {
	CityData,
	ItineraryActivity,
	ItineraryDay,
	TripCity,
	TripData,
} from "src/app/classes/resForm";
import {
	Firestore,
	Timestamp,
	collection,
	doc,
	getDoc,
	setDoc,
} from "@angular/fire/firestore";
import * as utils from "src/utils";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PackageService } from "src/app/Services/package/package.service";
import { Papa } from "ngx-papaparse";

import { ItineraryServiceService } from "src/app/Services/itinerary-service/itinerary-service.service";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { DebounceCallsService } from "src/app/Services/DebounceCalls/debounce-calls.service";
import { environment } from "src/environments/environment";
@Component({
	selector: "app-dashboard",
	templateUrl: "./Previousdashboard.html",
	styleUrls: ["./dashboard.component.scss"],
})

export class DashboardComponent implements OnInit {
	imageUrl: string = "./vision.png"
	searchText: string = "";
	filteredData: string[] = [];
	phoneNumber!: string;
	otp!: string;
	verificationInProgress = false;
	dateForm!: FormGroup;
	startDate!: NgbDateStruct;
	numberFormControl = new FormControl(0);
	numberFormControl1 = new FormControl(0);

	ageInputValue: number;
	numberFormControl2: FormArray;

	active = 1;
	departureSearchText: string = "";
	destinationSearchText: string = "";
	searchCity: string = "";
	filteredAirports: string[] = [];
	filteredCities: string[] = [];
	monthsData: MonthData[] = monthsData;
	selectedCountry: string = "";
	cities: string[] = [];
	selectedMonth: string = "";
	selectedAirport: string = "";
	selectedDate: string = "";
	selectedDays: string = "";
	selectedNature: string = "";
	selectedTravelers: string = "";
	selectedStar: string = "";
	selectedPrice: string = "";
	selectedProperty: string = "";
	selectedCities: SelectedCity[] = [];
	selectedTravelersSubscription!: Subscription;
	adultsValue = 0;
	childrenValue = 0;
	selectedStartDate: string = "";
	selectedEndDate: string = "";
	citiesWithDetails: { cityName: string; cityDetails: CityDetail }[] = [];
	activeItem: number = 1;
	model!: NgbDateStruct;
	dateModel: NgbDateStruct = this.calendar.getToday();
	date!: { year: number; month: number };
	tripList: Trip[] = [];
	tripForm!: FormGroup;
	show: boolean = false;
	cityList: any;
	selectedRecommendedMonths: string[] = [];
	selectedVisaType: string = "";
	sortedCities: string[] = [];
	activitiesByCity: { [city: string]: any[] } = {};
	responseData: any;
	departureAirport!: string;
	arrivalAirport!: string;
	loading: boolean = true;
	start: boolean = true //shivam
	visasForm!: FormGroup;
	visaTypeData!: string;
	responseFormGroup: FormGroup;
	citiesFormGroup: FormGroup;
	responseId: string;
	updateMode: boolean = false;
	isLoaded: boolean = true;
	hoveredDate: NgbDate | null = null;
	fromDate: NgbDate | null;
	toDate: NgbDate | null;
	@ViewChild("collapseTwoElement") collapseTwoElement: ElementRef;
	isInitialMode = true;
	isEditMode = false;
	isPreviewMode = false;
	isPreviewBtn = false;
	noOfChildren: number = 0;
	public dateOptions = { year: 2023, month: 6 };
	enquiryData: any;

	showWhatsAppIcon: boolean = false;
	selectedCityIndex: number;
	showEmailIcon: boolean = false;
	travelData: import("@angular/fire/firestore").DocumentData;

	responseIdForWhatsapp: string;

	serviceType:string

	private departureSearchSubject = new Subject<string>();
	private destinationSearchSubject = new Subject<string>();

	constructor(
		private papa: Papa,
		private router: Router,
		private packageService: PackageService,
		private countryService: CountriesService,
		private elementRef: ElementRef,
		private calendar: NgbCalendar,
		private authService: AuthService,
		private postreq: PostReqService,
		private http: HttpClient,
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private ngbDateParserFormatter: NgbDateParserFormatter,
		private toast: ToastrService,
		public formatter: NgbDateParserFormatter,
		private firestore: Firestore,
		private modalService: NgbModal,
		private datePipe: DatePipe,
		private itinerary: ItineraryServiceService,
		private mail: ShareService,
		private debounce: DebounceCallsService
	) {
		this.fromDate = calendar.getToday();
		this.toDate = calendar.getNext(calendar.getToday(), "d", 10);
		this.selectedTravelersSubscription = this.countryService
			.getSelectedTravelers()
			.subscribe((travelers: string) => {
				this.selectedTravelers = travelers;
			});
		this.numberFormControl2 = new FormArray([]);
	}

	ngOnDestroy() {
		this.selectedTravelersSubscription.unsubscribe();
	}

	ngOnInit(): void {
		console.log("in init")
		this.route.queryParams.subscribe((params) => {
			console.log('QueryParams:', params);
			this.serviceType = params['service'];
	  
			console.log(this.serviceType);
			if (this.serviceType && this.serviceType === "itinerary") {
			  console.log("in if");
			  const enqDetails = JSON.parse(localStorage.getItem("enqDetails"));
			  
			  if (enqDetails) {
				const destinations = enqDetails.destinations;
				console.log(destinations);
				destinations.forEach(destination => {
				  console.log(destination);
				  this.onCitySelect(destination);
				});
			  }
			}
		  });
		this.route.params.subscribe((params) => {
			this.responseId = params.responseId;
			
			if (this.responseId) {
				this.fetchResponseDataFromFirestore(this.responseId);
			} else {
				this.generateResponseData();
			}

		});

		this.route.params.subscribe((params) => {
			this.serviceType = params.service;
			
			if (this.serviceType &&  this.serviceType==="itinerary" ) {
				
				const enqDetails=JSON.parse(localStorage.getItem("enqDetails"));

				const destinations=enqDetails.destinations
				console.log(destinations);
				destinations.forEach(destination => {
					this.onCitySelect(destination)
				});
				

			}

		});

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

		this.filterData();
		// this.filterAirports();

		combineLatest([
			this.countryService.getSelectedCountry(),
			this.countryService.getSelectedMonth(),
			this.countryService.getSelectedDate(),
			this.countryService.getSelectedAirport(),
			this.countryService.getSelectedDays(),
			this.countryService.getSelectedNature(),
			this.countryService.getSelectedStar(),
			this.countryService.getSelectedPrice(),
			this.countryService.getSelectedProperty(),
			this.countryService.getSelectedTravelers(),
			this.countryService.getSelectedCities(),
		]).subscribe(
			([
				country,
				month,
				date,
				airport,
				days,
				nature,
				star,
				price,
				property,
				travelers,
				city,
			]) => {
				this.selectedCountry = country;
				this.selectedMonth = month;
				this.selectedDate = date;
				this.selectedAirport = airport;
				this.selectedDays = days;
				this.selectedNature = nature;
				this.selectedStar = star;
				this.selectedPrice = price;
				this.selectedProperty = property;
				this.selectedTravelers = travelers;
				this.selectedCities = city;

				const { recommendedMonths, visaType } = this.getCountryDetails(
					this.selectedCountry
				);
				// Set the values in the component properties
				this.selectedRecommendedMonths = recommendedMonths;
				this.selectedVisaType = visaType;
				this.countryService.setSelectedVisaType(visaType);
				this.getCitiesByCountryOrContinent();
			}
		);

		this.countryService.getSelectedVisaType().subscribe((visaType) => {
			this.visaTypeData = visaType;
		});
	}

	handleCreatePackageBtn() {
		if (this.responseId) {
			this.router.navigate(["/itinerary", this.responseId]);

			// ON THIS NEED TO TRIGGER BACKEND TO UPDATE THE CITY IDs
			// this.convertCSVToJson(this.responseId)
		}
	}

	// share on whatsapp
	shareOnWhatsApp() {
		const recieverPhoneNumber = 1234567890;
		const message = "Check out this link: ";
		const url = `${environment.FRONTEND_BASE_URL}/itinerary-preview/${this.responseId}`; // Replace with your actual website URL
		const whatsappLink = `https://wa.me/${recieverPhoneNumber}?text=${encodeURIComponent(
			message + url
		)}`;

		window.open(whatsappLink, "_blank");
	}

	// helper for shareOnMail
	async getData(responseId: string) {
		try {
			const res = await this.itinerary.getAllData(responseId);
			console.log(res);
			this.travelData = res;
		} catch (error) {
			console.error(error);
		}
	}

	// helper for shareOnMail
	addDays(startDate: string, daysToAdd: number): string {
		// Parse the start date
		const startDateObj = new Date(startDate);

		// Add the specified number of days
		startDateObj.setDate(startDateObj.getDate() + daysToAdd);

		// Extract the parts of the date
		const year = startDateObj.getFullYear();
		const month = ("0" + (startDateObj.getMonth() + 1)).slice(-2); // Adding 1 to month since it's zero-indexed
		const day = ("0" + startDateObj.getDate()).slice(-2);
		const hours = ("0" + startDateObj.getHours()).slice(-2);
		const minutes = ("0" + startDateObj.getMinutes()).slice(-2);

		// Return the date in the desired format
		return `${year}-${month}-${day} ${hours}:${minutes}`;
	}

	// helper for shareOnMail
	formatDate(date: string | null): string {
		if (date === null || date === undefined) {
			return ''; // or return some default value like 'N/A'
		}
		const datePipe = new DatePipe('en-US');
		return datePipe.transform(date, 'EEE, d MMM') || '';
	}

	async shareOnMail() {
		await this.getData(this.responseId);

		const recipient = "airnet.development1@gmail.com";
		const subject = "Acknowledge your itinerary";

		let htmlContent = `
      <html>
      <head>
        <style>
          /* CSS styles */
          /* Hide the checkbox */
          #dropdownCheckbox {
            display: none;
          }
  
          /* Style the label to look like a button */
          .dropdown-label {
            cursor: pointer;
            color: #fff;
            background-color: #2f3268;
            padding: 5px 10px;
            border-radius: 5px;
          }
  
          /* Style the city body section */
          #cityBody {
            display: none;
          }
  
          /* Show the city body section when checkbox is checked */
          #dropdownCheckbox:checked + .dropdown-label + #cityBody {
            display: block;
          }
        </style>
      </head>
      <body>
    `;

		if (this.travelData && this.travelData.trip?.connections) {
			for (let i = 0; i < this.travelData.trip?.connections.length; i++) {
				// Generate HTML content for each connection
				htmlContent += this.generateConnectionHTML(this.travelData.trip.connections[i], this.travelData.cities[i], this.travelData.trip.citiesArrivalDates[i], i);
			}
		}

		htmlContent += `
        </body>
      </html>
    `;

		// Call your email service or API to send the email with the HTML content
		this.mail.sendEmail(recipient, subject, htmlContent).subscribe(
			() => {
				console.log("Email sent successfully");
			},
			(error) => {
				console.error("Error sending email:", error);
			}
		);
	}

	generateConnectionHTML(connection, city, arrivalDate, i) {
		// Generate HTML content for each connection
		const modeOfTransport = connection.mode_of_transport;
		const flightImg = "https://firebasestorage.googleapis.com/v0/b/boardthetrip-bc9f0.appspot.com/o/plane.png?alt=media&token=4f6f1412-ca8e-4680-8a8a-ec17d6589c46";
		const trainImg = "https://firebasestorage.googleapis.com/v0/b/boardthetrip-bc9f0.appspot.com/o/train.png?alt=media&token=7a9851ca-ea8c-4a42-9d82-e7d86047f1f4";
		const carImg = "https://firebasestorage.googleapis.com/v0/b/boardthetrip-bc9f0.appspot.com/o/car.png?alt=media&token=3a4494f0-0bfd-4627-93f0-3762443a65a9";

		let connectionHTML = `
    <div>
      <p style="text-align: center;">
        <span><i class="fa-solid fa-location-dot fa-xl me-3" style="color: #323268"></i></span>
        ${connection?.mode_of_transport} from ${connection?.from_city}
        ${modeOfTransport === "Flight"
				? `<img src="${flightImg}" alt="Flight Image" style="height:20px; width:20px"> `
				: ""
			}
        ${modeOfTransport === "Train"
				? `<img src="${trainImg}" alt="Train Image" style="height:20px; width:20px">`
				: ""
			}
        ${modeOfTransport === "Car"
				? `<img src="${carImg}" alt="Car Image" style="height:20px; width:20px">`
				: ""
			}
        to ${connection?.to_city}
      </p>
      <main>
        ${i < this.travelData.cities.length
				? `
            <div style="background-color: #fff; border: 1px solid grey; border-radius: 20px; width: 700px;">
              <!-- city heading strip -->
              <div style="border-radius: 20px 20px 0 0; border-bottom: 2px solid #000; height: 34px; width: 100%; background-color: #2f3268; display: flex; justify-content: center; align-items: center; color: #fff;">
                <h2 style="margin: 0; margin-left: 10px; font-size: 19px; color: #fff; text-align: center;">
                  ${city?.days?.length} Days in ${city?.cityDetails?.cityName}
                </h2>
              </div>
              <!-- city body -->
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; border-radius: 0 0 20px 20px;">
                <!-- particular property itinerary -->
                <div style="width: 100%; background-color: white; border-radius: 20px">
                  <!-- heading for the property -->
                  <div style="border-radius: 8px; height: 34px; width: 100%; display: flex; align-items: center; position: relative;">
                    <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ff4040; display: flex; justify-content: flex-start; align-items: center; width: 75%; padding-right: 20px; padding-left: 20px;">
                      <span>Pickup from ${city?.cityDetails?.cityName} Airport</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16l-1.74 5.79a1 1 0 0 1-1.1.66H6.83a1 1 0 0 1-1.1-.66L4 6z"/><path d="M9 22V12h6v10M2 10.69l.58-1.77A2 2 0 0 1 4.52 8H19.48a2 2 0 0 1 1.94 1.92l.58 1.77"/></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21l-8-4.5v-9l8 4.5 8-4.5v9L12 21z"/><path d="M5 12l7 4.5m7-4.5l-7-4.5"/></svg>
                    </h1>
                  </div>
                  <!-- itinerary when staying in a particular property -->
                  <div>
                    <!-- row 1 -->
                    ${city.days
					.map(
						(days) => `
                      <div style="height: 65px; width: 100%; display: flex; border-top: 1px solid grey;">
                        <!-- date -->
                        <div style="display: flex; align-items: center; width: 20%; height: 100%; justify-content: center; border-right: 1px solid grey;">
                          <h2 style="margin: 0; font-size: 1rem; color: #ff4040">${this.formatDate(this.addDays(arrivalDate, days?.dayNumber))}</h2>
                        </div>
                        <!-- morning -->
                        ${days.activities
								.map(
									(activity) => `
                          <div style="width: 20%;  height: 100%; align-items: center; justify-content: space-evenly; border-right: 2px solid #000; border-right: 1px solid grey;">
                            <h2 style="margin: 0; font-size: 15px; color: #ff4040">${activity.activity_timeperiod}</h2>
                            <p style="margin: 0; font-weight: 600; font-size: 0.8rem; text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 110px; height: 30px;" data-toggle="tooltip" data-placement="top" title=${activity.activity_name}>${activity.activity_name}</p>
                          </div>
                        `
								)
								.join("")}
                      </div>
                    `
					)
					.join("")}
                  </div>
                </div>
              </div>
            </div>
            `
				: ""
			}
      </main>
    </div>
  `;

		return connectionHTML;
	}






	// share on mail
	async shareOnMail2() {
		await this.getData(this.responseId);

		const recipient = "airnet.development1@gmail.com";
		const subject = "Test Email";

		let htmlContent = "";
		const flightImg =
			"https://firebasestorage.googleapis.com/v0/b/boardthetrip-bc9f0.appspot.com/o/plane.png?alt=media&token=4f6f1412-ca8e-4680-8a8a-ec17d6589c46";
		const trainImg =
			"https://firebasestorage.googleapis.com/v0/b/boardthetrip-bc9f0.appspot.com/o/train.png?alt=media&token=7a9851ca-ea8c-4a42-9d82-e7d86047f1f4";
		const carImg =
			"https://firebasestorage.googleapis.com/v0/b/boardthetrip-bc9f0.appspot.com/o/car.png?alt=media&token=3a4494f0-0bfd-4627-93f0-3762443a65a9";
		// Iterate over each city and customize the HTML content
		if (this.travelData && this.travelData.trip?.connections) {
			for (let i = 0; i < this.travelData.trip?.connections.length; i++) {
				const city = this.travelData.cities[i];
				const arrivalDate = this.travelData.trip.citiesArrivalDates[i];
				const modeOfTransport =
					this.travelData.trip.connections[i]?.mode_of_transport;
				const cities = this.travelData.trip.connections[i];
				htmlContent += `
      <html>
      <head>
    <style>
      /* Hide the checkbox */
      #dropdownCheckbox {
        display: none;
      }
  
      /* Style the label to look like a button */
      .dropdown-label {
        cursor: pointer;
        color: #fff;
        background-color: #2f3268;
        padding: 5px 10px;
        border-radius: 5px;
      }
  
      /* Style the city body section */
      #cityBody {
        display: none;
      }
  
      /* Show the city body section when checkbox is checked */
      #dropdownCheckbox:checked + .dropdown-label + #cityBody {
        display: block;
      }
    </style>
  </head>
      <body>
      <p style="text-align: center;">
     
                    <span><i class="fa-solid fa-location-dot fa-xl me-3" style="color: #323268"></i></span>
                    ${cities?.mode_of_transport} from ${cities?.from_city}
                    ${modeOfTransport === "Flight"
						? `<img src="${flightImg}" alt="Flight Image" style="height:20px; width:20px"> `
						: ""
					}
                    ${modeOfTransport === "Train"
						? `<img src="${trainImg}" alt="Train Image" style="height:20px; width:20px">`
						: ""
					}
                    ${modeOfTransport === "Car"
						? `<img src="${carImg}" alt="Car Image" style="height:20px; width:20px">`
						: ""
					}
                    to ${cities?.to_city}
                  </p>
        <main>

          ${i < this.travelData.cities.length
						? `
        
            <div style="background-color: #fff; border: 1px solid grey; border-radius: 20px; width: 700px;">
          <!-- city heading strip -->
          <div style="border-radius: 20px 20px 0 0; border-bottom: 2px solid #000; height: 34px; width: 100%; background-color: #2f3268; display: flex; justify-content: center; align-items: center; color: #fff;">
   
          <h2
          style="
            margin: 0;
            margin-left: 10px;
            font-size: 19px;
            color: #fff;
            text-align: center;
          "
        >
          
  
          ${city?.days?.length} Days in  
          ${city?.cityDetails?.cityName}
        </h2>
        </div>
            <!-- city body -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; border-radius: 0 0 20px 20px;">
              <!-- particular property itinerary -->
              <div style="width: 100%; background-color: white; border-radius: 20px">
                <!-- heading for the property -->
                <div style="border-radius: 8px; height: 34px; width: 100%; display: flex; align-items: center; position: relative;">
                  <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ff4040; display: flex; justify-content: flex-start; align-items: center; width: 75%; padding-right: 20px; padding-left: 20px;">
                    <span>Pickup from ${city?.cityDetails?.cityName
						} Airport</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16l-1.74 5.79a1 1 0 0 1-1.1.66H6.83a1 1 0 0 1-1.1-.66L4 6z"/><path d="M9 22V12h6v10M2 10.69l.58-1.77A2 2 0 0 1 4.52 8H19.48a2 2 0 0 1 1.94 1.92l.58 1.77"/></svg>
  
    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21l-8-4.5v-9l8 4.5 8-4.5v9L12 21z"/><path d="M5 12l7 4.5m7-4.5l-7-4.5"/></svg>
                  </h1>
                </div>
                <!-- itinerary when staying in a particular property -->
                <div>
                  <!-- row 1 -->
                  ${city.days
							.map(
								(days) => `
                    <div style="height: 65px; width: 100%; display: flex; border-top: 1px solid grey;">
                      <!-- date -->
                      <div style="display: flex; align-items: center; width: 20%; height: 100%; justify-content: center; border-right: 1px solid grey;">
                        <h2 style="margin: 0; font-size: 1rem; color: #ff4040">${this.formatDate(
									this.addDays(arrivalDate, days?.dayNumber)
								)}</h2>
                      </div>
                      <!-- morning -->
                      ${days.activities
										.map(
											(activity) => `
                        <div style="width: 20%;  height: 100%; align-items: center; justify-content: space-evenly; border-right: 2px solid #000; border-right: 1px solid grey;">
                          <h2 style="margin: 0; font-size: 15px; color: #ff4040">${activity.activity_timeperiod}</h2>
                          <p style="margin: 0; font-weight: 600; font-size: 0.8rem; text-align: center; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 110px; height: 30px;" data-toggle="tooltip" data-placement="top" title=${activity.activity_name}>${activity.activity_name}</p>
                        </div>
                      `
										)
										.join("")}
                    </div>
                  `
							)
							.join("")}
                </div>
              </div>
            </div>
          </div>
          `
						: ""
					}
        </main>
        </body>
        </html>
      `;
			}
		}

		// Call your email service or API to send the email with the HTML content
		this.mail.sendEmail(recipient, subject, htmlContent).subscribe(
			() => {
				console.log("Email sent successfully");
			},
			(error) => {
				console.error("Error sending email:", error);
			}
		);
	}

	// updated the function by fetching the package from backend
	async fetchResponseDataFromFirestore(responseId: string) {
		try {
			const packageDetails = await this.packageService.getWholePackgeDetails(
				responseId
			);

			if (packageDetails) {
				this.responseData = packageDetails;
				this.loading = false;
				this.isPreviewMode = true;
				this.initialiseFormGroup(this.responseData);
			}
		} catch (error) {
			console.error("Error fetching full package  data from Firestore:", error);
		}
	}

	initialiseFormGroup(responseModel: TripCity | null = null) {
		
		if (responseModel === null) {
			this.updateMode = false;
			this.responseFormGroup = this.fb.group({
				responseId: [
					doc(collection(this.firestore, utils.RESPONSE_COLLECTION)).id,
				],
				itineraryName: ["", Validators.required],
				companyName: ["", Validators.required],
				createdOn: [Timestamp.now()],
				cities: this.fb.array(
					Object.values(this.activitiesByCity).map(({ cityName, days }: any) =>
						this.buildCitiesFormControl(cityName, days)
					)
				),
				trip: this.addTripModelFormGroup(),
			});
		} else {
			this.updateMode = true;
			const adultCount = this.numberFormControl.value;
			const infantCount = this.numberFormControl1.value;
			const childCount = this.numberFormControl2.value;
			this.responseFormGroup = this.fb.group({
				responseId: [responseModel?.responseId ?? ""],
				itineraryName: [
					responseModel?.itineraryName ?? "",
					Validators.required,
				],
				companyName: [responseModel?.companyName ?? "", Validators.required],
				createdOn: [responseModel?.createdOn],
				cities: this.fb.array(
					Array.from(responseModel?.cities ?? []).map(
						({ cityName, days }: any) =>
							this.buildCitiesFormControl(cityName, days)
					)
				),
				trip: this.addTripModelFormGroup(
					responseModel.trip,
					adultCount,
					infantCount,
					childCount
				),
			});
		}
	}

	private buildCitiesFormControl(cityName: string, cityActivities: any[]): FormGroup {
		const cityControls: FormGroup[] = [];
		const propertyControls: FormGroup[] = [];
		const allDates: string[] = [];

		// Check if cityActivities is not empty
		if (cityActivities.length > 0) {
			for (const activity of cityActivities) {
				const formattedDate = activity.dayNumber;
				allDates.push(formattedDate);

				const activityFormGroup = this.fb.group({
					dayNumber: [activity.dayNumber],
					activities: this.buildActivitiesFormControl(activity.activities),
				});
				cityControls.push(activityFormGroup);
			}

			// Create cityDetailsFormGroup only if cityActivities is not empty
			const cityDetailsFormGroup = this.fb.group({
				cityName: [cityName],
				weather: [cityActivities[0]?.weather || ''],
				temperature: [cityActivities[0]?.temperature || ''],
				countryCode: [cityActivities[0]?.countryCode || ''],
			});

			const propertyControls: FormGroup[] = [
				this.fb.group({
					propertyNumber: [1]
				})
			];
			const propertiesFormArray = this.fb.array(propertyControls);

			return this.fb.group({
				cityName: [cityName],
				cityDetails: cityDetailsFormGroup,
				noOfNights: [cityControls.length],
				noOfDays: [cityControls.length],
				noOfProperties: [propertyControls.length],
				days: this.fb.array(cityControls),
				Properties: propertiesFormArray,
			});
		} else {
			// If cityActivities is empty, create a default cityDetailsFormGroup
			const cityDetailsFormGroup = this.fb.group({
				cityName: [cityName],
				weather: [''],
				temperature: [''],
				countryCode: [''],
			});

			return this.fb.group({
				cityName: [cityName],
				cityDetails: cityDetailsFormGroup,
				noOfNights: [0],
				noOfDays: [0],
				noOfProperties: [0],
				days: this.fb.array([]),
				Properties: this.fb.array([]),
			});
		}
	}

	private buildActivitiesFormControl(activities: any[]): FormArray {
		const activityControls: FormGroup[] = [];
		for (const activity of activities) {
			const timeSlot = this.mapTimeSlot(activity.activity_timeperiod);
			const activityFormGroup = this.fb.group({
				activity_timeperiod: [activity.activity_timeperiod],
				activity_timestamp: [timeSlot],
				activity_name: [activity.activity_name],
				image: [activity.image],
				location: [activity.location],
			});

			activityControls.push(activityFormGroup);
		}

		return this.fb.array(activityControls);
	}

	private mapTimeSlot(activityTimePeriod: string): string {
		switch (activityTimePeriod.toLowerCase()) {
			case "morning":
				return "05:00am - 11:00am";
			case "afternoon":
				return "12:00pm - 15:59pm";
			case "evening":
				return "16:00pm - 20:59pm";
			case "night":
				return "21:00pm - 05:00am";
			default:
				return "";
		}
	}

	addNewPropertyControl(formGroup: FormGroup, cityIndex: number) {
		const citiesArray = formGroup.get('cities') as FormArray;
		const cityControl = citiesArray.at(cityIndex) as FormGroup;
		const propertiesArray = cityControl.get('Properties') as FormArray;

		let highestPropertyNumber = 0;
		propertiesArray.controls.forEach(control => {
			const propertyNumber = control.get('propertyNumber')?.value;
			if (propertyNumber && propertyNumber > highestPropertyNumber) {
				highestPropertyNumber = propertyNumber;
			}
		});

		const newPropertyFormGroup = this.fb.group({
			propertyNumber: [highestPropertyNumber + 1]
		});
		propertiesArray.push(newPropertyFormGroup);
		cityControl.get('noOfProperties').setValue(propertiesArray.length);

	}

	addNewProperty(cityIndex: number) {
		this.addNewPropertyControl(this.responseFormGroup, cityIndex);
		this.toast.success('New Property Added');
	}

	openModal(index: number) {
		this.selectedCityIndex = index;
	}
	private buildConnectionsFormControl(connections: any[]): FormArray {
		const connectionsControls: FormGroup[] = [];
		for (const activity of connections) {
			const activityFormGroup = this.fb.group({
				from_city: [activity.from_city],
				mode_of_transport: [activity.mode_of_transport],
				to_city: [activity.to_city],
				total_duration: [activity.total_duration],
			});
			connectionsControls.push(activityFormGroup);
		}
		return this.fb.array(connectionsControls);
	}

	incAdultCount() {
		const currentValue = this.numberFormControl.value;
		if (currentValue !== null) {
			const newValue = currentValue + 1;
			this.numberFormControl.setValue(newValue);
			// const formGroup = this.addTripModelFormGroup();
			// formGroup.controls['travellers'].setValue(newValue);
		}
	}

	decAdultCount() {
		const currentValue = this.numberFormControl.value;
		if (currentValue !== null) {
			const newValue = currentValue - 1;
			this.numberFormControl.setValue(newValue);
		}
	}

	// incChildCount() {
	//   const currentValue2 = this.numberFormControl2.value;
	//   if (currentValue2 !== null) {
	//     const formGroup = this.addTripModelFormGroup();
	//     const childCountArray = formGroup.get('travellers.childCount') as FormArray;
	//     childCountArray.push(this.fb.group({
	//       index: childCountArray.length, // Assign an index for reference
	//       age: currentValue2 // Set the age value
	//     }));
	//     // this.numberFormControl2.setValue(null); // Reset the input field after adding the child
	//     console.log(currentValue2)
	//     console.log(childCountArray)
	//   }
	// }

	incChildCount() {
		const currentValue2 = this.ageInputValue;
		if (currentValue2 !== null) {
			this.noOfChildren = this.numberFormControl2.length + 1;
			const index = this.numberFormControl2.length + 1;
			const childFormGroup = this.createChildFormGroup(index, currentValue2); // Create a new child form group
			this.numberFormControl2.push(childFormGroup); // Add the child form group to the FormArray
			console.log(currentValue2);
			console.log(this.numberFormControl2.value);
			this.ageInputValue = null;
		}
	}

	createChildFormGroup(index: number, age: number): FormGroup {
		return this.fb.group({
			index: this.fb.control(index), // Set the index value
			age: this.fb.control(age), // Set the age value
		});
	}

	incInfantCount() {
		const currentValue1 = this.numberFormControl1.value;
		if (currentValue1 !== null) {
			this.numberFormControl1.setValue(currentValue1 + 1);
		}
	}

	decInfantCount() {
		const currentValue1 = this.numberFormControl1.value;
		if (currentValue1 !== null) {
			this.numberFormControl1.setValue(currentValue1 - 1);
		}
	}

	// not in use
	getTimeInhoursFromConnections(minutes) {
		if (isNaN(minutes) || minutes < 0) {
			return "Invalid input";
		}

		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;

		if (hours === 0) {
			return `${remainingMinutes} minutes`;
		} else if (remainingMinutes === 0) {
			return `${hours} hours`;
		} else {
			return `${hours} hours ${remainingMinutes} minutes`;
		}
	}

	// not in use
	addDaysToDate = (dateString, daysToAdd) => {
		let date;
		if (dateString.includes("-")) {
			date = new Date(dateString); // Parse date in 'YYYY-MM-DD HH:mm' format
		} else {
			const [day, month, year] = dateString.split("/"); // Split date string by '/'
			date = new Date(`${year}-${month}-${day}`); // Parse date in 'dd/mm/yyyy' format
		}

		date.setDate(date.getDate() + daysToAdd);

		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();

		if (parseInt(month) !== parseInt((date.getMonth() + 1).toString())) {
			date.setDate(0); // Set to the last day of the previous month
			const newDay = date.getDate().toString().padStart(2, "0");
			return `${newDay} ${this.getMonthName(date.getMonth())}`; // Return the date in dd Month format
		} else if (parseInt(year) !== parseInt(date.getFullYear().toString())) {
			return `01 ${this.getMonthName(date.getMonth())}`; // Year changed
		}

		return `${day} ${this.getMonthName(date.getMonth())}`; // Return the date in dd Month format
	};

	// not in use         Function to get month name from month index
	getMonthName = (monthIndex) => {
		const monthNames = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		return monthNames[monthIndex];
	};

	// not in use
	getDates(dateGroup, cityKey) {
		let dayNumber = dateGroup.dayNumber;
		let cityName = cityKey;

		let cityIndex = this.sortedCities.indexOf(cityKey);

		return this.addDaysToDate(
			this.citiesArrivalDates[cityIndex],
			dayNumber - 1
		);
	}

	addTripModelFormGroup(trip: any = null, adultCount: number = null, infantCount: number = null, childCount: FormControl[] = []): FormGroup {
		return this.fb.group({
			departure_airport: [trip?.departure_airport ?? null],
			start_date: [trip?.start_date ?? null],
			end_date: [trip?.end_date ?? null],
			numbers_of_days: [trip?.numbers_of_days ?? null],
			travellers: this.fb.group({
				adultCount: [adultCount ?? trip?.travellers ?? null],
				infantCount: [infantCount ?? trip?.travellers ?? null],
				childCount: this.fb.array(childCount)
			}),
			RoomGuests: this.fb.array([]),
			nature_of_trip: [trip?.nature_of_trip ?? null],
			connections: this.fb.array(trip?.connections.map(connection => this.buildConnectionFormGroup(connection)) ?? []),
			cities: this.fb.array(trip?.cities ?? []),
			citiesArrivalDates: this.fb.array(trip?.citiesArrivalDates ?? []),
			suggestedDurationInCities: this.fb.array(trip?.suggestedDurationInCities ?? [])
		});
	}

	buildConnectionFormGroup(connection: any = null): FormGroup {
		return this.fb.group({
			currentCityAirportCode: [connection?.currentCityAirportCode ?? null],
			currentCityName: [connection?.currentCityName ?? null],
			efficientTransportMode: [connection?.efficientTransportMode ?? null],
			nextCityAirportCode: [connection?.nextCityAirportCode ?? null],
			nextCityName: [connection?.nextCityName ?? null],
			possibleTransportModes: [connection?.possibleTransportModes ?? null],
			totalDurationOfTravelInMinutes: [connection?.totalDurationOfTravelInMinutes ?? null]
		});
	}

	alignCitiesFlowWithConnections(cityFlowArr, connectionsArr): any[] {
		const updatedConnections = [];
		let flowIndex = 0;
		let foundIndex = 0;

		while (flowIndex < cityFlowArr.length) {
			const currentCity = cityFlowArr[flowIndex];
			const connection = connectionsArr[foundIndex];

			if (connection.nextCityName === currentCity) {
				console.log(connection)
				updatedConnections.push(connection);
				flowIndex++;
			}

			foundIndex++;
			if (foundIndex === connectionsArr.length) {
				foundIndex = 0; // Restart from the beginning
			}
		}

		const lastConnectionToOrigin = connectionsArr.find((connection) => connection.nextCityName === updatedConnections[0].currentCityName);

		updatedConnections.push(lastConnectionToOrigin);

		console.log(updatedConnections);
		return updatedConnections;
	}



	connections: any[] = [];
	citiesArrivalDates: string[] = [];

	generateResponseData() {

		// here i am getting the itinerary data from service
		this.countryService.getResponseData().subscribe((responseData) => {

			console.log('In generate response data');
			console.log(responseData);

			if (Object.keys(responseData).length !== 0 && responseData !== "") {
				this.responseData = responseData;
				// // Access the cities array within the trip object
				// const citiesArray = responseData.trip.cities;
				// console.log("citiesArray", citiesArray);


				this.sortedCities = responseData.trip.cities;

				this.connections = this.alignCitiesFlowWithConnections(this.sortedCities, responseData.trip.connections);

				this.activitiesByCity = this.groupActivitiesByCity(responseData);

				this.citiesArrivalDates = responseData.trip.citiesArrivalDates;


				console.log(
					this.connections,
					"THIS IS CONNECTIONS ARRay%%%%%%%%%%%%%%%%%%%%%%%%"
				);
				console.log("activitiesByCity", this.activitiesByCity);

				// .sort((a, b) => {   
				//   const dateA = new Date(this.activitiesByCity[a][0].date);
				//   const dateB = new Date(this.activitiesByCity[b][0].date);
				//   return dateA.getTime() - dateB.getTime();
				// });
				console.log("sortedCities", this.sortedCities);
				this.loading = false;


				this.initialiseFormGroup({
					cities: Object.entries(this.activitiesByCity).reduce(
						(prev, [cityName, days]) => [...prev, { cityName, days }],
						[]
					),
					trip: responseData.trip,
					companyName: "",
					responseId: "",
					itineraryName: "",
					createdOn: "",
				} as any);
			}

		});
	}

	groupActivitiesByCity(responseData: any): { [key: string]: any[] } {
		const activitiesByCity: { [key: string]: any[] } = {};
		if (
			responseData &&
			responseData.itinerary &&
			Array.isArray(responseData.itinerary)
		) {
			for (const itinerary of responseData.itinerary) {
				if (
					itinerary &&
					itinerary.city_name &&
					Array.isArray(itinerary.itinerary)
				) {
					const cityName = itinerary.city_name;
					const temperature = itinerary.temperature;
					const weather = itinerary.weather;
					console.log(weather);
					console.log(temperature);
					const countryCode = itinerary.countryCode;

					if (cityName in activitiesByCity) {
						for (const day of itinerary.itinerary) {
							activitiesByCity[cityName].push({
								activities: day.activities,
								dayNumber: day.dayNumber,
								temperature: temperature,
								weather: weather,
								countryCode: countryCode,
							});
						}
					} else {
						activitiesByCity[cityName] = [];
						for (const day of itinerary.itinerary) {
							activitiesByCity[cityName].push({
								activities: day.activities,
								dayNumber: day.dayNumber,
								temperature: temperature,
								weather: weather,
								countryCode: countryCode,
							});
						}
					}
				}
			}
		}
		console.log(activitiesByCity);
		return activitiesByCity;
	}

	// groupActivitiesByCity(responseData: any): { [key: string]: any[] } {
	//   const activitiesByCity: { [key: string]: any[] } = {};
	//   if (responseData && responseData.itinerary && Array.isArray(responseData.itinerary)) {
	//     for (const item of responseData.itinerary) {
	//       if (item && item.city_name && Array.isArray(item.activities)) {
	//         const cityName = item.city_name;
	//         const cityCode = item.cityCode;
	//         const cityId = item.cityId;
	//         const countryCode = item.countryCode;

	//         if (cityName in activitiesByCity) {
	//           activitiesByCity[cityName].push({
	//             date: new Date(item.date), // Convert the date string to a Date object
	//             activities: item.activities,
	//             connections: item.connections,
	//             from_city: item.from_city,
	//             activity_timeperiod: item.activity_timeperiod,
	//             suggested_duration: item.suggested_duration,
	//             suggested_hotelname: item.suggested_hotelname,
	//             cityCode: item.cityCode,
	//             cityId: item.cityId,
	//             countryCode: item.countryCode,
	//           });
	//         } else {
	//           activitiesByCity[cityName] = [{
	//             date: new Date(item.date),
	//             activities: item.activities,
	//             connections: item.connections,
	//             from_city: item.from_city,
	//             activity_timeperiod: item.activity_timeperiod,
	//             suggested_duration: item.suggested_duration,
	//             suggested_hotelname: item.suggested_hotelname,
	//             cityCode: item.cityCode,
	//             cityId: item.cityId,
	//             countryCode: item.countryCode,
	//           }];
	//         }
	//       }
	//     }

	//     // Sort activities by date for each city
	//     for (const city in activitiesByCity) {
	//       activitiesByCity[city].sort((a, b) => a.date.getTime() - b.date.getTime());
	//     }
	//   }

	//   // Calculate the maximum suggested_duration for each city
	//   for (const city in activitiesByCity) {
	//     const suggestedDurations = activitiesByCity[city].map(activity => activity.suggested_duration);
	//     const maxSuggestedDuration = Math.max(...suggestedDurations);
	//     activitiesByCity[city][0].suggested_duration = maxSuggestedDuration;
	//   }
	//   console.log(this.activitiesByCity);
	//   return activitiesByCity;
	// }
	addRoomGuest() {
		const newRoomGuest = {
			travellers: {
				adultCount: this.numberFormControl.value ?? null,
				infantCount: this.numberFormControl1.value ?? null,
				childCount: this.numberFormControl2.value
			}
		};

		// Get the existing roomGuests array from sessionStorage or initialize it if it doesn't exist
		let roomGuests = JSON.parse(sessionStorage.getItem('roomGuests') || '[]');

		// Push the new roomGuest into the roomGuests array
		roomGuests.push(newRoomGuest);

		// Store the updated roomGuests array back in sessionStorage
		sessionStorage.setItem('roomGuests', JSON.stringify(roomGuests));
		console.log('New roomGuest array:', roomGuests);

		this.numberFormControl.setValue(0);
		this.numberFormControl1.setValue(0);
	}

	saveResponseDataToFirestore() {
		let formValues = { ...this.responseFormGroup.value };
		let docRef;

		const roomGuests = JSON.parse(sessionStorage.getItem('roomGuests') || '[]');

		if (this.responseId == null) {
			docRef = doc(collection(this.firestore, utils.RESPONSE_COLLECTION));
			formValues.responseId = docRef.id;
		} else {
			docRef = doc(collection(this.firestore, utils.RESPONSE_COLLECTION), this.responseId);
		}

		formValues.trip.RoomGuests = roomGuests;
		console.log("roomguests", formValues.trip.RoomGuests)

		setDoc(docRef, formValues)
			.then(() => {
				this.modalService.dismissAll();
				this.toast.success("Itinerary Added Successfully");
				console.log("Response Saved in Database:", formValues);
				console.log("ResponseId:", formValues.responseId);
			})
			.catch(error => {
				console.error("Error saving response data to Firestore: ", error);
			});
	}

	closeModal() {
		// Close the modal using JavaScript or jQuery, depending on your setup
		// For example, using JavaScript:
		const modal = document.getElementById("exampleModal");
		if (modal) {
			modal.classList.remove("show");
			modal.setAttribute("aria-hidden", "true");
			modal.style.display = "none";
			document.body.classList.remove("modal-open");
			const modalBackdrop =
				document.getElementsByClassName("modal-backdrop")[0];
			if (modalBackdrop) {
				modalBackdrop.parentNode?.removeChild(modalBackdrop);
			}
		}
	}

	submitAndCloseModal(form: NgForm) {
		if (form.valid) {
			this.saveResponseDataToFirestore();

			this.closeModal();
		}
	}

	toggleIcons() {
		this.showWhatsAppIcon = !this.showWhatsAppIcon;
		this.showEmailIcon = !this.showEmailIcon;
	}

	// CUSTOMIZING THE ITINERARY LAYOUT
	addTable() {
		// Get the 'cities' FormArray from the responseFormGroup
		const citiesFormArray = this.responseFormGroup.get("cities") as FormArray;

		if (citiesFormArray) {
			// Create a new city entry in your activitiesByCity data source
			const newCityName = " ";
			this.activitiesByCity[newCityName] = []; // Initialize it with an empty array of city activities

			// Create a new city FormControl and push it to the 'cities' FormArray
			const newCityControl = this.buildCitiesFormControl(newCityName, []);
			citiesFormArray.push(newCityControl);
			this.toast.success("New Table Added");
		}
	}

	addRow(cityIndex: number) {
		// Get the 'cities' FormArray from the responseFormGroup
		const citiesFormArray = this.responseFormGroup.get("cities") as FormArray;

		if (
			citiesFormArray &&
			cityIndex >= 0 &&
			cityIndex < citiesFormArray.length
		) {
			// Get the selected city's FormGroup
			const cityFormGroup = citiesFormArray.at(cityIndex) as FormGroup;

			// Get the 'days' FormArray within the selected city
			const daysFormArray = cityFormGroup.get("days") as FormArray;

			if (daysFormArray) {
				// Create a new FormGroup with blank values for the specified fields
				const newDayFormGroup = this.fb.group({
					date: [""], // Add more fields as needed with their initial values
					suggested_duration: [""],
					suggested_hotelname: [""],
					connections: [""],
					activities: this.fb.array([]), // Initialize activities with an empty array
				});

				// Push the new day FormGroup to the 'days' FormArray
				daysFormArray.push(newDayFormGroup);
			}
		}
		this.toast.success(`New Row Added`);
	}

	addCol(dayGroup: FormGroup) {
		// Get the 'activities' FormArray from the selected dayGroup
		const activitiesFormArray = dayGroup.get("activities") as FormArray;

		if (activitiesFormArray) {
			// Create a new FormGroup for the activity fields with blank values
			const newActivityFormGroup = this.fb.group({
				activity_timeperiod: [""],
				activity_name: [""],
				image: [""],
				location: [""],
			});

			// Push the new FormGroup to the 'activities' FormArray
			activitiesFormArray.push(newActivityFormGroup);
		}
		this.toast.success(`New Col Added`);
	}

	deleteActivity(dayGroup: FormGroup, index: number) {
		const activitiesFormArray = dayGroup.get("activities") as FormArray;
		if (
			activitiesFormArray &&
			index >= 0 &&
			index < activitiesFormArray.length
		) {
			activitiesFormArray.removeAt(index);
		}
		this.toast.success(`Activity Deleted Successfully`);
	}

	deleteRow(cityIndex: number, rowIndex: number) {
		// Get the 'cities' FormArray from the responseFormGroup
		const citiesFormArray = this.responseFormGroup.get("cities") as FormArray;

		if (
			citiesFormArray &&
			cityIndex >= 0 &&
			cityIndex < citiesFormArray.length
		) {
			// Get the selected city's FormGroup
			const cityFormGroup = citiesFormArray.at(cityIndex) as FormGroup;

			// Get the 'days' FormArray within the selected city
			const daysFormArray = cityFormGroup.get("days") as FormArray;

			if (daysFormArray && rowIndex >= 0 && rowIndex < daysFormArray.length) {
				// Remove the specified row from the 'days' FormArray
				daysFormArray.removeAt(rowIndex);
			}
		}

		this.toast.success(`Row Deleted`);
	}

	deleteCity(cityIndex: number) {
		// Get the 'cities' FormArray from the responseFormGroup
		const citiesFormArray = this.responseFormGroup.get("cities") as FormArray;

		if (
			citiesFormArray &&
			cityIndex >= 0 &&
			cityIndex < citiesFormArray.length
		) {
			// Remove the city FormGroup at the specified index
			citiesFormArray.removeAt(cityIndex);

			// Remove the corresponding entry from your activitiesByCity data source
			const cityNameToDelete = this.sortedCities[cityIndex];
			delete this.activitiesByCity[cityNameToDelete];
		}

		this.toast.success(`City Deleted`);
	}
	update() {
		this.toast.success(`Table Updated`);
		this.isPreviewBtn = true;
	}
	// not in use
	openSaveModal(modalRef: any) {
		this.modalService.open(modalRef, { size: "sm" });
	}

	toggleEditMode() {
		this.isEditMode = true;
		this.isInitialMode = false;
		this.isPreviewMode = false;
		this.isPreviewBtn = false;
	}

	togglePreviewMode() {
		this.isPreviewMode = true;
		this.isEditMode = false;
		this.isInitialMode = false;
	}

	// FORM  SUBMISSIONS
	onCountrySelect(data: string): void {
		this.countryService.setSelectedCountry(data);
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

	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed))
			? NgbDate.from(parsed)
			: currentValue;
	}

	// not in use
	get nameFromSessionStorage() {
		// Retrieve the name from session storage
		return sessionStorage.getItem("selectedCountry");
	}

	generatePdf(action = "open") {
		// this need to be fetched from backend
		// const documentDefinition = this.getDocumentDefinition();

		const documentDefinition = {
			content: "Need to implement this whole fucntion in backend",
		};
		// ====

		switch (action) {
			case "open":
				pdfMake.createPdf(documentDefinition).open();
				break;
			case "print":
				pdfMake.createPdf(documentDefinition).print();
				break;
			case "download":
				pdfMake.createPdf(documentDefinition).download("Itinerary");
				break;
			default:
				pdfMake.createPdf(documentDefinition).open();
				break;
		}
	}

	filterData(): void {
		this.filteredData = Countries.filter((data) =>
			data.toLowerCase().includes(this.searchText.toLowerCase())
		);
	}

	onSearchChange(): void {
		this.filterData();
	}

	// not in use
	incrementProp() {
		const currentValue = this.numberFormControl1.value;
		if (currentValue !== null) {
			this.numberFormControl1.setValue(currentValue + 1);
		}
	}

	decrementProp() {
		const currentValue = this.numberFormControl1.value;
		if (currentValue !== null) {
			this.numberFormControl1.setValue(currentValue - 1);
		}
	}

	showAlert() {
		this.show = true;
		setTimeout(() => {
			this.show = false;
		}, 3000); // Hide the alert after 3 seconds (adjust as needed)
	}

	isActive(item: number): boolean {
		return item <= this.activeItem;
	}

	updateActiveItem(item: number): void {
		this.activeItem = item;
	}
	destinationSearchAirports = []
	destinationSearchCities = [];

	async onDestinationSearch() {
		try {
			// Check if search text is null, empty, whitespace, or less than 3 characters
			if (!this.destinationSearchText || this.destinationSearchText.trim().length < 3) {
				this.destinationSearchAirports = [];
				this.destinationSearchCities = [];
				return; // Stop execution
			}
			console.log("Search:", this.destinationSearchText);
			const responseCities = await this.debounce.getCities(this.destinationSearchText);
			this.destinationSearchCities = responseCities?.data?.cities ?? [];
		} catch (err) {
			console.error(err.message);
		}
	}

	onDestinationInputChange(): void {
		this.destinationSearchSubject.next(this.destinationSearchText);
	}

	onSearchCity(): void {
		this.filterCities();
	}
	departureSearchAirports = []
	departureSearchCities = [];

	async onDepartureSearch() {
		try {
			// Check if search text is null, empty, whitespace, or less than 3 characters
			if (!this.departureSearchText || this.departureSearchText.trim().length < 3) {
				this.departureSearchAirports = [];
				this.departureSearchCities = [];
				return; // Stop execution
			}
			console.log("Departure Search:", this.departureSearchText);
			const responseAirports = await this.debounce.getAirports(this.departureSearchText);
			this.departureSearchAirports = responseAirports?.data?.airports ?? [];
		} catch (err) {
			console.error(err.message);
		}
	}
	onDepartureInputChange(): void {
		this.departureSearchSubject.next(this.departureSearchText);
	}


	onNavChange(eventValue: any) {
		// console.log(">> EVen", eventValue);
	}

	selectMonth(month: string): void {
		this.countryService.setSelectedMonth(month);
		this.selectedMonth = month;

		const monthInNumber: { [key: string]: number } = {
			January: 1,
			February: 2,
			March: 3,
			April: 4,
			May: 5,
			June: 6,
			July: 7,
			August: 8,
			September: 9,
			October: 10,
			November: 11,
			December: 12,
		};

		this.dateOptions.month = monthInNumber[this.selectedMonth];
		this.dateOptions.year =
			new Date().getMonth() + 1 > monthInNumber[this.selectedMonth]
				? new Date().getFullYear() + 1
				: new Date().getFullYear();

		// Set the day to the selected day of the month
		let date = new Date(new Date().getFullYear(), monthInNumber[month], 0);
		this.dateModel = {
			day: date.getDate(), // Set the selected day of the month
			month: date.getMonth(),
			year: date.getFullYear(),
		};
		this.active = 2;
	}

	onDateSelect(selectedDate: NgbDateStruct): void {
		if (selectedDate) {
			this.dateModel = selectedDate; // Update the dateModel with the selected date
			const selectedDateStr = `${this.dateModel.year}-${this.dateModel.month}-${this.dateModel.day}`;
			this.selectedDate = selectedDateStr;
		}
		this.countryService.setSelectedDate(this.selectedDate);
		this.active = 3;
	}

	onAirportSelect(airport: string): void {
		this.countryService.setSelectedAirport(airport);
		this.selectedAirport = airport;
		this.active = 4;
	}

	selectDays(days: string): void {
		this.countryService.setSelectedDays(days);
		this.selectedDays = days;
		this.active = 5;
	}

	selectNature(nature: string): void {
		this.countryService.setSelectedNature(nature);
		this.selectedNature = nature;
	}

	selectStar(star: string): void {
		this.countryService.setSelectedStar(star);
		this.selectedStar = star;
	}

	selectPrice(price: string): void {
		this.countryService.setSelectedPrice(price);
		this.selectedPrice = price;
	}

	selectProperty(property: string): void {
		this.countryService.setSelectedProperty(property);
		this.selectedProperty = property;
	}

	noOfTraveler(value: string): void {
		const adults = this.numberFormControl.value || 0;
		const children = this.numberFormControl1.value || 0;

		// Convert adults and children values to strings
		const adultsStr = adults.toString();
		const childrenStr = children.toString();

		// Save adults and children separately as strings
		this.countryService.setSelectedAdults(adultsStr);
		this.countryService.setSelectedChildren(childrenStr);

		this.adultsValue = adults;
		this.childrenValue = children;
		this.active = 6;
	}

	onSelectionChange(event: Event, card: string) {
		const target = event.target as HTMLInputElement;
		const selectedValue = target.checked ? target.value : null;

		switch (card) {
			case "price":
				this.selectedPrice = selectedValue;
				break;
			case "star":
				this.selectedStar = selectedValue;
				break;
			case "property":
				this.selectedProperty = selectedValue;
				break;
			default:
				break;
		}
	}

	private moveToNextStep() {
		this.active = 7;
	}

	// Helper method to get country details based on countryName from CITY_JSON
	getCountryDetails(countryName: string): {
		recommendedMonths: string[];
		visaType: string;
	} {
		const cityData = CITY_JSON.find(
			(city) =>
				city.Continent === countryName ||
				city.countries.some(
					(country: { Country: string; Cities: any }) =>
						country.Country === countryName ||
						country.Cities.includes(countryName)
				)
		);
		let countryData:
			| {
				Country: string;
				"Recommended Months": string[];
				"Visa Types": string;
			}
			| undefined;
		if (cityData && cityData.Continent === countryName) {
			// If the selectedCountry is a continent, get the data for the first country within that continent
			const countriesInContinent = cityData.countries;
			if (countriesInContinent.length > 0) {
				countryData = countriesInContinent[0];
			}
		} else if (cityData) {
			// If the selectedCountry is a city or a country, find the corresponding country data
			countryData = cityData.countries.find(
				(country: { Country: string; Cities: any }) =>
					country.Country === countryName ||
					country.Cities.includes(countryName)
			);
		}
		const recommendedMonths = countryData?.["Recommended Months"] || [];
		const visaType = countryData?.["Visa Types"] || "";
		return { recommendedMonths, visaType };
	}

	onCitySelect(city: City): void {
		const index = this.selectedCities.findIndex(selectedCity => selectedCity.city_id === city.city_id);
		if (index > -1) {
			this.selectedCities.splice(index, 1); // Remove the city if already selected
		} else {
			const { city_id, city_name } = city;
			this.selectedCities.push({
				city_id, city_name
			}); // Add the city if not already selected
			console.log(this.selectedCities);
		}
	}

	filterCities(): void {
		if (this.destinationSearchText.trim() === "") {
			this.filteredCities = this.citiesWithDetails
				.slice(0, 4)
				.map((city) => city.cityName);
		} else {
			this.filteredCities = this.citiesWithDetails
				.filter((city) =>
					city.cityName.toLowerCase().includes(this.destinationSearchText.toLowerCase())
				)
				.map((city) => city.cityName);
		}
	}

	getCitiesByCountryOrContinent(): void {
		this.citiesWithDetails = []; // Reset the array
		this.cities = []; // Clear the cities array

		if (!this.selectedCountry) {
			// No country or continent selected, return early
			// this.toastr.error('Please Select Country.', 'Warning')
			return;
		}

		const selectedCountryData = CITY_JSON.find((city) =>
			city.countries.some(
				(country: { Country: string }) =>
					country.Country === this.selectedCountry
			)
		);

		if (selectedCountryData) {
			// Get cities for the selected country
			this.cities = selectedCountryData.countries
				.filter(
					(country: { Country: string }) =>
						country.Country === this.selectedCountry
				)
				.flatMap((country: { Cities: any }) => country.Cities);
		} else {
			// No matching country data found, check for matching continent
			const selectedContinentData = CITY_JSON.find(
				(city) => city.Continent === this.selectedCountry
			);

			if (selectedContinentData) {
				// Get cities for the selected continent
				this.cities = selectedContinentData.countries.flatMap(
					(country: { Cities: any }) => country.Cities
				);
			} else {
				// Treat selectedCountry as a single city and get cities for the matching country
				for (const continent of CITY_JSON) {
					for (const country of continent.countries) {
						for (const city of country.Cities) {
							if (city === this.selectedCountry) {
								this.cities = country.Cities;
								break; // Exit the loop since we found a match
							}
						}
						if (this.cities.length > 0) {
							break; // Exit the loop since we found cities for the matching country
						}
					}
					if (this.cities.length > 0) {
						break; // Exit the loop since we found cities for the matching country
					}
				}
			}
		}

		// Retrieve additional city details from CITY_DETAIL using the city name
		this.citiesWithDetails = this.cities.map((cityName: string) => ({
			cityName: cityName,
			cityDetails: this.getCityDetails(cityName),
		}));
	}

	// Helper method to get city details based on cityName from CITY_DETAIL
	getCityDetails(cityName: string): CityDetail {
		const cityDetail = CITY_DETAIL.find(
			(city) => city[cityName]?.cityName === cityName
		);
		// console.log('City Detail:', cityDetail);
		return cityDetail?.[cityName] || ({} as CityDetail);
	}

	buildItinerary(): void {
		this.start = false

		console.log(this.selectedCities)
		this.countryService.setSelectedCities(this.selectedCities);

		// storing the data from data in session
		this.createDocument();

		this.postreq.buildMyItinerary();


	}

	createDocument() {
		const data = {
			selectedCountry: this.selectedCountry,
			selectedMonth: this.selectedMonth,
			selectedAirport: this.selectedAirport,
			selectedStartDate: this.selectedStartDate,
			selectedEndDate: this.selectedEndDate,
			// selectedDate: this.selectedDate,
			selectedDays: this.selectedDays,
			selectedNature: this.selectedNature,
			selectedTravelers: this.selectedTravelers,
			adultsValue: this.adultsValue,
			childrenValue: this.childrenValue,
			selectedCities: this.selectedCities,
			selectedPrice: this.selectedPrice,
			selectedStar: this.selectedStar,
			selectedProperty: this.selectedProperty,
		};
		window.sessionStorage.setItem("myData", JSON.stringify(data));
		// console.log(data);
		// setDoc(doc(this.db, collectionName, documentId), data)
		const storedData = window.sessionStorage.getItem("myData");
		if (storedData) {
			const parsedData = JSON.parse(storedData);
			// console.log("session Data:", parsedData);
		}
	}
}