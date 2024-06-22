import { Component, OnInit } from '@angular/core';

interface CityData {
  image: string;
  info: string;
  airports: string[];
}

interface NightsCount {
  [city: string]: number;
}

@Component({
  selector: 'app-tester',
  templateUrl: './tester.component.html',
  styleUrls: ['./tester.component.scss']
})
export class TesterComponent implements OnInit {
  nightsCount: NightsCount = {};
  cityData: Record<string, CityData>; // Define cityData at class level
  modalOpen = false;

  constructor() {
    // Initialize cityData in the constructor
    this.cityData = {
      Mumbai: {
        image: 'img/mumbai.jpeg',
        info: 'Mumbai is the financial capital of India.',
        airports: ['Chhatrapati Shivaji Maharaj International Airport', 'Juhu Aerodrome']
      },
      Delhi: {
        image: 'img/delhi.jpeg',
        info: 'Delhi is the capital city of India.',
        airports: ['Indira Gandhi International Airport', 'Safdarjung Airport']
      },
      Bangalore: {
        image: 'img/bangalore.jpeg',
        info: 'Bangalore is known as the Silicon Valley of India.',
        airports: ['Kempegowda International Airport', 'HAL Airport']
      },
      Chennai: {
        image: 'img/chennai.jpeg',
        info: 'Chennai is known for its cultural heritage.',
        airports: ['Chennai International Airport', 'Madras Airport']
      }
    };
  }

  ngOnInit(): void {
    this.setupCityData();
    this.setupEventListeners();
  }

