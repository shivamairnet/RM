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

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent implements OnInit {
  
  contact: string = "";
  userData: { contactNumber: string; merchantId: string } = {
    contactNumber: "",
    merchantId: "merchant123",
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private data: CustomerInfoService,
    private crmService:CrmServiceService
  ) {}

  ngOnInit(): void {
    // this.route.queryParams.subscribe((params) => {
    //   console.log(params); // Print the query parameters
    //   const param1 = params["param1"];
    //   const param2 = params["param2"];
    //   // Use the parameters as needed
    // });
  }
  
  onSearch() {
    // const dataToSend = { key: this.userData };
    this.userData.contactNumber = this.contact;

   this.loginUser(this.userData);
   
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
        console.log(res.contactNumber);

        localStorage.setItem("contact",res.contactNumber);

        this.router.navigate(["/register-user"]);

      }

    } catch (error) {
      console.log(error);
      
    }
  }
}
