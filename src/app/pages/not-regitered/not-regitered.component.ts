import { CrmServiceService } from 'src/app/Services/CRM/crm-service.service';
import { AfterViewInit, Component, OnInit } from "@angular/core";
import { Route, Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ApiResponse } from "./res";

interface UserData{
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  merchantId: string;
}



@Component({
  selector: "app-not-regitered",
  templateUrl: "./not-regitered.component.html",
  styleUrls: ["./not-regitered.component.scss"],
})
export class NotRegiteredComponent implements OnInit  {
  
  inputData: string = "";
  userDetails;

  userData: UserData = {
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    merchantId: "merchant123",
  };
  unRegisteredContactNumber:string

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private crmService:CrmServiceService
  ) {}

  ngOnInit(): void {
    this.unRegisteredContactNumber=localStorage.getItem("contact");
  }

  onRegister() {
    this.userData.contactNumber =this.unRegisteredContactNumber; 
 
    this.registerUser(this.userData);
  }

  async registerUser(userData: UserData) {

    try {
      const res=await this.crmService.registerCustomer(userData);

      if (res.success == true) {
        console.log(res);
        localStorage.setItem("customer-info",res.jwtToken);

        // localStorage.setItem("user-data", JSON.stringify(res.userDetails));
        // localStorage.setItem("merchant",JSON.stringify(res.userDetails[0].merchantId) );

        this.router.navigate(["/customer"], {
          state: {userDetails: res.userDetails },
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  back() {
    this.router.navigate(["/dashboard"]);
  }


}
