export type Nutrient = "Nitrogen" | "Phosphorus" | "Potassium" | "All-round"

export type OrganicFertilizer = {
  id: string
  name: string
  nutrients: Nutrient[]
  summary: string
  ingredients: string[]
  steps: string[]
  use: string
  caution: string
}

export const NUTRIENT_FILTERS = ["All", "Nitrogen", "Phosphorus", "Potassium", "All-round"] as const

export const KVK_NOTE =
  "Amounts and recipes vary between regions and farming guides. These are commonly used traditional amounts. Please confirm the exact amounts for your crop and soil with your nearest Krishi Vigyan Kendra (KVK) or agriculture office."

export const ORGANIC_FERTILIZERS: OrganicFertilizer[] = [
  {
    id: "compost",
    name: "Compost",
    nutrients: ["All-round"],
    summary: "Rotted farm and kitchen waste. Feeds the soil slowly and helps it hold water.",
    ingredients: [
      "Dry material: straw, dry leaves, crop residue",
      "Green material: grass, vegetable waste, weeds (without seeds)",
      "Cow dung slurry (a few buckets)",
      "Water",
    ],
    steps: [
      "Pick a shaded, well-drained spot and mark a pit or heap about 1 metre wide and 1 metre high.",
      "Spread a 15 cm layer of dry material, then a 15 cm layer of green material, then sprinkle cow dung slurry on top.",
      "Repeat the layers until the heap is full, then cover it with straw or a gunny sack.",
      "Keep it as damp as a squeezed sponge. Turn it every 2 weeks so air reaches all parts.",
      "After 2–3 months it turns dark and crumbly and smells like fresh earth. It is ready.",
    ],
    use: "Mix 2–4 tonnes per acre into the soil about 2 weeks before sowing.",
    caution: "Do not add meat, oily food, diseased plants or plastic.",
  },
  {
    id: "vermicompost",
    name: "Vermicompost",
    nutrients: ["All-round"],
    summary: "Compost made by earthworms. Rich in nutrients and gentle on roots.",
    ingredients: [
      "Cow dung and farm waste, left to partly rot for 2–3 weeks",
      "Earthworms (red worms) from your KVK or a nearby farmer",
      "Straw or a gunny sack for cover",
      "Water",
    ],
    steps: [
      "Make a shaded bed or tank about 1 metre wide and 30–45 cm deep. The length can be as you like.",
      "Lay a thin base of coconut husk or straw so extra water can drain out.",
      "Fill with the partly rotted dung and waste, then add earthworms at the rate your supplier advises.",
      "Cover with a gunny sack or straw. Sprinkle water daily to keep it damp but never soggy.",
      "After 45–60 days it looks dark and loose and has no smell. Stop watering for 2 days, then sieve it.",
    ],
    use: "Spread 1–2 tonnes per acre near the plant roots, or mix into the soil before sowing.",
    caution: "Keep the bed out of direct sun and away from ants. Do not add fresh dung, it is too hot for the worms.",
  },
  {
    id: "fym",
    name: "Farmyard manure (FYM)",
    nutrients: ["All-round"],
    summary: "Well-rotted cow or buffalo dung mixed with bedding. A traditional all-round manure.",
    ingredients: ["Cow or buffalo dung", "Urine-soaked bedding, straw and leftover fodder"],
    steps: [
      "Dig a pit about 2 metres long, 1 metre wide and 1 metre deep in a shaded spot, away from the well.",
      "Add dung and bedding to the pit daily, in layers.",
      "When the pit is full, seal the top with a layer of mud and dung.",
      "Leave it for 3–4 months. It is ready when it is dark brown and crumbly, and no longer smells like fresh dung.",
    ],
    use: "Apply 4–5 tonnes per acre, 2–3 weeks before sowing, and mix it well into the soil.",
    caution: "Use only well-rotted manure. Fresh dung can burn roots and brings weed seeds and termites.",
  },
  {
    id: "green-manure",
    name: "Green manure",
    nutrients: ["Nitrogen"],
    summary: "Fast-growing crops ploughed back into the soil. Adds nitrogen and organic matter cheaply.",
    ingredients: [
      "Seed of dhaincha or sunnhemp (ask your seed shop for the local seed rate)",
      "Moist soil or good rain",
    ],
    steps: [
      "Sow dhaincha or sunnhemp thickly before the main crop season, when the soil is moist.",
      "Let it grow for about 40–50 days, until it begins to flower and is still soft.",
      "Plough it into the soil while it is green.",
      "Keep the soil damp for 7–10 days so it rots, then sow your main crop.",
    ],
    use: "Grow it on the field itself, once before the main crop season.",
    caution: "Do not let the plants go to seed or turn woody. Woody plants rot slowly and tie up nitrogen.",
  },
  {
    id: "jeevamrut",
    name: "Jeevamrut",
    nutrients: ["All-round"],
    summary: "A fermented liquid that feeds soil microbes. Made from cow dung, urine, jaggery and pulse flour.",
    ingredients: [
      "10 kg cow dung (traditional recipes use native desi cows)",
      "10 litres cow urine",
      "1–2 kg jaggery",
      "1–2 kg pulse flour (besan)",
      "A handful of soil from your field bund",
      "200 litres of water in a plastic or cement drum",
    ],
    steps: [
      "Put all the ingredients into the drum with the water and mix.",
      "Stir clockwise for a few minutes, twice a day (morning and evening).",
      "Keep the drum in the shade, covered with a cloth, for 2–3 days.",
      "Use it within 7 days of making it.",
    ],
    use: "200 litres is enough for 1 acre. Add it to the irrigation water once or twice a month, or filter and spray it diluted with water.",
    caution: "Make it fresh. Do not store it for weeks.",
  },
  {
    id: "beejamrut",
    name: "Beejamrut (seed treatment)",
    nutrients: [],
    summary: "A coating for seeds before sowing. Protects young seedlings from soil diseases.",
    ingredients: [
      "5 kg cow dung",
      "5 litres cow urine",
      "50 g lime (chuna)",
      "A handful of soil",
      "20 litres of water",
    ],
    steps: [
      "Tie the dung in a cloth and hang it in the water overnight.",
      "Squeeze the cloth bag well into the water. Add the urine, lime and soil, and stir.",
      "Coat the seeds with this mixture and mix gently by hand.",
      "Dry the seeds in the shade and sow them the same day or the next morning.",
    ],
    use: "This amount treats about 100 kg of seed. Make less for smaller quantities.",
    caution: "Do not dry the treated seeds in direct sun.",
  },
  {
    id: "panchagavya",
    name: "Panchagavya",
    nutrients: ["All-round"],
    summary: "A fermented spray made from five cow products. Used as a growth booster.",
    ingredients: [
      "5 kg fresh cow dung",
      "1 kg cow ghee",
      "3 litres cow urine",
      "2 litres cow milk",
      "2 litres curd",
      "3 litres tender coconut water",
      "500 g jaggery",
      "12 ripe bananas, mashed",
      "10 litres of water",
    ],
    steps: [
      "Mix the dung and ghee well and keep it for 3 days, stirring once a day.",
      "On day 4, add the urine and water and mix. Then add all the other ingredients and stir.",
      "Keep it in a covered drum in the shade for 15–20 days. Stir clockwise twice a day.",
      "When it smells sweet and sour, like fermented fruit, it is ready. Filter it through a cloth.",
    ],
    use: "Spray a 3% mix (300 ml in 10 litres of water) on the leaves every 15 days, or add it to the irrigation water.",
    caution: "Spray in the early morning or evening, not in hot midday sun.",
  },
  {
    id: "neem-cake",
    name: "Neem cake",
    nutrients: ["Nitrogen"],
    summary: "Pressed neem seed leftovers. Gives nitrogen and also keeps termites and soil worms away.",
    ingredients: ["Neem cake (buy from an agri shop or oil mill)"],
    steps: [
      "Break up any lumps and crush it into a coarse powder.",
      "Mix it with compost or FYM so it spreads more evenly.",
      "Spread it over the field before the last ploughing and mix it into the soil.",
    ],
    use: "About 100–200 kg per acre, once before sowing.",
    caution: "Buy fresh, pure neem cake. Old or mixed cake loses its effect.",
  },
  {
    id: "wood-ash",
    name: "Wood ash",
    nutrients: ["Potassium"],
    summary: "Ash from clean wood fires. A cheap source of potassium and calcium.",
    ingredients: ["Ash from burnt clean wood or crop residue (no plastic, paint or treated wood)"],
    steps: [
      "Collect the ash when it is completely cold and sieve out stones and charcoal pieces.",
      "Keep it dry in a covered container. Rain washes the potash away.",
      "Spread a thin, even layer over the soil and rake it in.",
    ],
    use: "About 100–200 kg per acre, or a small handful per square metre in vegetable beds, once a season.",
    caution:
      "Ash makes soil more alkaline, so skip it on soil that is already salty or alkaline. Keep it off young stems, and do not mix it with urea or fresh manure.",
  },
  {
    id: "bone-meal",
    name: "Bone meal",
    nutrients: ["Phosphorus"],
    summary: "Ground animal bones. A slow-release source of phosphorus for roots and flowering.",
    ingredients: ["Steamed bone meal (buy from an agri shop)"],
    steps: [
      "Choose steamed bone meal, not raw bone meal, from a trusted shop.",
      "Mix it into the soil or compost before sowing so it sits close to the roots.",
      "Water well after mixing.",
    ],
    use: "About 40–80 kg per acre, once before sowing. It works slowly through the season.",
    caution: "Works best on slightly acidic to neutral soil. Cover it well, since dogs and other animals dig for it.",
  },
  {
    id: "rhizobium-azotobacter",
    name: "Rhizobium & Azotobacter",
    nutrients: ["Nitrogen"],
    summary: "Helpful bacteria sold as a powder. They take nitrogen from the air and give it to the crop.",
    ingredients: [
      "Rhizobium culture for pulses and groundnut, or Azotobacter / Azospirillum for cereals and vegetables (buy from your KVK or agriculture university)",
      "Jaggery or cooked rice water as a sticker",
      "Clean water",
    ],
    steps: [
      "Boil a little jaggery in water and let it cool fully to make a sticky solution.",
      "Mix the culture packet, as per its label, with the cool solution.",
      "Mix it with the seeds so each seed gets a thin coating. Dry in the shade for 20–30 minutes.",
      "Sow the same day.",
    ],
    use: "Use the amount printed on the packet for your seed quantity.",
    caution: "Check the expiry date. Keep packets cool, and do not mix with chemical seed treatments or fungicides.",
  },
  {
    id: "psb",
    name: "Phosphate-solubilising bacteria (PSB)",
    nutrients: ["Phosphorus"],
    summary: "Bacteria that release phosphorus locked in the soil so the crop can use it.",
    ingredients: [
      "PSB culture (buy from your KVK or agriculture university)",
      "About 50 kg of compost or FYM",
      "Water",
    ],
    steps: [
      "Mix the PSB culture with the compost and sprinkle a little water to make it damp.",
      "Keep it covered in the shade overnight (8–12 hours).",
      "Spread it over the field and mix it into the soil. Or coat the seeds the same way as Rhizobium.",
    ],
    use: "Use the amount printed on the packet per acre.",
    caution: "Check the expiry date. Keep it out of the sun, and do not mix it with chemical fertilizer in the same drum.",
  },
]

