import { CityDetail } from 'src/app/classes/city';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { StoreService } from "src/app/Services/store/store.service";

@Component({
  selector: "app-city-schedule",
  templateUrl: "./city-schedule.component.html",
  styleUrls: ["./city-schedule.component.scss"],
})
export class CityScheduleComponent implements OnInit, OnChanges {
  data$ = this.store.data$;

  @Input() citySchedule: any;
  @Input() allHotels: any;
  @Input() currentFlightSet: any;

  // @Input() docUid:any;
  modifiedCitySchedule: any;

  dialog: boolean = false;
  selectedHotel: any = null;

  currentHotelsForAllPropertiesInCity: any[] = [];

  @Output() currHotelsForParticularCity: EventEmitter<any> =
    new EventEmitter<any>();

  propertiesAlottedToCity: any[] = [];

  cityProperties = [];

  roomArrFromBackend = [];

  finalRoomsArr;

  weather:string;
  temperature:string;

  isAllHotelsReady: boolean = false;

  constructor(private store: StoreService) {}

  ngOnInit(): void {
    this.store.data$.subscribe((data) => {

      this.roomArrFromBackend = [...data.trip.RoomGuests];

    });
    console.log(this.citySchedule,"989898989898989898989898989898989898989" );

    if(this.citySchedule){
      this.weather=this.citySchedule.cityDetails.weather;
      this.temperature=this.citySchedule.cityDetails.temperature;
    }
  


    // Stores properties of the given Schedule
    this.propertiesAlottedToCity = JSON.parse(
      JSON.stringify(this.citySchedule.Properties)
    );

    // stores roomGuests object from trip from DB
    this.finalRoomsArr = JSON.parse(JSON.stringify(this.roomArrFromBackend));

    console.log("FINAL ROOMS ARRAY")
    console.log(this.finalRoomsArr)
    // this is making the final schedule array
    this.getDaysScheduleForCity(this.citySchedule);

    this.modifiedCitySchedule = JSON.parse(JSON.stringify(this.citySchedule));

    if (
      this.currentFlightSet !== undefined &&
      this.currentFlightSet.length !== 0
    ) {
      console.log("got currentFlightSet");
      this.updatingCitySchedule(this.modifiedCitySchedule);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.allHotels) {
      if(changes.allHotels.currentValue.length>0){
      this.allHotels = changes.allHotels.currentValue;
      console.log(changes.allHotels.currentValue)
      console.log("got all hotels in the city Schedule", this.allHotels);
      this.findHotelWithLowestPrice(this.allHotels);

      this.initializeHotelInfoArray();

      this.emitCurrCityHotels(); // Emit initial data
      }
    }
  }

  updatingCitySchedule(modifiedCitySchedule) {
    const arrDateOfFlight =
      this.currentFlightSet[this.currentFlightSet.length - 1].Destination
        .ArrTime;

    // Get the highest date among all the lower dates than the arrival
    const firstPossibleDay = this.getHighestDateAmongLowest(
      arrDateOfFlight,
      modifiedCitySchedule.days
    );

    // Get the first possible time period of the arrival
    const firstPossibleTimePeriod =
      this.getTimePeriodOfArrTimeOfFlight(arrDateOfFlight);

    // Find the index of the first possible day in modifiedCitySchedule.days
    const firstPossibleDayIndex = modifiedCitySchedule.days.findIndex(
      (day) => day === firstPossibleDay
    );

    if (firstPossibleDayIndex !== -1) {
      // Remove all days before the first possible day
      modifiedCitySchedule.days = modifiedCitySchedule.days.slice(
        firstPossibleDayIndex
      );

      // If the first possible day contains activities, remove activities before the first possible time period
      const firstDayActivities = firstPossibleDay.activities;
      if (firstDayActivities && firstDayActivities.length > 0) {
        firstPossibleDay.activities = firstDayActivities.filter((activity) => {
          // Map time periods to numerical values for comparison
          const timePeriods = ["Morning", "Afternoon", "Evening", "Night"];
          const timePeriodValues = {
            Morning: 1,
            Afternoon: 2,
            Evening: 3,
            Night: 4,
          };

          // Check if the activity time period is greater than or equal to the first possible time period
          return (
            timePeriodValues[activity.activity_timeperiod] >=
            timePeriodValues[firstPossibleTimePeriod]
          );
        });
      }
    }

    this.getDaysScheduleForCity(this.modifiedCitySchedule);

    return;
  }

