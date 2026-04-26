export interface GeoNode {
  name: string;
  coords: [number, number];
  core: string;
  type: 'state' | 'ut';
}

export interface CoreHub {
  name: string;
  color: string;
  coords: [number, number];
}

export type Theme = 'dark' | 'light';
