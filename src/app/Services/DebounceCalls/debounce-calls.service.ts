import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DebounceCallsService {

  constructor() { }


  async getAirports(airport:string){

    try {
      const data = await axios.get(`${environment.BACKEND_BASE_URL}/search/airport`, { params: { query: airport } })
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching airports:', error);
      return null;
    }

  }

  async getCities(city:string){
    try {
      const data = await axios.get(`${environment.BACKEND_BASE_URL}/search/city`, { params: { query: city } })
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      return null;
    }
  }

  async getCountries (country:string){
    try {
      const data = await axios.get(`${environment.BACKEND_BASE_URL}/search/country`, { params: { query: country } })
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return null;
    }
  }


//   {
//     "airports": [
//         {
//             "airport_id": 2736,
//             "name": "Chandigarh Airport",
//             "alias": "Chandigarh International Airport",
//             "city": "Chandigarh",
//             "city_alias": null,
//             "iata": "IXC",
//             "icao": "VICG",
//             "icao_alias": null,
//             "latitude": "30.673500",
//             "longitude": "76.788498",
//             "country_name": "India",
//             "type": "medium_airport",
//             "iso2": "IN",
//             "emoji": "🇮🇳",
//             "capital": "New Delhi",
//             "country_id": 101,
//             "matches": [
//                 "name",
//                 "city",
//                 "alias",
//                 "country_name"
//             ],
//             "score": 0.9999999296976237,
//             "rating": 0.9999999296976237
//         },
//         {
//             "airport_id": 4908,
//             "name": "Changde Airport",
//             "alias": "Changde Taohuayuan Airport",
//             "city": "Changde",
//             "city_alias": "Changde (Dingcheng)",
//             "iata": "CGD",
//             "icao": "ZGCD",
//             "icao_alias": null,
//             "latitude": "28.918900",
//             "longitude": "111.639999",
//             "country_name": "China",
//             "type": "medium_airport",
//             "iso2": "CN",
//             "emoji": "🇨🇳",
//             "capital": "Beijing",
//             "country_id": 45,
//             "matches": [
//                 "name",
//                 "city",
//                 "alias",
//                 "country_name",
//                 "city_alias"
//             ],
//             "score": 0.9733990267712824,
//             "rating": 0.9733990267712824
//         },
//         {
//             "airport_id": 15610,
//             "name": "Chandia Airstrip",
//             "alias": null,
//             "city": "Chandia",
//             "city_alias": "Chandia",
//             "iata": null,
//             "icao": "BW-0014",
//             "icao_alias": null,
//             "latitude": "-18.515400",
//             "longitude": "25.495408",
//             "country_name": "Botswana",
//             "type": "small_airport",
//             "iso2": "BW",
//             "emoji": "🇧🇼",
//             "capital": "Gaborone",
//             "country_id": 29,
//             "matches": [
//                 "name",
//                 "city",
//                 "city_alias"
//             ],
//             "score": 0.99640800763222,
//             "rating": 0.99640800763222
//         },
//         {
//             "airport_id": 15877,
//             "name": "Caniapiscau Airport",
//             "alias": null,
//             "city": "Caniapiscau",
//             "city_alias": "Caniapiscau",
//             "iata": null,
//             "icao": "CCP6",
//             "icao_alias": null,
//             "latitude": "54.837799",
//             "longitude": "-69.892799",
//             "country_name": "Canada",
//             "type": "small_airport",
//             "iso2": "CA",
//             "emoji": "🇨🇦",
//             "capital": "Ottawa",
//             "country_id": 39,
//             "matches": [
//                 "name",
//                 "city",
//                 "country_name",
//                 "city_alias"
//             ],
//             "score": 0.9648542637083478,
//             "rating": 0.9648542637083478
//         },
//         {
//             "airport_id": 38545,
//             "name": "Handa Airport",
//             "alias": null,
//             "city": "Handa",
//             "city_alias": "Handa",
//             "iata": null,
//             "icao": "TZ-0064",
//             "icao_alias": null,
//             "latitude": "-4.954854",
//             "longitude": "35.323672",
//             "country_name": "Tanzania",
//             "type": "small_airport",
//             "iso2": "TZ",
//             "emoji": "🇹🇿",
//             "capital": "Dodoma",
//             "country_id": 218,
//             "matches": [
//                 "name",
//                 "city",
//                 "country_name",
//                 "city_alias"
//             ],
//             "score": 0.9634484342566817,
//             "rating": 0.9634484342566817
//         }
//     ]
// }
}