  getHighestDateAmongLowest(arrDateOfFlight, days) {
    const flightDate = new Date(arrDateOfFlight); // Parsing flight date string

    let highestDateDay = null;

    days.forEach((day) => {
      const dayDate = new Date(day.Date); // Parsing day date string

      // Extracting only the date part from day date
      const dayDateOnly = new Date(
        dayDate.getFullYear(),
        dayDate.getMonth(),
        dayDate.getDate()
      );

      if (
        dayDateOnly <= flightDate &&
        (!highestDateDay || dayDateOnly > highestDateDay.Date)
      ) {
        highestDateDay = day;
      }
    });
    return highestDateDay;
  }

  getTimePeriodOfArrTimeOfFlight(arrDateOfFlight) {
    const arrivalTime = new Date(arrDateOfFlight).getHours(); // Extracting the hour component from the arrival time

    // Determining the time period based on the arrival time
    if (arrivalTime >= 5 && arrivalTime < 12) {
      return "Morning";
    } else if (arrivalTime >= 12 && arrivalTime < 16) {
      return "Afternoon";
    } else if (arrivalTime >= 16 && arrivalTime < 21) {
      return "Evening";
    } else {
      return "Night";
    }
  }

  // Alternate Hotels
  handleAddToItinerary(selectedHotel: any): void {
    this.selectedHotel = selectedHotel;
    if (this.selectedHotel) {
      this.currentHotelsForAllPropertiesInCity.forEach((item) => {
        if (item.checkInDate === this.selectedHotel.checkInDate) {
          item.hotel = this.selectedHotel;
        }
      });
      this.emitCurrCityHotels(); // Emit updated data
    }
  }

  // -----------Functions to open dialog boxes-----------
  isHotelInfo: boolean[] = [];
  // Initialize isHotelInfo array based on the number of hotels
  initializeHotelInfoArray() {
    this.isHotelInfo = Array(
      this.currentHotelsForAllPropertiesInCity.length
    ).fill(false);
  }

  showHotelInfo(index: number) {
    this.isHotelInfo[index] = !this.isHotelInfo[index];
  }

  dialogbox() {
    this.dialog = !this.dialog;

    console.log("click registered , should opne dialog box");
  }

  // -----------------------------------------------------------

  // always update the final rooms arr
  setFinalRoomsArr(lowestPriceHotel) {

    console.log("this the lowest hotel final making the final rooms a arr");
    console.log(lowestPriceHotel)
    try {
      if (!lowestPriceHotel || !lowestPriceHotel.room || !lowestPriceHotel.room.GetHotelRoomResult) {
        throw new Error("Invalid lowest price hotel data.");
      }
  
      const roomCombinations = lowestPriceHotel.room.GetHotelRoomResult.RoomCombinations;
      if (!roomCombinations || !roomCombinations.RoomCombination || !roomCombinations.RoomCombination[0]) {
        throw new Error("Room combinations data not found.");
      }
  
      const roomIndexArr = roomCombinations.RoomCombination[0].RoomIndex;
  
      const hotelRoomsDetails = lowestPriceHotel.room.GetHotelRoomResult.HotelRoomsDetails;
      if (!hotelRoomsDetails) {
        throw new Error("Hotel rooms details not found.");
      }
  
      const filteredRooms = hotelRoomsDetails.filter(room =>
        roomIndexArr.includes(room.RoomIndex)
      );
  
      // Create a deep copy of filteredRooms
      const copiedRooms = JSON.parse(JSON.stringify(filteredRooms));
  
      // Update finalRoomsArr
      this.finalRoomsArr = this.finalRoomsArr.map((item, index) => ({
        ...item,
        room: copiedRooms[index] || null  // handle the case where index is out of bounds
      }));
    } catch (error) {
      console.error("Error in setFinalRoomsArr:", error.message);
      console.error(lowestPriceHotel)
    }
  }
  

