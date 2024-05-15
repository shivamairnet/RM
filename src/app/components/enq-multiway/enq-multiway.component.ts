import { Component, OnInit } from '@angular/core';
import {  Input, OnChanges, SimpleChanges, EventEmitter, Output  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Route, Router, } from "@angular/router";

@Component({
  selector: 'app-enq-multiway',
  templateUrl: './enq-multiway.component.html',
  styleUrls: ['./enq-multiway.component.scss']
})
export class EnqMultiwayComponent implements OnInit {

  @Input() enqCust:any;
  @Input() data: any;
  @Input() click:boolean;
  @Input() update:any

  selectedDateRange: any;
  dateRangeOptions: any = {
    autoApply: true,
    alwaysShowCalendars: true,
    opens: 'left'
    // You can customize options as needed
  };

  items: any[] = [
    { id: 1, content: 'Adult',    number:0 },
    { id: 2, content: 'Children', number:0 },
    { id: 3, content: 'Infant', number:0 },
   
    // Add more items as needed
  ]; 

 multicity:{merchantId:string,contactNumber:string, journeyType:string,fairType:string,numberOfTravellers:string[],dates:any,nationality:string,origin:string[],destinations:string[],interestLevel:string,enquiryDetails:string,followUpDate:string,remarks:string}={
    merchantId:"nvv",
		contactNumber:"",
		journeyType:"",
		fairType:"",
		numberOfTravellers:[],
		dates:"",
		nationality:"",
		origin:[],
		destinations:[],
		interestLevel:"",
		enquiryDetails:"",
		followUpDate:"",
		remarks:""
  }

  dis:boolean=false
  dis2:boolean=false
  Fair:string ="Regular Fair"

  datesEnq:string=""
  dis3:boolean=false

  constructor(
   private http: HttpClient,
   private router: Router
  ) { }

  userData:any

  ngOnInit(): void {
    this.userData=JSON.parse(localStorage.getItem("user-data"))

    console.log(this.enqCust);
    
    if(this.enqCust.numberOfTravellers!==undefined){
      this.multicity=this.enqCust
      this.items=this.enqCust.numberOfTravellers
      this.cities=this.enqCust.destinations
      this.originCities=this.enqCust.origin
      this.datesEnq=this.multicity.dates.startDate.slice(0,10)+" - "+this.multicity.dates.endDate.slice(0,10)
      console.log(this.datesEnq);
      this.datechng=false
      this.dateNew=this.multicity.dates
      
    }
  }
  dateNew:any

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
  
  
  

  
  show(){
    this.dis=!this.dis
    console.log(this.dis);
    
  }
  div1(){
    this.dis2=!this.dis2
    console.log(this.dis2);
    
  }
  div2(){
    this.dis3=!this.dis3
    console.log(this.dis3);
    
  }

  fareType(fare:string){
    this.Fair=fare
  }

  origin:string=""
  originCities:any[]=[]

  arrival:string=""

  cities:any[]=[]

  flightCard:boolean=false

  addcity(){
    this.cities.push(this.arrival)
    this.originCities.push(this.origin)
    this.flightCard=true
    console.log(this.cities);
    
  }

  detail:string=""

  enqDetail(x:string){
      this.detail=x
   
  }

  intLevel:string=""

  interest(v:string){
   this.intLevel=v
  }

  submit(){
    
    this.multicity.fairType=this.Fair
    this.multicity.journeyType=this.data
    this.multicity.contactNumber=this.userData[0].contactNumber
    this.multicity.enquiryDetails=this.detail
    this.multicity.numberOfTravellers=this.items
    this.multicity.destinations=this.cities
    this.multicity.origin=this.originCities
    this.multicity.interestLevel=this.intLevel
    this.multicity.merchantId=this.userData[0].merchantId
    this.multicity.dates=this.dateNew

    console.log(this.multicity);
    
    this.postData(this.multicity)
  }

  

  async postData(data:any){
    try {
      const res= await this.http.post("http://localhost:4000/crm/flightsEnquiry", data).toPromise()

      console.log(res);
      this.router.navigate(['/customer'])
      
    } catch (error) {
      
    }
  }
  datechng:boolean=true
  dateReset(){
    this.datechng=!this.datechng
  }

  

}
