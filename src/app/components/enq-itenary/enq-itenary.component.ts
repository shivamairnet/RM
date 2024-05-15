import { Component, Input, OnInit } from '@angular/core';
import {nature_of_trip} from "./nature"
import { nature_of_traveller } from './nature';
import { HttpClient } from '@angular/common/http';
import { Route, Router, } from "@angular/router";
import { CustomerInfoService } from 'src/app/Services/customer-info.service';
import { log } from 'console';

@Component({
  selector: 'app-enq-itenary',
  templateUrl: './enq-itenary.component.html',
  styleUrls: ['./enq-itenary.component.scss']
})
export class EnqItenaryComponent implements OnInit {

  @Input() enq:any
  @Input() update:any

  natureofTrip=nature_of_trip 
  
  natureofTraveller=nature_of_traveller

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
    { id: 3, content: 'Infant',   number:0 },
    // Add more items as needed
  ]; 


 itenary:{contactNumber:string,merchantId:string,continent:string,nationality:string,dates:any,numberOfTravellers:any[],origin:string,destinations:string[],interestLevel:string,enquiryDetails:string,followUpDate:string,remarks:string,natureOfTraveller:string|null,natureOfTrip:string[]}={
    contactNumber:"",
    merchantId:"tyh65tr",
    continent:"",
    nationality:"",
    dates:"",
    numberOfTravellers:[],
    origin:"",
    destinations:[],
    interestLevel:"high",
		enquiryDetails:"",
		followUpDate:"",
		remarks:"",
    natureOfTraveller:null,
    natureOfTrip:[]
  } 

  onContChange(event: any,type:string) {
    // This method is called whenever the input value changes
    switch (type) {
      case "Continent":
        this.itenary.continent = event.target.value;
        break;
      case "Nationality":
        this.itenary.nationality = event.target.value;
        break;
         case "Date":
          this.itenary.dates = event.target.value;
          break; 
          case "Departure":
            this.itenary.origin = event.target.value;
            break; 
      default:
        break;
    }
    console.log(this.itenary);
    
     // Update the variable with the new value
  }

  
userData:any
  
dateNew:any

  dis:boolean=false
  dis2:boolean=false


  constructor(

    private http: HttpClient,
    private userDataService:CustomerInfoService,
    private router:Router,
  ) {

   }

   datesEnq:any=""

  ngOnInit(): void {
    this.userData=JSON.parse(localStorage.getItem("user-data"))
    console.log(this.userData);
    if(this.enq.numberOfTravellers!==undefined){
      this.itenary=this.enq
      this.items=this.enq.numberOfTravellers
      this.cities=this.enq.destinations
      console.log(this.itenary.dates.startDate.slice(0,10));
      console.log(this.itenary.dates.endDate.slice(0,10));
      this.datesEnq=this.itenary.dates.startDate.slice(0,10)+" - "+this.itenary.dates.endDate.slice(0,10)
      console.log(this.datesEnq,"hiii");
      this.datechng=false
      this.dateNew=this.itenary.dates
      
      
    }
    
  }
  show(){
    this.dis=!this.dis
    console.log(this.dis);
    
  }
  advance(){
    this.dis2=!this.dis2
    console.log(this.dis2);
    
  }
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

 cities: string[] = [];

 addcity(value: string) {
  console.log("12");
  
  if (value !== '') {
    this.cities.push(value);
    console.log("34");
    console.log(this.cities);
    
    console.log(this.itenary);
    
    
  }
}

ntrav:boolean=false;
  traveller:string=""

  ntrip:boolean=false

  ntr(){
    this.ntrav=!this.ntrav
    
  }
  ntrp(){
    this.ntrip=!this.ntrip
  }
  chooseTrav(trav:string){
    this.traveller=trav
  }

  
  trip:any[]=[]

  addTrip(nature:any, ind){
    console.log(nature.check);
    
    switch (nature.check) {
      case true:
        
         
        this.trip.splice(ind, 1); 
        console.log(this.trip);
        break;
    case false:
      this.trip.push(nature)
      console.log(this.trip,"hii");
      nature.check=!nature.check
      break;

    default:
        break;
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


  submit(){
    console.log(this.userData);

    
    this.itenary.contactNumber=this.userData[0].contactNumber
    this.itenary.enquiryDetails=this.detail
    this.itenary.interestLevel=this.intLevel
    this.itenary.numberOfTravellers=this.items
    this.itenary.natureOfTraveller=this.traveller
    this.itenary.dates=this.dateNew
    // this.itenary.natureOfTrip=this.traveller
    this.itenary.merchantId=this.userData[0].merchantId
    this.itenary.natureOfTrip=this.trip

    console.log(this.itenary.contactNumber);
    
    this.postData(this.itenary)

    
    
  }
  async postData(data:any){
    const res=await this.http.post("http://localhost:4000/crm/itineraryEnquiry",data).toPromise()
    console.log(res);
    this.router.navigate(['/customer'])
  }

  datechng:boolean=true
  dateReset(){
    this.datechng=!this.datechng
  }
  

}
