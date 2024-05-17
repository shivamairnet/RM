// src/app/models/city.model.ts
export class City {
	city_id: number;
	city_name: string;
	state_name: string;
	country_name: string;
	country_code: string;

	constructor(
		city_id: number,
		city_name: string,
		state_name: string,
		country_name: string,
		country_code: string
	) {
		this.city_id = city_id;
		this.city_name = city_name;
		this.state_name = state_name;
		this.country_name = country_name;
		this.country_code = country_code;
	}
}

export interface SelectedCity {
	city_id: number;
	city_name: string;
}