  // getting the lowest price hotel and calling the setting finalRoomsArr function
  findHotelWithLowestPrice(allHotels) {

    console.log("in lowest hotel price function",allHotels);

    if (!allHotels || allHotels.length === 0) {
      console.log("No hotels provided.");
      return;
    }

    const cityNameOfCurrCitySchedule = this.citySchedule?.cityDetails?.cityName;
    if (!cityNameOfCurrCitySchedule) {
      console.log("City name not found in city schedule.");
      return;
    }

    this.citySchedule?.Properties.forEach((item) => {
      const checkInDate = item?.checkInDate;
      if (!checkInDate) {
        console.log("Check-in date not found for the property.");
        return;
      }

      const hotelsForCity = allHotels.filter(
        (hotel) =>
          hotel?.cityName === cityNameOfCurrCitySchedule &&
          hotel?.checkInDate === checkInDate
      );

      if (hotelsForCity.length === 0) {
        console.log(
          `No hotels found for city '${cityNameOfCurrCitySchedule}' on date '${checkInDate}'.`
        );
        return;
      }

      let lowestPriceHotel;
      let lowestPrice = Number.MAX_VALUE;

      hotelsForCity.forEach((hotel) => {
        hotel?.Response?.forEach((response) => {
          if( response.room.GetHotelRoomResult.ResponseStatus===1){
          const currentPrice = response?.search?.Price?.PublishedPrice;
          if (currentPrice !== undefined && currentPrice < lowestPrice) {
            lowestPrice = currentPrice;
            lowestPriceHotel = response;
          }
        }
        });
      });

      if (!lowestPriceHotel) {
        console.log(
          `No hotel found with the lowest price for city '${cityNameOfCurrCitySchedule}' on date '${checkInDate}'.`
        );
        return;
      }

      // console.log("Lowest price hotel:", lowestPriceHotel);
      this.setFinalRoomsArr(lowestPriceHotel);
    
      this.currentHotelsForAllPropertiesInCity.push({
        checkInDate: checkInDate,
        hotel: lowestPriceHotel,
        city: cityNameOfCurrCitySchedule,
        roomDetails: this.finalRoomsArr,
      });
    });
    this.isAllHotelsReady = true;
  }

  getHotelNameToDisplay(currentHotel) {
    console.log("CURRENT HOTEL FOR NAME TO DISPLAY")
    console.log(currentHotel);
    try {
      if (
        !currentHotel ||
        !currentHotel.hotel ||
        !currentHotel.hotel.search ||
        !currentHotel.hotel.search.HotelName
      ) {
        throw new Error("Invalid hotel object or missing hotel name");
      }

      return this.truncateText(currentHotel.hotel.search.HotelName, 20);
    } catch (error) {
      console.error(error.message);
      return "No hotel present";
    }
  }

