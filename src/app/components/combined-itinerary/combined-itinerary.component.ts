import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  inject,
} from "@angular/core";
import { ScheduleService } from "src/app/Services/schedule_api/schedule.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { StoreService } from "src/app/Services/store/store.service";

@Component({
  selector: "app-combined-itinerary",
  templateUrl: "./combined-itinerary.component.html",
  styleUrls: ["./combined-itinerary.component.scss"],
})
export class CombinedItineraryComponent implements OnInit, OnChanges {
 
  @Input() docUid;
  
  // flight variables
  @Input() allFlights: any[] = [];
  @Input() currentFlightSetIndex: string;

  currentFlightSet;
  currentFlightSetSegmentsArray = [];
  currentFlightSetLogosArray = [];

  @Output() getCurrentFlightSetIdxEmitter = new EventEmitter<string>();

  // hotel variables
  @Input() allHotels: any[] = [];

  // schedule variables
  allSchedules = [];

  

  cities: any;

  // BOOLEAN VALUES (ngIf values)
  isCurrentFlightSetLoaded = false;

  isFlightOptionsAvailable: boolean = false;

  // will be calling flights and hotels from the itinerary page itself coz they are global(impacting fare Summary).
  // and will be calling schedules here coz they are already finalized in the first phase.
  constructor(
    private scheduleService: ScheduleService,
    private store: StoreService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentFlightSetIndex) {
      // console.log('myInput changed:', changes.currentFlightSetIndex.currentValue);
      this.getCurrentFlightSetIdxEmitter.emit(this.currentFlightSetIndex);
    }
    if (changes.allFlights) {
      console.log("updated allFlights have been called");
      this.allFlights = changes.allFlights.currentValue;
      this.settingCurrentFlightSetAndSegmentsArr(this.currentFlightSetIndex);
    }
  }

  ngOnInit(): void {
    this.getAllSchedules();
  }

  // flights functions
  settingCurrentFlightSetAndSegmentsArr(resultIndex: string) {
    this.currentFlightSet = this.allFlights.filter(
      (flightSet) => flightSet.resultIndex === resultIndex
    );

    // console.log(this.currentFlightSet)

    this.currentFlightSetSegmentsArray = this.currentFlightSet[0].segments;
    this.currentFlightSetLogosArray = this.currentFlightSet[0].airlineLogos;
    // console.log( this.currentFlightSetSegmentsArray);

    this.isCurrentFlightSetLoaded = true;

    // this.offeredFare=this.currentFlightSet[0].fare.OfferedFare;
    // this.publishedFare=this.currentFlightSet[0].fare.PublishedFare;
    return;
  }

  onHighlightedFlightSetIdxChange(highlightedFlightSetIdx: string) {
    console.log("got the updated idx in combined itinerary");

    this.currentFlightSetIndex = highlightedFlightSetIdx;

    // EMITTING THE CURrent Flight Index
    // console.log(this.currentFlightSetIndex)

    this.getCurrentFlightSetIdxEmitter.emit(this.currentFlightSetIndex);

    this.settingCurrentFlightSetAndSegmentsArr(this.currentFlightSetIndex);
  }

  // schedule functions
  async getAllSchedules() {
    try {
      const data: any = await this.scheduleService.getSchedules(this.docUid);
      console.log("===============================", data);
      // Store data in the service
      this.store.setData(data);
      this.allSchedules = data.cities;
      console.log(this.allSchedules);
    } catch (error) {
      console.log(error);
    }
  }

  // dialog box
  showFlightOptions(toshowDialog: boolean) {
    console.log(
      "getting value from child to show dialog in combined itinerary"
    );
    this.isFlightOptionsAvailable = !this.isFlightOptionsAvailable;
  }

  //  hotels functions

  @Output() allSelectedHotels: EventEmitter<any> = new EventEmitter<any>();

  allCurrHotels = [];

  gotCurrHotelsForCity(currCityHotels) {
    console.log("CURRENT CITY HOTELS", currCityHotels);
    const cityName = currCityHotels[0].city;

    const cityIndex = this.allCurrHotels.findIndex(
      (particularCity) => particularCity.cityName === cityName
    );

    if (cityIndex !== -1) {
      // If city already exists, update the hotels array
      this.allCurrHotels[cityIndex].hotels = currCityHotels;
    } else {
      // If city does not exist, add a new entry
      this.allCurrHotels.push({ cityName: cityName, hotels: currCityHotels });
    }

    // need to optmize this - as this making call till the array is full but we want only to call when the array gets full
    if (this.allCurrHotels.length >= 3) {
      console.log("Emitted the AllCurrent HOtels fro mteh combined itinerary");
      this.emitAllCurrHotels();
    }
  }

  emitAllCurrHotels() {
    this.allSelectedHotels.emit(this.allCurrHotels);
  }
}