  openModal() {
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  selectOption(option: string) {
    console.log('Selected option:', option);
  }

  changeNights(city: string, delta: number): void {
    if (!this.nightsCount[city]) {
      this.nightsCount[city] = 0;
    }
    this.nightsCount[city] += delta;
    if (this.nightsCount[city] < 0) this.nightsCount[city] = 0; // Ensure nights count doesn't go negative
    const nightsElement = document.getElementById(`nights-${city}`);
    if (nightsElement) {
      nightsElement.textContent = `${this.nightsCount[city]} nights`;
    }
  }

  showCardsContainer(): void {
    console.log("hi");
    const emptyState = document.getElementById('empty-state') as HTMLElement;
    const cardsContainer = document.getElementById('cardsContainer') as HTMLElement;
    console.log("cardscontainer", cardsContainer);
    if (emptyState && cardsContainer) {
      emptyState.classList.add('hidden');
      cardsContainer.classList.remove('hidden');
    }
  }

  setupCityData(): void {
    // Initialize city data and setup related functionalities
    const cityDropdown = document.getElementById('city-dropdown') as HTMLSelectElement;
    const citySearch = document.getElementById('city-search') as HTMLInputElement;
    const cityList = document.getElementById('city-list') as HTMLElement;

    for (const city in this.cityData) {
      let option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      cityDropdown.appendChild(option);

      let datalistOption = document.createElement('option');
      datalistOption.value = city;
      cityList.appendChild(datalistOption);
    }

   
    citySearch.addEventListener('input', () => {
      const searchText = citySearch.value.toLowerCase();
      const matchedCities = Object.keys(this.cityData).filter(city => city.toLowerCase().includes(searchText));

      cityList.innerHTML = '';

      matchedCities.forEach(city => {
        let datalistOption = document.createElement('option');
        datalistOption.value = city;
        cityList.appendChild(datalistOption);
      });
    });

    citySearch.addEventListener('change', () => {
      citySearch.placeholder = '';
      const selectedCity = citySearch.value;
      localStorage.setItem('DestinationCities', selectedCity);
      localStorage.setItem('DestinationCitiesDescription', this.cityData[selectedCity].info);
      if (!selectedCity || !this.cityData[selectedCity]) return;
      this.addDynamicCity(selectedCity);
      while (cityList.firstChild) {
        cityList.removeChild(cityList.firstChild);
      }
    });
  }
  citiesSearch(): void {
    const citySearch = document.getElementById('city-search') as HTMLInputElement;
    const cityList = document.getElementById('city-list') as HTMLElement;

    if (citySearch) {
      citySearch.addEventListener('change', (event: Event) => {
        const target = event.target as HTMLInputElement;
        citySearch.placeholder = '';
        const selectedCity = target.value;
        localStorage.setItem('DestinationCities', selectedCity);
        if (this.cityData[selectedCity]) {
          localStorage.setItem('DestinationCitiesDescription', this.cityData[selectedCity].info);
        }
        if (!selectedCity || !this.cityData[selectedCity]) return;
        this.addDynamicCity(selectedCity);
        while (cityList.firstChild) {
          cityList.removeChild(cityList.firstChild);
        }
      });
    }
  }
  updateCityInformation(city: string, cityInfoElem: HTMLElement): void {
    if (city && this.cityData[city]) {
      cityInfoElem.innerHTML = `
        <div class="city-info-container">
          <h2>${city} City</h2>
          <div class="bg-customPurple rounded-2xl">
            <div><img src="${this.cityData[city].image}" alt="${city}"></div>
            <p>${this.cityData[city].info}</p>
            <ul>
              ${this.cityData[city].airports.map(airport => `
                <li style="list-style-type: none;">
                  <div>
                    <input type="radio" name="airport" value="${airport}" id="${airport}">
                    <label for="${airport}">${airport}</label>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
          <button id="lockButton" class="lock-toggle">Lock</button>
        </div>
      `;
      const lockButton = cityInfoElem.querySelector('#lockButton') as HTMLButtonElement;
      if (lockButton) {
        lockButton.addEventListener('click', () => {
          const cityInfoContainer = lockButton.closest('.city-info-container') as HTMLElement;
          cityInfoContainer.classList.toggle('locked');
          lockButton.textContent = cityInfoContainer.classList.contains('locked') ? 'Unlock' : 'Lock';
        });
      }
    } else {
      cityInfoElem.innerHTML = '';
    }
  }

  addDynamicCity(city: string): void {
    const dynamicCitiesContainer = document.getElementById('dynamic-cities-container') as HTMLElement;
    const existingCity = Array.from(dynamicCitiesContainer.children).find((child: HTMLElement) => child.dataset.city === city);
    if (existingCity) return;

    const newCityInfo = document.createElement('div');
    newCityInfo.classList.add('city-info');
    newCityInfo.dataset.city = city;
    newCityInfo.draggable = true;

    this.updateCityInformation(city, newCityInfo);

    dynamicCitiesContainer.appendChild(newCityInfo);

    newCityInfo.addEventListener('dragstart', (e: DragEvent) => {
      if (!newCityInfo.classList.contains('locked')) {
        e.dataTransfer!.setData('text/plain', city);
        e.dataTransfer!.effectAllowed = 'move';
        newCityInfo.classList.add('dragging');
      } else {
        e.preventDefault();
      }
    });

    newCityInfo.addEventListener('dragend', () => {
      newCityInfo.classList.remove('dragging');
    });

    newCityInfo.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      const bounding = newCityInfo.getBoundingClientRect();
      const offset = e.clientY - bounding.top + newCityInfo.scrollTop;
      if (offset > bounding.height / 2) {
        newCityInfo.style.borderBottom = "2px solid #000";
        newCityInfo.style.borderTop = "";
      } else {
        newCityInfo.style.borderTop = "2px solid #000";
        newCityInfo.style.borderBottom = "";
      }
    });

    newCityInfo.addEventListener('dragleave', () => {
      newCityInfo.style.borderTop = "";
      newCityInfo.style.borderBottom = "";
    });

    newCityInfo.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      newCityInfo.style.borderTop = "";
      newCityInfo.style.borderBottom = "";
      const draggedCity = e.dataTransfer!.getData('text/plain');
      const draggedElem = document.querySelector('.dragging') as HTMLElement;
      const bounding = newCityInfo.getBoundingClientRect();
      const offset = e.clientY - bounding.top + newCityInfo.scrollTop;
      if (offset > bounding.height / 2) {
        newCityInfo.parentNode!.insertBefore(draggedElem, newCityInfo.nextSibling);
      } else {
        newCityInfo.parentNode!.insertBefore(draggedElem, newCityInfo);
      }
    });
  }

  setupEventListeners(): void {
    const modal = document.getElementById('modal') as HTMLElement;
    if (modal) {
      modal.addEventListener('click', (event) => {
        const target = event.target as HTMLElement; // Cast event.target to HTMLElement
        if (target.classList.contains('modal')) {
          modal.classList.add('hidden');
        }
      });
    }

    const cityDropdown = document.getElementById('city-dropdown') as HTMLSelectElement;
    if (cityDropdown) {
    cityDropdown.addEventListener('change', () => {
        const selectedCity = cityDropdown.value;
        localStorage.setItem('CityDropdown', selectedCity);
        localStorage.setItem('CityDropdownDescription', this.cityData[selectedCity].info);
        if (!selectedCity || !this.cityData[selectedCity]) return;
        const arrivalCityInfo = document.getElementById('arrival-city-info') as HTMLElement;
        const destinationCityInfo = document.getElementById('destination-city-info') as HTMLElement;
        this.updateCityInformation(selectedCity, arrivalCityInfo);
        this.updateCityInformation(selectedCity, destinationCityInfo);
        this.showCardsContainer();
      });
    }
    

    const arrivalCityInfo = document.getElementById('arrival-city-info') as HTMLElement;
    const destinationCityInfo = document.getElementById('destination-city-info') as HTMLElement;
    const dynamicCitiesContainer = document.getElementById('dynamic-cities-container') as HTMLElement;

    this.setupDragAndDrop(arrivalCityInfo);
    this.setupDragAndDrop(destinationCityInfo);
    this.setupDragAndDrop(dynamicCitiesContainer);
  }

  setupDragAndDrop(container: HTMLElement): void {
    container.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
    });

    container.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      const draggedCity = e.dataTransfer!.getData('text/plain');
      const draggedElem = document.querySelector('.dragging') as HTMLElement;
      if (draggedElem) {
        container.appendChild(draggedElem);
      }
    });

    Array.from(container.children).forEach((child: HTMLElement) => {
      child.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging') as HTMLElement;
        const bounding = child.getBoundingClientRect();
        const offset = e.clientY - bounding.top + child.scrollTop;
        if (offset > bounding.height / 2) {
          child.style.borderBottom = "2px solid #000";
          child.style.borderTop = "";
        } else {
          child.style.borderTop = "2px solid #000";
          child.style.borderBottom = "";
        }
      });

      child.addEventListener('dragleave', () => {
        child.style.borderTop = "";
        child.style.borderBottom = "";
      });

      child.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        child.style.borderTop = "";
        child.style.borderBottom = "";
        const draggedCity = e.dataTransfer!.getData('text/plain');
        const draggedElem = document.querySelector('.dragging') as HTMLElement;
        const bounding = child.getBoundingClientRect();
        const offset = e.clientY - bounding.top + child.scrollTop;
        if (offset > bounding.height / 2) {
          child.parentNode!.insertBefore(draggedElem, child.nextSibling);
        } else {
          child.parentNode!.insertBefore(draggedElem, child);
        }
      });
    });
  }
}
