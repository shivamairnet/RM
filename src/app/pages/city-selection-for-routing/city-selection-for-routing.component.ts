import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-city-selection-for-routing',
  templateUrl: './city-selection-for-routing.component.html',
  styleUrls: ['./city-selection-for-routing.component.scss']
})
export class CitySelectionForRoutingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  modalOpen = false;

  openModal() {
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  selectOption(option: string) {
    console.log('Selected option:', option);
  }
}
