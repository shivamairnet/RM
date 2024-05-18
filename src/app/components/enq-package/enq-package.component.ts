import { Component, Input, OnInit } from '@angular/core';
import { nature_of_traveller, nature_of_trip } from '../enq-itinerary/nature';
import { HttpClient } from '@angular/common/http';
import { CustomerInfoService } from 'src/app/Services/customer-info.service';
import { Route, Router } from "@angular/router";


@Component({
  selector: 'app-enq-package',
  templateUrl: './enq-package.component.html',
  styleUrls: ['./enq-package.component.scss'],
 

})
export class EnqPackageComponent implements OnInit {

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


 package:{contactNumber:string,merchantId:string,continent:string,nationality:string,dates:any,numberOfTravellers:any[],origin:string,destinations:string[],interestLevel:string,enquiryDetails:string,followUpDate:string,remarks:string,natureOfTraveller:string|null,natureOfTrip:any[]}={
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
        this.package.continent = event.target.value;
        break;
      case "Nationality":
        this.package.nationality = event.target.value;
        break;
         case "Date":
          this.package.dates = event.target.value;
          break; 
          case "Departure":
            this.package.origin = event.target.value;
            break; 
      default:
        break;
    }
    console.log(this.package);
    
     // Update the variable with the new value
  }

  
userData:any
  

  dis:boolean=false
  dis2:boolean=false


  constructor(

    private http: HttpClient,
    private userDataService:CustomerInfoService,
    private router:Router
  ) {

   }
   datesEnq:any=""

  ngOnInit(): void {
    this.userData=JSON.parse(localStorage.getItem("user-data"))
    console.log(this.userData);
    if(this.enq.numberOfTravellers!==undefined){
      this.package=this.enq
      this.items=this.enq.numberOfTravellers
      this.cities=this.enq.destinations
      this.traveller=this.enq.natureOfTraveller
      console.log(this.package.dates.startDate.slice(0,10));
      console.log(this.package.dates.endDate.slice(0,10));
      this.datesEnq=this.package.dates.startDate.slice(0,10)+" - "+this.package.dates.endDate.slice(0,10)
      console.log(this.datesEnq);
      this.datechng=false
      this.dateNew=this.package.dates
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
    
    console.log(this.cities);
   
    console.log(this.package);
    
    
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

  dateNew:any


  submit(){
    console.log(this.userData);

    
    this.package.contactNumber=this.userData[0].contactNumber
    this.package.enquiryDetails=this.detail
    this.package.interestLevel=this.intLevel
    this.package.numberOfTravellers=this.items
    this.package.merchantId=this.userData[0].merchantId
    this.package.natureOfTraveller=this.traveller
    this.package.dates=this.dateNew
    this.package.natureOfTrip=this.trip

    console.log(this.package.contactNumber);
    
    this.postData(this.package)
  }
  async postData(data:any){
    const res=await this.http.post("http://localhost:4000/crm/packageEnquiry",data).toPromise()
    console.log(res);
    this.router.navigate(['/customer'])
    
  }

  

  datechng:boolean=true
  dateReset(){
    this.datechng=!this.datechng
  }

}
