import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
@Component({
  selector: 'app-payment-breakdown-package',
  templateUrl: './payment-breakdown-package.component.html',
  styleUrls: ['./payment-breakdown-package.component.scss']
})
export class PaymentBreakdownPackageComponent implements OnInit {

  @Input() flightsPublishedFare:string;
  @Input() flightsIncentive:string;

  @Input() hotelsPublishedFare:string;
  @Input() hotelsIncentive:string;


   toCheckout:boolean=false;

  @Output() goToCheckout = new EventEmitter<boolean>();

  constructor() { }
  ngOnInit(): void {
   
  }
  checkoutPackage(){
    this.toCheckout=true
    this.goToCheckout.emit(this.toCheckout)
  }
  
}