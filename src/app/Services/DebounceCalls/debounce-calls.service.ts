import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';


@Injectable({
	providedIn: 'root'
})
export class DebounceCallsService {
	constructor() { }
	
	async getAirports(airport: string) {
		try {
			const data = await axios.get(`${environment.BACKEND_BASE_URL}/search/airport`, { params: { query: airport } })
			console.log(data);
			return data;
		} catch (error) {
			console.error('Error fetching airports:', error);
			return null;
		}

	}

	async getCities(city: string) {
		try {
			console.log("searched for city:",city)
			const data = await axios.get(`${environment.BACKEND_BASE_URL}/search/city`, { params: { query: city } })
			console.log(data);
			return data;
		} catch (error) {
			console.error('Error fetching cities:', error);
			return null;
		}
	}

	async getCountries(country: string) {
		try {
			const data = await axios.get(`${environment.BACKEND_BASE_URL}/search/country`, { params: { query: country } })
			console.log(data);
			return data;
		} catch (error) {
			console.error('Error fetching countries:', error);
			return null;
		}
	}
}
