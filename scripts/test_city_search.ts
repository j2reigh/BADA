
import { searchCities } from '../lib/photon_client';

async function testCitySearch() {
  const query = 'Seoul';
  console.log(`Searching for cities matching: "${query}"`);

  const startTime = Date.now();
  const results = await searchCities(query, 10);
  const endTime = Date.now();

  console.log(`Found ${results.length} results in ${endTime - startTime}ms:`);
  console.log(JSON.stringify(results, null, 2));
}

testCitySearch().catch(console.error);
