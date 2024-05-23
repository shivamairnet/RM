import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from "@angular/forms";

import { Route, Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { CustomerInfoService } from "src/app/Services/customer-info.service";
import { ApiResponse } from "../not-regitered/res";
import { environment } from "src/environments/environment";
import { CrmServiceService } from "src/app/Services/CRM/crm-service.service";
import { Subject, debounceTime } from "rxjs";

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent implements OnInit {
  
  contact: string = "";
  userData: { phone_number: string; merchantId: string } = {
    phone_number: "",
    merchantId: "merchant123",
  };

  private customerSearchSubject = new Subject<string>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private data: CustomerInfoService,
    private crmService:CrmServiceService
  ) {}

  ngOnInit(): void {
    this.customerSearchSubject
    .pipe(
      debounceTime(500) // Adjust debounce time as needed (300 milliseconds in this example)
    )
    .subscribe(() => {
      this.onCustomerSearch();
    });
  }
  
  onSearch() {
    // const dataToSend = { key: this.userData };
    this.userData.phone_number = this.contact;

   this.loginUser(this.userData);
   
  }

  customerSearchText:string;

  customerSearchData = [];

    gotCustomerSearchData:boolean=false;

  async onCustomerSearch() {
    try {
      // Check if search text is null, empty, or whitespace
      if (
        !this.customerSearchText ||
        this.customerSearchText.trim() === ""
      ) {
        // Clear search results
        this.customerSearchData = [];

        return; // Stop execution
      }
      console.log("Search in destination:", this.customerSearchText);

      const responseCustomers = await this.crmService.loginCustomer(
        this.customerSearchText
      );
      this.gotCustomerSearchData=true;
      console.log(responseCustomers);

      this.customerSearchData = responseCustomers.users;

      console.log(this.customerSearchData);
    } catch (err) {
      console.error(err.message);
    }
  }
  onCustomerSearchInputChange(): void {
    this.customerSearchSubject.next(this.customerSearchText);
  }

  onCustomerSelect(customer){
    console.log("Selected Customer")
    console.log(customer);

    if(customer.user_id){

      localStorage.setItem("customer-details", JSON.stringify(customer));


      this.router.navigate(["/customer"]);
    }
    
  }


  addNewCustomer(){

  this.router.navigate(["/register-user"],{
    queryParams:{customerSearchText:this.customerSearchText}
  });

  }


  async loginUser(data: any) {
    try {

        console.log("request made to login")
      const res =await this.crmService.loginCustomer(this.userData)

      console.log(res);

      if (res.success) {


       console.log("user  found")  
        localStorage.setItem("customer-jwt",res.jwtToken);
        localStorage.setItem("customer-details", JSON.stringify(res.userDetails));

        // localStorage.setItem("user-data", JSON.stringify(res.userDetails));
        // localStorage.setItem("merchant",JSON.stringify(res.userDetails[0].merchantId) );

        this.router.navigate(["/customer"]);
        
      } 
      else if(!res.success) {
        console.log("user not found -- > redirecting to register")
        console.log(res.phone_number);

        localStorage.setItem("contact",res.phone_number);

        this.router.navigate(["/register-user"]);

      }

    } catch (error) {
      console.log(error);
      
    }
  }
}
