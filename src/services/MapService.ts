import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export interface MapFeatures {
  countries: any;
  indiaStates: any;
}

export async function fetchMapData(): Promise<MapFeatures> {
  let latestUrl = '';
  try {
    // World countries for background context (50m resolution)
    latestUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
    const worldData: any = await d3.json(latestUrl);
    const countries = topojson.feature(worldData, worldData.objects.countries);

    // Administrative Level 1 Boundaries (States/Provinces) for South Asia
    latestUrl = 'https://raw.githubusercontent.com/shijithpk/south_asia_shapefile_with_JK_border/refs/heads/master/south_asia.geojson';
    const indiaStates: any = await d3.json(latestUrl);
    
    return {
      countries,
      indiaStates: indiaStates || { type: 'FeatureCollection', features: [] }
    };
  } catch (error) {
    console.error(`Failed to fetch map data from ${latestUrl}:`, error);
    return {
      countries: { type: 'FeatureCollection', features: [] },
      indiaStates: { type: 'FeatureCollection', features: [] }
    };
  }
}
