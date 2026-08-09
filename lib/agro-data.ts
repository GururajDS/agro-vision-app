export const SOIL_TYPES = ["Sandy", "Loamy", "Black", "Red", "Clayey"] as const

export const CROP_TYPES = [
  "Maize",
  "Sugarcane",
  "Cotton",
  "Tobacco",
  "Paddy",
  "Barley",
  "Wheat",
  "Millets",
  "Oil seeds",
  "Pulses",
  "Ground Nuts",
] as const

// Placeholder crop pool used to fake a "recommendation" from the inputs.
export const CROP_POOL = [
  "Rice",
  "Maize",
  "Chickpea",
  "Kidney Beans",
  "Pigeon Peas",
  "Moth Beans",
  "Mung Bean",
  "Black Gram",
  "Lentil",
  "Pomegranate",
  "Banana",
  "Mango",
  "Grapes",
  "Watermelon",
  "Muskmelon",
  "Apple",
  "Orange",
  "Papaya",
  "Coconut",
  "Cotton",
  "Jute",
  "Coffee",
]

export const FERTILIZER_POOL = [
  "Urea",
  "DAP",
  "14-35-14",
  "28-28",
  "17-17-17",
  "20-20",
  "10-26-26",
]

export type WeatherInfo = {
  location: string
  temperature: number
  humidity: number
  condition: string
  windKph: number
  feelsLike: number
}

export const SAMPLE_WEATHER: Record<string, WeatherInfo> = {
  "nashik": {
    location: "Nashik, Maharashtra",
    temperature: 29,
    humidity: 62,
    condition: "Partly Cloudy",
    windKph: 12,
    feelsLike: 31,
  },
  "default": {
    location: "Nashik, Maharashtra",
    temperature: 29,
    humidity: 62,
    condition: "Partly Cloudy",
    windKph: 12,
    feelsLike: 31,
  },
}

export type Commodity = {
  name: string
  price: number
  unit: string
  market: string
  trend: "up" | "down" | "flat"
}

export const COMMODITIES: Commodity[] = [
  { name: "Wheat", price: 2415, unit: "quintal", market: "Nashik, MH", trend: "up" },
  { name: "Rice (Basmati)", price: 4120, unit: "quintal", market: "Karnal, HR", trend: "up" },
  { name: "Maize", price: 1980, unit: "quintal", market: "Davangere, KA", trend: "down" },
  { name: "Cotton", price: 7350, unit: "quintal", market: "Rajkot, GJ", trend: "flat" },
  { name: "Soybean", price: 4680, unit: "quintal", market: "Indore, MP", trend: "up" },
  { name: "Sugarcane", price: 340, unit: "quintal", market: "Kolhapur, MH", trend: "flat" },
  { name: "Onion", price: 1450, unit: "quintal", market: "Lasalgaon, MH", trend: "down" },
  { name: "Tomato", price: 2200, unit: "quintal", market: "Kolar, KA", trend: "up" },
  { name: "Potato", price: 1180, unit: "quintal", market: "Agra, UP", trend: "down" },
  { name: "Groundnut", price: 6250, unit: "quintal", market: "Junagadh, GJ", trend: "up" },
  { name: "Turmeric", price: 13800, unit: "quintal", market: "Nizamabad, TS", trend: "up" },
  { name: "Chilli (Dry)", price: 18500, unit: "quintal", market: "Guntur, AP", trend: "flat" },
]
// Default NPK starting values by soil type (kg/ha).
// These are general starting estimates — farmers can edit them manually.
export const SOIL_NPK_DEFAULTS: Record<(typeof SOIL_TYPES)[number], { N: number; P: number; K: number }> = {
  Sandy: { N: 40, P: 15, K: 60 },
  Loamy: { N: 80, P: 40, K: 120 },
  Black: { N: 50, P: 20, K: 180 },
  Red: { N: 45, P: 20, K: 100 },
  Clayey: { N: 70, P: 35, K: 150 },
}
// Average national crop yield, in kg per acre (converted from govt. hectare data).
// These are general estimates — real yield varies by region, irrigation, and practices.
export const CROP_YIELD_PER_ACRE: Record<string, number> = {
  Rice: 1130,
  Paddy: 1130,
  Wheat: 1415,
  Barley: 1090,
  Maize: 1295,
  Millets: 485,
  Cotton: 175,
  Sugarcane: 32000,
  Tobacco: 690,
  "Ground Nuts": 610,
  "Oil Seeds": 525,
  Pulses: 325,
  Kidneybeans: 325,
  Coffee: 365,
  Orange: 4450,
  Pomegranate: 3640,
  Watermelon: 8905,
}
