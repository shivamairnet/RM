import { Component, OnInit, Input } from '@angular/core';
// import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-enq-flight',
  templateUrl: './enq-flight.component.html',
  styleUrls: ['./enq-flight.component.scss']
})
export class EnqFlightComponent implements OnInit {

  clicked:boolean=false

  parentObject = { Fairtype:"", Travellers:[], date:"", Nationality:"", Departure:"" , Destination:"" };

  trip:string="One Way"

  @Input() enq: any;
  @Input() up: boolean;

  

  constructor() { }

  ngOnInit(): void {
    // this.trip="Round Trip"
    
    console.log(this.trip);
    console.log(this.up);
    
    switch (this.up==undefined? this.trip:this.enq.journeyType) {
      case "One Way":
        this.trip="One Way"
        break;
        case "Round Trip":
          this.trip="Round Trip"
          break;
          case "Multi City":
            console.log(this.enq,"zoro");
            
            this.trip="Multi City"
            break;
    
      default:
        this.trip="One Way"
        break;
    }
    
    
  }
  

  option(label:string){
    console.log(label);
    this.trip=label
  
  }
  

}
