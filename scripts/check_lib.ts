
import { Country } from 'country-state-city';

const countries = Country.getAllCountries();
console.log("Count:", countries.length);
console.log("Sample:", countries[0]);
console.log("Sample KR:", countries.find(c => c.isoCode === 'KR'));