// Which organic options to suggest for each fertilizer the model can recommend.
const ALTERNATIVES: Record<string, string[]> = {
  urea: ["green-manure", "vermicompost", "jeevamrut"],
  dap: ["bone-meal", "psb", "vermicompost"],
  "28-28": ["vermicompost", "bone-meal", "compost"],
  "14-35-14": ["bone-meal", "psb", "vermicompost"],
  "20-20": ["vermicompost", "compost", "bone-meal"],
  "17-17-17": ["compost", "vermicompost", "fym"],
  "15-15-15": ["compost", "vermicompost", "fym"],
  "14-14-14": ["compost", "vermicompost", "fym"],
  "10-10-10": ["compost", "vermicompost", "fym"],
  "10-26-26": ["bone-meal", "wood-ash", "compost"],
  tsp: ["bone-meal", "psb"],
  superphosphate: ["bone-meal", "psb"],
  "potassium sulfate": ["wood-ash", "compost"],
  "potassium sulphate": ["wood-ash", "compost"],
  "potassium chloride": ["wood-ash", "compost"],
}

export function getOrganicAlternatives(fertilizerName: string): OrganicFertilizer[] {
  const key = fertilizerName.toLowerCase().replace(/\.$/, "").trim()
  const ids = ALTERNATIVES[key] ?? ["compost", "vermicompost"]
  return ids
    .map((id) => ORGANIC_FERTILIZERS.find((f) => f.id === id))
    .filter((f): f is OrganicFertilizer => Boolean(f))
}