  truncateText(text, maxLength) {
    try {
      if (!text || text.trim() === "") return "No hotel present";

      if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
      }

      return text;
    } catch (error) {
      console.error(error.message);
      return "No hotel present";
    }
  }

  // triggered when getting the updated hotels
  gotFinalRoomsArr(finalRoomsArr) {
    let checkInAsUid = finalRoomsArr[0].checkInDate;

    let roomsTobeChanged = this.currentHotelsForAllPropertiesInCity.find(
      (cityProp) => cityProp.checkInDate === checkInAsUid
    );

    if (roomsTobeChanged) {
      roomsTobeChanged.roomDetails = JSON.parse(JSON.stringify(finalRoomsArr));
    }

    this.emitCurrCityHotels();
  }

  emitCurrCityHotels() {
    this.currHotelsForParticularCity.emit(
      this.currentHotelsForAllPropertiesInCity
    );
  }

  //-------------------------- FUNCTIONS DEPENDING ON CITYSCHEDULE (DB Oriented)--------------------------------------------------

  getNumberOfDaysInCity(citySchedule) {
    try {
      if (
        !citySchedule ||
        !citySchedule.days ||
        !Array.isArray(citySchedule.days)
      ) {
        throw new Error("Invalid city schedule or missing days information");
      }

      return citySchedule.days.length;
    } catch (error) {
      console.error(error.message);
      return 0;
    }
  }

  getCityName(citySchedule) {
    try {
      if (
        !citySchedule ||
        !citySchedule.cityDetails ||
        !citySchedule.cityDetails.cityName
      ) {
        throw new Error("Invalid city schedule or missing city name");
      }

      return citySchedule.cityDetails.cityName;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  getNumberOfDaysInProperty(property) {
    try {
      if (!property || typeof property.numberOfNights !== "number") {
        throw new Error(
          "Invalid property or missing numberOfNights information"
        );
      }

      return property.numberOfNights;
    } catch (error) {
      console.error(error.message);
      return 0;
    }
  }

  getCheckInDate(property) {
    try {
      if (!property || !property.checkInDate) {
        throw new Error(
          "Invalid property or missing check-in date information"
        );
      }

      return property.checkInDate;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  scheduleAccodingToProperties: any[] = [];

  getDaysScheduleForCity(citySchedule) {
    try {
      if (
        !citySchedule ||
        !citySchedule.days ||
        !Array.isArray(citySchedule.days)
      ) {
        throw new Error("Invalid city schedule or missing days information");
      }

      this.scheduleAccodingToProperties = this.organizeSchedules(
        citySchedule.Properties,
        citySchedule.days
      );

      return;
    } catch (error) {
      console.error(error.message);
      return;
    }
  }

  organizeSchedules(properties, schedules) {
    let tempSchedule = JSON.parse(JSON.stringify(schedules));
    const organizedSchedules = [];

    // Iterate over each property starting from the last one
    for (let i = properties.length - 1; i >= 0; i--) {
      const property = properties[i];
      const numberOfNights = property.numberOfNights;
      const propertySchedules = [];

      // Iterate over each night of the property starting from the last night
      for (let j = numberOfNights - 1; j >= 0; j--) {
        // If there are schedules left, assign them to the nights, otherwise assign null
        if (tempSchedule.length > 0) {
          propertySchedules.unshift(tempSchedule.pop());
        } else {
          propertySchedules.unshift("flight");
        }
      }

      organizedSchedules.unshift(propertySchedules);
    }

    return organizedSchedules;
  }

  getDateToDisplay(oneDaySchedule) {
    let inputDate = oneDaySchedule.Date;

    const months = [
      "Jan",
      "Feb",
      "March",
      "April",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    const date = new Date(inputDate);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month}`;
  }
  getActivity(oneDaySchedule, timeperiod: string) {
    try {
      if (
        !oneDaySchedule ||
        !oneDaySchedule.activities ||
        !Array.isArray(oneDaySchedule.activities)
      ) {
        throw new Error("Invalid schedule or no activities found");
      }

      if (oneDaySchedule.activities.length === 0) {
        return " In Flight Time";
      }

      const activity = oneDaySchedule.activities.find(
        (timePeriod) =>
          timePeriod.activity_timeperiod.toLowerCase() === timeperiod
      );

      if (!activity) return "In Flight";
      if (
        typeof activity.activity_name !== "string" ||
        activity.activity_name.trim() === ""
      ) {
        throw new Error("Invalid activity name");
      }

      return activity.activity_name;
    } catch (error) {
      console.error(error.message);
      return "Leisure Time";
    }
  }
  getLocation(oneDaySchedule, timeperiod: string) {
    try {
      if (
        !oneDaySchedule ||
        !oneDaySchedule.activities ||
        !Array.isArray(oneDaySchedule.activities)
      ) {
        throw new Error("Invalid schedule or no activities found");
      }

      if (oneDaySchedule.activities.length === 0) {
        return;
      }

      const activity = oneDaySchedule.activities.find(
        (timePeriod) =>
          timePeriod.activity_timeperiod.toLowerCase() === timeperiod
      );

      if (!activity) return "";
      if (
        typeof activity.activity_name !== "string" ||
        activity.activity_name.trim() === ""
      ) {
        throw new Error("Invalid activity name");
      }

      return activity.location;
    } catch (error) {
      console.error(error.message);
      return;
    }
  }
}
