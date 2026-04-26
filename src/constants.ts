import { CoreHub, GeoNode } from './types';

export const CORES: Record<string, CoreHub> = {
  delhi: { name: "Delhi", color: "#3b82f6", coords: [77.1, 28.7] },
  karachi: { name: "Karachi", color: "#10b981", coords: [67.0, 24.8] },
  dhaka: { name: "Dhaka", color: "#f59e0b", coords: [90.4, 23.8] },
  nagpur: { name: "Nagpur", color: "#a855f7", coords: [79.1, 21.1] },
  kurnool: { name: "Kurnool", color: "#e11d48", coords: [78.03, 15.83] },
  guwahati: { name: "Guwahati", color: "#ec4899", coords: [91.73, 26.14] },
  lahore: { name: "Lahore", color: "#84cc16", coords: [74.35, 31.52] }
};

export const STATES: Partial<GeoNode>[] = [
  // --- India States (Standardized for GeoJSON ST_NM matching) ---
  { name: "Andhra Pradesh", coords: [79.74, 15.91], core: "kurnool" },
  { name: "Arunachal Pradesh", coords: [94.72, 28.21], core: "guwahati" },
  { name: "Assam", coords: [92.93, 26.2], core: "guwahati" },
  { name: "Bihar", coords: [85.31, 25.09], core: "dhaka" },
  { name: "Chhattisgarh", coords: [81.86, 21.27], core: "nagpur" },
  { name: "Goa", coords: [74.12, 15.29], core: "kurnool" },
  { name: "Gujarat", coords: [71.19, 22.25], core: "nagpur" },
  { name: "Haryana", coords: [76.08, 29.05], core: "delhi" },
  { name: "Himachal Pradesh", coords: [77.17, 31.1], core: "delhi" },
  { name: "Jharkhand", coords: [85.27, 23.61], core: "dhaka" },
  { name: "Karnataka", coords: [75.71, 15.31], core: "kurnool" },
  { name: "Kerala", coords: [76.27, 10.85], core: "kurnool" },
  { name: "Madhya Pradesh", coords: [78.65, 22.97], core: "nagpur" },
  { name: "Maharashtra", coords: [75.71, 19.75], core: "nagpur" },
  { name: "Manipur", coords: [93.9, 24.66], core: "guwahati" },
  { name: "Meghalaya", coords: [91.36, 25.46], core: "guwahati" },
  { name: "Mizoram", coords: [92.93, 23.16], core: "guwahati" },
  { name: "Nagaland", coords: [94.56, 26.15], core: "guwahati" },
  { name: "Odisha", coords: [85.09, 20.95], core: "nagpur" },
  { name: "Punjab", coords: [75.34, 31.14], core: "delhi" },
  { name: "Rajasthan", coords: [74.21, 27.02], core: "delhi" },
  { name: "Sikkim", coords: [88.51, 27.53], core: "guwahati" },
  { name: "Tamil Nadu", coords: [78.65, 11.12], core: "kurnool" },
  { name: "Telangana", coords: [79.01, 18.11], core: "kurnool" },
  { name: "Tripura", coords: [91.98, 23.94], core: "guwahati" },
  { name: "Uttar Pradesh", coords: [80.33, 26.84], core: "delhi" },
  { name: "Uttarakhand", coords: [79.01, 30.06], core: "delhi" },
  { name: "West Bengal", coords: [87.85, 23.16], core: "dhaka" },
  { name: "Jammu & Kashmir", coords: [74.79, 34.08], core: "lahore" },
  { name: "Kashmir West", coords: [73.8, 33.9], core: "lahore" },

  // --- External Regional States/Provinces ---
  { name: "Sindh", coords: [68.5, 25.5], core: "karachi" },
  { name: "Balochistan", coords: [66.5, 28.5], core: "karachi" },
  { name: "Khyber Pakhtunkhwa", coords: [71.5, 34.0], core: "lahore" },
  { name: "Punjab West", coords: [72.5, 31.0], core: "lahore" },
  { name: "Gilgit-Baltistan", coords: [74.5, 35.8], core: "lahore" },
  { name: "Nepal", coords: [84.1, 28.3], core: "guwahati" },
  { name: "Sri Lanka", coords: [80.7, 7.8], core: "nagpur" },
  { name: "Bangladesh", coords: [90.0, 23.7], core: "dhaka" },
  { name: "Bhutan", coords: [90.43, 27.51], core: "guwahati" },
  { name: "Maldives", coords: [73.5, 4.2], core: "nagpur" }
];

export const UTS: Partial<GeoNode>[] = [
  { name: "Andaman & Nicobar Island", coords: [92.65, 11.74], core: "nagpur" },
  { name: "Chandigarh", coords: [76.77, 30.73], core: "delhi" },
  { name: "Dadara & Nagar Havelli", coords: [73.02, 20.27], core: "delhi" },
  { name: "Daman & Diu", coords: [72.83, 20.41], core: "delhi" },
  { name: "Lakshadweep", coords: [72.64, 10.56], core: "nagpur" },
  { name: "NCT of Delhi", coords: [77.10, 28.61], core: "delhi" },
  { name: "Puducherry", coords: [79.80, 11.94], core: "nagpur" },
  { name: "Ladakh", coords: [77.57, 34.15], core: "delhi" },
  { name: "Male", coords: [73.51, 4.17], core: "nagpur" }
];

export const ALL_NODES: GeoNode[] = [
  ...STATES.map(s => ({ ...s, type: 'state' } as GeoNode)),
  ...UTS.map(u => ({ ...u, type: 'ut' } as GeoNode))
].sort((a, b) => a.name.localeCompare(b.name));
