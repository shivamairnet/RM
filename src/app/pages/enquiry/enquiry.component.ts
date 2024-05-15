import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Route, Router } from "@angular/router";
import { CustomerInfoService } from 'src/app/Services/customer-info.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.scss']
})
export class EnquiryComponent implements OnInit {
  mobile:string=""
  package:boolean=false
  hotel:boolean=false
  Itinerary:boolean=true
  flight:boolean=false
userData:any
custEnq:any

selectedDateRange: any;
dateRangeOptions: any = {
  autoApply: true,
  alwaysShowCalendars: true,
  opens: 'left'
  // You can customize options as needed
};


  constructor(
    private route: ActivatedRoute,
    private router:Router,
    private userDataService:CustomerInfoService       
  ) { }

  up:boolean=false

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mobile = params['user'];
    
    
  
    });
    this.userData=JSON.parse(localStorage.getItem("user-data"))

    this.custEnq = history.state.info;
    this.up = history.state.upd 

  console.log(this.custEnq,"hiiii");

  if(!(this.custEnq==undefined)){
    switch (this.custEnq.enquiryType) {
      case "Flight":
        switch (this.custEnq.journeyType) {
          case "One Way":
            this.Itinerary=false
            this.flight=true
            break;
            case "Round Trip":
            this.Itinerary=false
            this.flight=true
            break;
            case "Multi City":
              console.log(this.custEnq);
              
            this.Itinerary=false
            this.flight=true
            break;
        
          default:
            break;
        }
        
 
        break;
      case "Hotel":
        this.hotel=true
        this.Itinerary=false
        break;
        case "Package":
          this.package=true
          this.Itinerary=false
          break;
          case "Itinerary":
            this.package=false
            this.Itinerary=true
            break;
      default:
        break;
    }
  }
  }
  clicked(enq:string){
    switch (enq) {
      case "package":
        this.package=true
        this.hotel=false
        this.Itinerary=false
        this.flight=false
        
        
        break;
        case "hotel":
          this.hotel=  true
          this.package=false
          this.Itinerary=false
          this.flight=false

          break;

        case "itenary":
        this.package=false
        this.hotel=false
        this.flight=false
        this.Itinerary=true
        
        
        break;
        case "flight":
        this.package=false
        this.hotel=false
        this.Itinerary=false
        this.flight=true
       
        
        
        break;
    
      default:
        break;
    }
  }
  back(){
    this.router.navigate(["/customer"])
  }

}
