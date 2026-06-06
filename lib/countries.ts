import type { Country } from "./types";

/**
 * Qualified / host nations for the 2026 tournament. Each will eventually get
 * its own themed mini-store (see /countries). Accent drives per-country theming.
 */
export const countries: Country[] = [
  { code: "USA", name: "United States", flag: "🇺🇸", group: "A", host: true, accent: "#3c3b6e" },
  { code: "MEX", name: "Mexico", flag: "🇲🇽", group: "A", host: true, accent: "#006847" },
  { code: "CAN", name: "Canada", flag: "🇨🇦", group: "B", host: true, accent: "#d52b1e" },
  { code: "BRA", name: "Brazil", flag: "🇧🇷", group: "C", accent: "#009c3b" },
  { code: "ARG", name: "Argentina", flag: "🇦🇷", group: "C", accent: "#74acdf" },
  { code: "FRA", name: "France", flag: "🇫🇷", group: "D", accent: "#0055a4" },
  { code: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "D", accent: "#cf142b" },
  { code: "ESP", name: "Spain", flag: "🇪🇸", group: "E", accent: "#c60b1e" },
  { code: "GER", name: "Germany", flag: "🇩🇪", group: "E", accent: "#dd0000" },
  { code: "POR", name: "Portugal", flag: "🇵🇹", group: "F", accent: "#006600" },
  { code: "NED", name: "Netherlands", flag: "🇳🇱", group: "F", accent: "#ae1c28" },
  { code: "JPN", name: "Japan", flag: "🇯🇵", group: "G", accent: "#bc002d" },
  { code: "KOR", name: "South Korea", flag: "🇰🇷", group: "G", accent: "#003478" },
  { code: "MAR", name: "Morocco", flag: "🇲🇦", group: "H", accent: "#c1272d" },
  { code: "CRO", name: "Croatia", flag: "🇭🇷", group: "H", accent: "#171796" },
  { code: "BEL", name: "Belgium", flag: "🇧🇪", group: "I", accent: "#ef3340" },
  { code: "URU", name: "Uruguay", flag: "🇺🇾", group: "I", accent: "#7b9fd4" },
  { code: "ITA", name: "Italy", flag: "🇮🇹", group: "J", accent: "#0066a6" },
  { code: "COL", name: "Colombia", flag: "🇨🇴", group: "J", accent: "#fcd116" },
  { code: "SEN", name: "Senegal", flag: "🇸🇳", group: "K", accent: "#00853f" },
];

export const hostCountries = countries.filter((c) => c.host);

export function getCountry(code: string): Country | undefined {
  return countries.find((c) => c.code.toLowerCase() === code.toLowerCase());
}
