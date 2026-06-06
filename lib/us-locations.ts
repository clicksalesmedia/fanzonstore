// US states + major cities for the checkout address dropdowns.
// Country is fixed to the United States ("US"); `region` carries the state code.
// City lists are the most populous/common per state — the checkout UI also
// offers an "Other…" escape hatch so any real city can still be entered.

export const US_COUNTRY = { code: "US", name: "United States" } as const;

export interface USState {
  code: string;
  name: string;
}

export const US_STATES: USState[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const US_STATE_NAMES: Record<string, string> = Object.fromEntries(
  US_STATES.map((s) => [s.code, s.name]),
);

/** Major cities per state code. Not exhaustive — UI provides an "Other…" option. */
export const US_CITIES: Record<string, string[]> = {
  AL: ["Birmingham", "Montgomery", "Huntsville", "Mobile", "Tuscaloosa", "Auburn", "Hoover"],
  AK: ["Anchorage", "Fairbanks", "Juneau", "Wasilla", "Sitka", "Ketchikan"],
  AZ: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe", "Peoria", "Flagstaff"],
  AR: ["Little Rock", "Fayetteville", "Fort Smith", "Springdale", "Jonesboro", "Conway", "Bentonville"],
  CA: ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Santa Ana", "Riverside", "Irvine", "Stockton", "Chula Vista"],
  CO: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Boulder", "Thornton", "Pueblo"],
  CT: ["Bridgeport", "New Haven", "Stamford", "Hartford", "Waterbury", "Norwalk", "Danbury"],
  DE: ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"],
  DC: ["Washington"],
  FL: ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral", "Pembroke Pines"],
  GA: ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Macon", "Roswell", "Sandy Springs", "Marietta"],
  HI: ["Honolulu", "Hilo", "Kailua", "Kapolei", "Kaneohe", "Pearl City"],
  ID: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello", "Caldwell", "Coeur d'Alene"],
  IL: ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield", "Elgin", "Peoria", "Champaign"],
  IN: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond"],
  IA: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Waterloo", "Ames"],
  KS: ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "Lawrence", "Shawnee"],
  KY: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Frankfort"],
  LA: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Metairie", "Kenner"],
  ME: ["Portland", "Lewiston", "Bangor", "Augusta", "South Portland", "Auburn"],
  MD: ["Baltimore", "Columbia", "Germantown", "Silver Spring", "Annapolis", "Rockville", "Frederick", "Gaithersburg"],
  MA: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton", "Quincy", "Newton", "Somerville"],
  MI: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor", "Lansing", "Flint", "Dearborn", "Livonia"],
  MN: ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth"],
  MS: ["Jackson", "Gulfport", "Southaven", "Biloxi", "Hattiesburg", "Meridian", "Tupelo"],
  MO: ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon"],
  MT: ["Billings", "Missoula", "Great Falls", "Bozeman", "Helena", "Kalispell"],
  NE: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont"],
  NV: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City"],
  NH: ["Manchester", "Nashua", "Concord", "Dover", "Rochester", "Salem"],
  NJ: ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton", "Clifton", "Edison", "Camden"],
  NM: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "Farmington"],
  NY: ["New York", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady"],
  NC: ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "Asheville"],
  ND: ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Mandan"],
  OH: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton"],
  OK: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond", "Lawton", "Stillwater"],
  OR: ["Portland", "Salem", "Eugene", "Gresham", "Hillsboro", "Beaverton", "Bend", "Medford"],
  PA: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg"],
  RI: ["Providence", "Cranston", "Warwick", "Pawtucket", "East Providence", "Woonsocket", "Newport"],
  SC: ["Columbia", "Charleston", "North Charleston", "Mount Pleasant", "Rock Hill", "Greenville", "Myrtle Beach"],
  SD: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Pierre"],
  TN: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin"],
  TX: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Irving", "Garland", "Frisco", "McKinney"],
  UT: ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "Ogden", "St. George"],
  VT: ["Burlington", "South Burlington", "Rutland", "Montpelier", "Essex", "Bennington"],
  VA: ["Virginia Beach", "Chesapeake", "Norfolk", "Richmond", "Arlington", "Newport News", "Alexandria", "Roanoke"],
  WA: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Olympia"],
  WV: ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling", "Martinsburg"],
  WI: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Eau Claire"],
  WY: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Jackson"],
};

export function citiesForState(code: string): string[] {
  return US_CITIES[code] ?? [];
}
