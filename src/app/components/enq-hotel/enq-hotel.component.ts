import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AnySoaRecord } from 'dns';
import { Route, Router, } from "@angular/router";

@Component({
  selector: 'app-enq-hotel',
  templateUrl: './enq-hotel.component.html',
  styleUrls: ['./enq-hotel.component.scss']
})
export class EnqHotelComponent implements OnInit {
  @Input() enq:any
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
   
    // Add more items as needed
  ]; 

  hotel:{contactNumber:string,merchantId:string,continent:string,nationality:string,dates:any,numberOfTravellers:any[],destinations:string[],numberOfRooms:number,roomsWithPax:string,interestLevel:string,enquiryDetails:string,followUpDate:string,remarks:string}={
    contactNumber:"",
    merchantId:"ytry",
    continent:"",
    nationality:"",
    dates:"",
    numberOfTravellers:[],
    destinations:[],
    numberOfRooms:0,
    roomsWithPax:"bvc",
    interestLevel:"vcb",
    enquiryDetails:"",
    followUpDate:"",
    remarks:""
  }

  rooms:any[]=[
    { Adult:0, Children:0 ,age:[]  }
    
  ]
  count:number=1
  addRoom(){
    
    const newRoom={ Adult:0, Children:0, age:[]}
    this.rooms.push(newRoom)
    console.log(this.rooms);
    
    
  }
  // resetRoom(){
  //   if (i > -1) {
  //     item.age.splice(i, 1);
  // }

  // }

children:number[]=[]

  ChngTraveller(item:any,x:string,i){
    if(x==="incAd"){
      
      item.Adult+=1
    console.log(item.number);
    }
    if(x==="incCh"){
      
      item.Children+=1
    console.log(item.number);
    item.age.push(0)
    }
    if(x==="decAd"){
      if(item.Adult>=1){
      item.Adult-=1
    console.log(item);
    
      }
      else{
        item=0
      }
    }
    if(x==="decCh"){
      if(item.Children>=1){
      item.Children-=1
    console.log(item);
    if (i > -1) {
      item.age.splice(i, 1);
  }
      }
      else{
        item=0
      }
    }
    
    
  }

   removeItem(index) {
    
}

  datesEnq:string=""

  dis:boolean=false

  userData:any

  constructor(
    private http: HttpClient,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.userData=JSON.parse(localStorage.getItem("user-data"))
    console.log(this.userData);
    
   console.log(this.enq,"tyty");
   
    console.log(this.hotel);
    if(this.enq.numberOfTravellers!==undefined){
      this.hotel=this.enq
      this.rooms=this.enq.numberOfTravellers
      this.cities=this.enq.destinations
      this.datesEnq=this.hotel.dates.startDate.slice(0,10)+" - "+this.hotel.dates.endDate.slice(0,10)
      console.log(this.datesEnq,"hiii");
      this.datechng=false
      this.dateNew=this.hotel.dates
    }
   
    
    
  }
  show(){
    this.dis=!this.dis
    
    console.log(this.dis);
    
  }

  onContChange(event: any,type:string){
    switch (type) {
      case "Continent":
        this.hotel.continent=event.target.value
        break;
        case "Nationality":
          this.hotel.nationality=event.target.value
          break;  
          case "Date":
            this.hotel.dates=event.target.value
            break;
             
      default:
        break;
    }

    console.log(this.hotel);
    
  }
  cities: string[] = [];

  addcity(value: string) {
    console.log("12");
    
    if (value !== '') {
      this.cities.push(value);
      console.log("34");
      console.log(this.cities);
      // this.hotel.destinations.push(value)
      console.log(this.hotel);
    }
  }
  detail:string=""

  enqDetail(x:string){
      this.detail=x
   
  }

  intLevel:string=""

  interest(v:string){
   this.intLevel=v
  }

  dateNew:any
  

  submit(){
    this.hotel.contactNumber=this.userData[0].contactNumber
    this.hotel.merchantId=this.userData[0].merchantId
    console.log(this.hotel.contactNumber);
    this.hotel.enquiryDetails=this.detail
    this.hotel.destinations=this.cities
    this.hotel.interestLevel=this.intLevel
    this.hotel.numberOfTravellers=this.rooms
    this.hotel.numberOfRooms=this.rooms.length
    this.hotel.dates=this.dateNew

    console.log(this.hotel);
    
    
    this.postData(this.hotel)
  }
  
async postData(data:any){
    const res=await this.http.post("http://localhost:4000/crm/hotelsEnquiry",data).toPromise()
    console.log(res);
    this.router.navigate(['/customer'])
    
  }

  datechng:boolean=true
  dateReset(){
    this.datechng=!this.datechng
  }

}
