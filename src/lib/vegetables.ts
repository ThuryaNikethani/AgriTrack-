/**
 * Vegetables grown in the Kurunduwatta polytunnel (from the Plant Identification
 * cards). Used to pre-fill new crops and to show a photo for each crop.
 *
 * daysToHarvest = typical days from planting to the first harvest. Adjust these
 * to match the polytunnel's own experience.
 */
export type Vegetable = {
  name: string;
  localName?: string;
  scientificName: string;
  image?: string;
  daysToHarvest: number;
};

export const VEGETABLES: Vegetable[] = [
  { name: "Tomato", localName: "Thakkali", scientificName: "Solanum lycopersicum", image: "/crops/tomato.jpg", daysToHarvest: 75 },
  { name: "Capsicum", localName: "Maalu miris", scientificName: "Capsicum annuum", image: "/crops/capsicum.jpg", daysToHarvest: 80 },
  { name: "Chilli", localName: "Amu miris", scientificName: "Capsicum annuum L.", image: "/crops/chilli.jpg", daysToHarvest: 85 },
  { name: "Nai miris", scientificName: "Capsicum chinense", image: "/crops/nai-miris.jpg", daysToHarvest: 100 },
  { name: "Cabbage", localName: "Gova", scientificName: "Brassica oleracea var. capitata", image: "/crops/cabbage.jpg", daysToHarvest: 80 },
  {
    name: "Red cabbage",
    localName: "Rathu gova",
    scientificName: "Brassica oleracea var. capitata f. rubra",
    image: "/crops/red-cabbage.jpg",
    daysToHarvest: 90,
  },
  { name: "Green beans", localName: "Bonchi", scientificName: "Phaseolus vulgaris L.", image: "/crops/green-beans.jpg", daysToHarvest: 55 },
  { name: "Radish", localName: "Raabu", scientificName: "Raphanus sativus", image: "/crops/radish.jpg", daysToHarvest: 40 },
  { name: "Carrot", scientificName: "Daucus carota subsp. sativus", image: "/crops/carrot.jpg", daysToHarvest: 80 },
  {
    name: "Spring onion",
    localName: "Luunu kola",
    scientificName: "Allium fistulosum",
    // Photo: "A Spring onions on the poly boxes" by Peachyeung316, CC BY-SA 4.0, Wikimedia Commons
    image: "/crops/spring-onion.jpg",
    daysToHarvest: 70,
  },
  { name: "Salad cucumber", localName: "Pipinja", scientificName: "Cucumis sativus", image: "/crops/salad-cucumber.jpg", daysToHarvest: 45 },
];

const norm = (s: string) => s.trim().toLowerCase();

/** Finds a catalogue vegetable by its English or local name (case-insensitive). */
export function findVegetable(name: string | null | undefined): Vegetable | undefined {
  if (!name) return undefined;
  const n = norm(name);
  return VEGETABLES.find((v) => norm(v.name) === n || (v.localName && norm(v.localName) === n));
}

export function vegetableLabel(v: Vegetable) {
  return v.localName ? `${v.name} (${v.localName})` : v.name;
}
