import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Route, Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { CustomerInfoService } from "src/app/Services/customer-info.service";
import { HttpClient } from "@angular/common/http";
import { CrmServiceService } from "src/app/Services/CRM/crm-service.service";

@Component({
  selector: "app-registered-user",
  templateUrl: "./registered-user.component.html",
  styleUrls: ["./registered-user.component.scss"],
})
export class RegisteredUserComponent implements OnInit {
  @Output() dataEvent = new EventEmitter<string>();

  selectedDateRange: any;
  dateRangeOptions: any = {
    autoApply: true,
    alwaysShowCalendars: true,
    opens: "left",
    // You can customize options as needed
  };

  // [(ngModel)]="package.dates"

  mobile: string = "";

  customerHistory: any = [];

  isEditable: boolean[] = [];

  userData: any;

  display = "none";
  load: boolean = true;

  enqDate: string[] = [];

  info: { contactNumber: string; merchantId: string } = {
    contactNumber: "",
    merchantId: "",
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userDataService: CustomerInfoService,
    private http: HttpClient,
    private crmService:CrmServiceService
  
  ) {}

  ngOnInit(): void {

    setTimeout(() => {
      this.loading();
    }, 4000);

    this.userData = JSON.parse(localStorage.getItem("customer-details"))

    console.log(this.userData)

    this.mobile = this.userData.contactNumber;

    this.info.contactNumber = this.userData.contactNumber;
    this.info.merchantId = this.userData.merchantId;

    console.log(this.info.contactNumber);

    this.postdata(this.info);
  }


  loading() {
    this.load = false;
  }


  async postdata(data: any) {
    console.log(data);

    try {
      
      const res= await this.crmService.getAllEnquiriesOfCustomer(data);


      this.customerHistory = [].concat(...res.filter((a) => a.length > 0));

      console.log(this.customerHistory);
      
      const a = this.customerHistory.forEach((element) => {
        const timestamp = element.createdAt;

        // Convert timestamp to milliseconds
        const milliseconds =
          timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000;

        // Create a new Date object with the milliseconds
        const date = new Date(milliseconds);

        // Get the various date components
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Months are zero-based, so we add 1
        const day = date.getDate();

        // Format the date
        const formattedDate = `${year}-${month
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        console.log(`Date: ${formattedDate}`);

        this.enqDate.push(formattedDate);
      });

      for (let i = 0; i < this.customerHistory.length; i++) {
        this.isEditable.push(true);
      }
    } catch (error) {
      console.log(error);
    }
  }


  sno: number = 0;

  back() {
    this.router.navigate(["/dashboard"]);
  }

  logEnquiry() {
    this.router.navigate(["/customerEnquiry"]);
  }
 

  dateChanger(time: any) {
    const timestamp = time;

    // Convert timestamp to milliseconds
    const milliseconds =
      timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000;

    // Create a new Date object with the milliseconds
    const date = new Date(milliseconds);

    // Get the various date components
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based, so we add 1
    const day = date.getDate();

    // Format the date
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    // this.getDate=formattedDate
    // Output the result
    console.log(`Date: ${formattedDate}`);
    return formattedDate;
  }

  timelineData: any[] = [];
  openModal(hist: any) {
    this.display = "block";
    this.timelineData = [hist];
    console.log(this.timelineData);
    console.log(typeof this.timelineData[0].followUpDate);
    this.dateChanger(this.timelineData[0].createdAt);
    console.log(this.timelineData[0].timeline, "hihihi");
    console.log(this.timelineData[0].timeline[0].updatedAt);
    console.log(this.timelineData[0].timeline[1].updatedAt);
    if (this.timelineData[0].timeline.length == 0) {
      console.log("boo");
      console.log(this.timelineData[0].followUpDate);
    }
  }
  onCloseHandled() {
    this.display = "none";
  }
  content: string = "Shivam Sharma";

  toggleEdit(i, inf: any) {
    this.isEditable[i] = !this.isEditable[i];

    this.router.navigate(["/customerEnquiry"], {
      queryParams: { user: this.mobile },
      state: { info: inf, upd: true },
    });
  }

  sendData(i, inf: any) {
    this.isEditable[i] = !this.isEditable[i];
    console.log(inf);
    //inf.enquiryType
    switch (inf.enquiryType) {
      case "Flight":
        console.log("hiii");

        this.flData(inf);

        break;

      default:
        break;
    }
  }

  async flData(dat: any) {
    try {
      const res = await this.http
        .post("http://localhost:4000/crm/flightsEnquiry", dat)
        .toPromise();

      console.log(res, "luffy");
    } catch (error) {}
  }

  async executeEnquiry(enqDetails){

    localStorage.setItem("enqDetails",JSON.stringify(enqDetails));
    localStorage.setItem("enqDocId",enqDetails.docId);

    this.router.navigate(["/generate-aI-itinerary"]);
  } 




}
