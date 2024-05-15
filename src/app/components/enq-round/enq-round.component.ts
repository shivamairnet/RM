import { Component, OnInit } from '@angular/core';
import {  Input, OnChanges, SimpleChanges, EventEmitter, Output  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Route, Router, } from "@angular/router";

@Component({
  selector: 'app-enq-round',
  templateUrl: './enq-round.component.html',
  styleUrls: ['./enq-round.component.scss']
})
export class EnqRoundComponent implements OnInit {

  
  
  @Input() enqCust:any;
  
  @Input() data: any;
  @Input() click:boolean;
  @Input() update:any

  items:any[] = [
    { id: 1, content: 'Adult',    number:0 },
    { id: 2, content: 'Children', number:0 },
    { id: 3, content: 'Infant', number:0 },
   
    // Add more items as needed
  ]; 
  

  roundtrip:{merchantId:string,contactNumber:string, journeyType:string,fairType:string,numberOfTravellers:string[],dates:string,nationality:string,origin:string,destinations:string[],interestLevel:string,enquiryDetails:string,followUpDate:string,remarks:string}={
    merchantId:"nvv",
		contactNumber:"",
		journeyType:"",
		fairType:"",
		numberOfTravellers:this.items,
		dates:"",
		nationality:"",
		origin:"",
		destinations:[],
		interestLevel:"",
		enquiryDetails:"",
		followUpDate:"",
		remarks:""
  }

  

  dis:boolean=false
  dis2:boolean=false
  Fair:string ="Regular Fair"


  constructor(
   private http: HttpClient,
   private router:Router
  ) { }



 

  ChngTraveller(item:any,x:string){
    if(x==="inc"){
      item.number+=1
    console.log(item.number);
    }
    if(x==="dec"){
      if(item.number>=1){
      item.number-=1
    console.log(item.number);
      }
      else{
        item.number=0
      }
    }
    
    
  }
  
  userData:any

  ngOnInit(): void {
    this.userData=JSON.parse(localStorage.getItem("user-data"))
    if(this.enqCust){
      if(this.enqCust.numberOfTravellers!==undefined){
        this.items=this.enqCust.numberOfTravellers
      this.Fair=this.enqCust.fairType
      console.log(this.enqCust.destinations[0]);
      
      this.arrival=this.enqCust.destinations
      this.roundtrip=this.enqCust
      }
      
    }
   
  }
 
  show(){
    this.dis=!this.dis
    console.log(this.dis);
    
  }
  div1(){
    this.dis2=!this.dis2
    console.log(this.dis2);
    
  }

  fareType(fare:string){
    this.Fair=fare
  }

  arrival:string[]=[]

  detail:string=""

  enqDetail(x:string){
      this.detail=x
   
  }

  intLevel:string=""

  interest(v:string){
   this.intLevel=v
  }

  submit(){
    this.roundtrip.destinations=this.arrival
    this.roundtrip.fairType=this.Fair
    this.roundtrip.journeyType=this.data
    this.roundtrip.contactNumber=this.userData[0].contactNumber
    this.roundtrip.enquiryDetails=this.detail
    this.roundtrip.interestLevel=this.intLevel
    this.roundtrip.merchantId=this.userData[0].merchantId

    console.log(this.roundtrip);
    
    this.postData(this.roundtrip)
  }

  

  async postData(data:any){
    try {
      const res= await this.http.post("http://localhost:4000/crm/flightsEnquiry", data).toPromise()

      console.log(res);
      this.router.navigate(['/customer'])
      
    } catch (error) {
      
    }
  }
 
}
