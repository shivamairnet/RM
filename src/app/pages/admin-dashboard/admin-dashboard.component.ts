import { Component, OnInit,Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from "@angular/forms";

import { Route, Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { CustomerInfoService } from 'src/app/Services/customer-info.service';
import { ApiResponse } from '../not-regitered/res';
import { environment } from "src/environments/environment";
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {


   contact: string=""
userData:{contactNumber:string,merchantId:string}={
  contactNumber:"",
  merchantId:"merchant123"
}


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http:HttpClient,
    private data:CustomerInfoService
  ) { }

  ngOnInit(): void { 
    this.route.queryParams.subscribe(params => {
      console.log(params); // Print the query parameters
      const param1 = params['param1'];
      const param2 = params['param2'];
      // Use the parameters as needed
    });
  }
  onSearch(){
    // const dataToSend = { key: this.userData };
    this.userData.contactNumber=this.contact
    
    this.loginUser(this.userData)
  }

  async loginUser(data:any){
    try {
      const res= await this.http.post(`${environment.BACKEND_BASE_URL}/crm/login`,data).toPromise() as ApiResponse;
      console.log(res);
      if(res.success==true){
        this.data.setUserData(res.userDetails);
        localStorage.setItem("user-data",JSON.stringify(res.userDetails))
        localStorage.setItem("merchant",JSON.stringify(res.userDetails[0].merchantId))
        this.router.navigate(['/customer'], { queryParams: { user: this.contact } })
        console.log(this.data.getUserData(),"yooo");
      }
      else{
        
        this.router.navigate(['/register-user'], { queryParams: { user: this.contact }, state: { data }  }) 
      }
      
    } catch (error) {
      console.log(error);
      this.router.navigate(['/register-user'], { queryParams: { user: this.contact }, state: { data }  }) 
      
    }
   

  }

}
