import { Component, OnInit } from '@angular/core';
import { Route, Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from './res';
import { environment } from "src/environments/environment";
@Component({
  selector: 'app-not-regitered',
  templateUrl: './not-regitered.component.html',
  styleUrls: ['./not-regitered.component.scss']
})
export class NotRegiteredComponent implements OnInit {

 
  ngOnInit(): void { 

    this.route.queryParams.subscribe(params => {
      this.inputData = params['user'];
    });
  }
  
  inputData:string = ""

  userData:{name:string, email:string, contactNumber:string, address:string, merchantId:string}={
    name:"",
    email:"",
    contactNumber:"",
    address:"",
    merchantId:"merchant123"
  }


  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    private http: HttpClient

  ) { 
   
  }
 
 
 
  async postData(data: any) {
    const url = `${environment.BACKEND_BASE_URL}/crm/register`;
    try {
      
      const response = await this.http.post(url, this.userData).toPromise() as ApiResponse;  
      console.log('Response:', response.userDetails);
      
      if(response.success==true){
        localStorage.setItem("user-data",JSON.stringify([this.userData]))
        localStorage.setItem("merchant",JSON.stringify(this.userData.merchantId))
        this.router.navigate(['/customer'], { queryParams: { user: this.inputData } })
       
      }
      
    } catch (error) {
      console.error('Error:', error);
      
    }
  }

  back(){
    this.router.navigate(["/dashboard"])
  }
  onAdd(){
    
    this.userData.contactNumber=this.inputData
   

    console.log(this.userData);
    this.postData(this.userData)
    
  }


 


}
