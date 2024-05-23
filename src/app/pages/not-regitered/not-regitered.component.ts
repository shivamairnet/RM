import { CrmServiceService } from 'src/app/Services/CRM/crm-service.service';
import { AfterViewInit, Component, OnInit } from "@angular/core";
import { Route, Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ApiResponse } from "./res";

interface UserData{
  name: string;
  email: string;
  phone_number: string;
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
    phone_number: "",
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

    this.route.queryParams.subscribe(params => {
      const customerSearchText = params['customerSearchText'] || '';

      // Check if the customerSearchText is alphabetic
      const isAlphabetic = /^[A-Za-z]+$/.test(customerSearchText);
      
      // Check if the customerSearchText is numeric
      const isNumeric = /^[0-9]+$/.test(customerSearchText);

      console.log('customerSearchText:', customerSearchText);
      console.log('Is Alphabetic:', isAlphabetic);
      console.log('Is Numeric:', isNumeric);
      if(isAlphabetic) {
        this.userData.name=customerSearchText;
      }
      else if(isNumeric){
        this.userData.phone_number=customerSearchText
      }
    });

  


  }

  onRegister() {
    console.log(this.userData);
    this.registerUser(this.userData);
  }

  async registerUser(userData: UserData) {

    try {
      const res=await this.crmService.registerCustomer(userData);

      console.log(res);

      if (res.status == 201) {
        console.log(res.data);
       
        this.router.navigate(["/customer"]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  back() {
    this.router.navigate(["/dashboard"]);
  }


}
