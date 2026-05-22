import { BenefitCategory } from '../types';

interface MerchantEntry {
  keywords: string[];
  category: BenefitCategory;
  label: string;
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface MerchantSuggestion {
  name: string;
  category: BenefitCategory;
  label: string;
}

export function searchMerchants(input: string, limit = 6): MerchantSuggestion[] {
  const q = input.toLowerCase().trim();
  if (q.length < 2) return [];
  const results: MerchantSuggestion[] = [];
  for (const entry of MERCHANT_DATABASE) {
    for (const keyword of entry.keywords) {
      if (keyword.includes(q)) {
        results.push({ name: toTitleCase(entry.keywords[0]), category: entry.category, label: entry.label });
        break;
      }
    }
    if (results.length >= limit) break;
  }
  return results;
}

const MERCHANT_DATABASE: MerchantEntry[] = [
  // Dining
  { keywords: ['mcdonalds', 'mcdonald'], category: 'dining', label: 'Fast Food / Dining' },
  { keywords: ['starbucks'], category: 'dining', label: 'Coffee / Café' },
  { keywords: ['chipotle'], category: 'dining', label: 'Dining' },
  { keywords: ['subway'], category: 'dining', label: 'Fast Food / Dining' },
  { keywords: ['dunkin'], category: 'dining', label: 'Coffee / Café' },
  { keywords: ['dominos', "domino's"], category: 'dining', label: 'Dining' },
  { keywords: ["pizza hut"], category: 'dining', label: 'Dining' },
  { keywords: ["papa john", "papa johns"], category: 'dining', label: 'Dining' },
  { keywords: ['burger king'], category: 'dining', label: 'Fast Food / Dining' },
  { keywords: ['wendys', "wendy's"], category: 'dining', label: 'Fast Food / Dining' },
  { keywords: ['taco bell'], category: 'dining', label: 'Fast Food / Dining' },
  { keywords: ['chick-fil-a', 'chick fil a', 'chickfila'], category: 'dining', label: 'Fast Food / Dining' },
  { keywords: ['panera'], category: 'dining', label: 'Café / Dining' },
  { keywords: ['olive garden'], category: 'dining', label: 'Dining' },
  { keywords: ['applebees', "applebee's"], category: 'dining', label: 'Dining' },
  { keywords: ['outback'], category: 'dining', label: 'Dining' },
  { keywords: ['cheesecake factory'], category: 'dining', label: 'Dining' },
  { keywords: ['grubhub'], category: 'dining', label: 'Food Delivery' },
  { keywords: ['doordash', 'door dash'], category: 'dining', label: 'Food Delivery' },
  { keywords: ['ubereats', 'uber eats'], category: 'dining', label: 'Food Delivery' },
  { keywords: ['seamless'], category: 'dining', label: 'Food Delivery' },
  { keywords: ['instacart'], category: 'groceries', label: 'Grocery Delivery' },
  { keywords: ['postmates'], category: 'dining', label: 'Food Delivery' },

  // Groceries
  { keywords: ['whole foods', 'wholefoods'], category: 'groceries', label: 'Grocery' },
  { keywords: ['trader joe', "trader joe's"], category: 'groceries', label: 'Grocery' },
  { keywords: ['kroger'], category: 'groceries', label: 'Grocery' },
  { keywords: ['safeway'], category: 'groceries', label: 'Grocery' },
  { keywords: ['publix'], category: 'groceries', label: 'Grocery' },
  { keywords: ['wegmans'], category: 'groceries', label: 'Grocery' },
  { keywords: ['aldi'], category: 'groceries', label: 'Grocery' },
  { keywords: ['sprouts'], category: 'groceries', label: 'Grocery' },
  { keywords: ['meijer'], category: 'groceries', label: 'Grocery' },
  { keywords: ['heb', 'h-e-b'], category: 'groceries', label: 'Grocery' },
  { keywords: ['food lion'], category: 'groceries', label: 'Grocery' },
  { keywords: ['giant food', 'giant eagle'], category: 'groceries', label: 'Grocery' },
  { keywords: ['stop & shop', 'stop and shop'], category: 'groceries', label: 'Grocery' },
  { keywords: ['vons'], category: 'groceries', label: 'Grocery' },
  { keywords: ['albertsons'], category: 'groceries', label: 'Grocery' },
  { keywords: ['ralphs'], category: 'groceries', label: 'Grocery' },
  { keywords: ['harris teeter'], category: 'groceries', label: 'Grocery' },

  // Gas
  { keywords: ['shell'], category: 'gas', label: 'Gas Station' },
  { keywords: ['chevron'], category: 'gas', label: 'Gas Station' },
  { keywords: ['exxon', 'mobil', 'exxonmobil'], category: 'gas', label: 'Gas Station' },
  { keywords: ['bp '], category: 'gas', label: 'Gas Station' },
  { keywords: ['sunoco'], category: 'gas', label: 'Gas Station' },
  { keywords: ['marathon'], category: 'gas', label: 'Gas Station' },
  { keywords: ['speedway'], category: 'gas', label: 'Gas Station' },
  { keywords: ['circle k'], category: 'gas', label: 'Gas Station / Convenience' },
  { keywords: ['wawa'], category: 'gas', label: 'Gas Station / Convenience' },
  { keywords: ['sheetz'], category: 'gas', label: 'Gas Station / Convenience' },
  { keywords: ['casey'], category: 'gas', label: 'Gas Station / Convenience' },
  { keywords: ['7-eleven', '7 eleven', '7eleven'], category: 'gas', label: 'Convenience / Gas' },
  { keywords: ['racetrac'], category: 'gas', label: 'Gas Station' },
  { keywords: ['pilot flying j', 'pilot travel', 'flying j'], category: 'gas', label: 'Gas Station' },

  // Travel - Airlines
  { keywords: ['delta', 'delta air'], category: 'airlines', label: 'Airline' },
  { keywords: ['united airlines', 'united air'], category: 'airlines', label: 'Airline' },
  { keywords: ['american airlines', 'american air', 'aa.com'], category: 'airlines', label: 'Airline' },
  { keywords: ['southwest', 'southwest airlines'], category: 'airlines', label: 'Airline' },
  { keywords: ['jetblue'], category: 'airlines', label: 'Airline' },
  { keywords: ['alaska airlines', 'alaska air'], category: 'airlines', label: 'Airline' },
  { keywords: ['spirit airlines'], category: 'airlines', label: 'Airline' },
  { keywords: ['frontier airlines'], category: 'airlines', label: 'Airline' },
  { keywords: ['lufthansa'], category: 'airlines', label: 'Airline' },
  { keywords: ['british airways'], category: 'airlines', label: 'Airline' },

  // Travel - Hotels
  { keywords: ['marriott', 'westin', 'sheraton', 'w hotel', 'ritz-carlton', 'ritz carlton'], category: 'hotels', label: 'Hotel' },
  { keywords: ['hilton', 'hampton inn', 'doubletree', 'waldorf'], category: 'hotels', label: 'Hotel' },
  { keywords: ['hyatt', 'andaz', 'park hyatt'], category: 'hotels', label: 'Hotel' },
  { keywords: ['ihg', 'holiday inn', 'intercontinental', 'crowne plaza'], category: 'hotels', label: 'Hotel' },
  { keywords: ['best western'], category: 'hotels', label: 'Hotel' },
  { keywords: ['wyndham', 'days inn', 'super 8', 'la quinta'], category: 'hotels', label: 'Hotel' },
  { keywords: ['airbnb'], category: 'hotels', label: 'Lodging' },
  { keywords: ['vrbo'], category: 'hotels', label: 'Lodging' },

  // Travel - Booking
  { keywords: ['expedia'], category: 'travel', label: 'Travel Booking' },
  { keywords: ['booking.com', 'booking com'], category: 'travel', label: 'Travel Booking' },
  { keywords: ['priceline'], category: 'travel', label: 'Travel Booking' },
  { keywords: ['kayak'], category: 'travel', label: 'Travel Booking' },
  { keywords: ['hotels.com'], category: 'hotels', label: 'Hotel Booking' },
  { keywords: ['travelocity'], category: 'travel', label: 'Travel Booking' },
  { keywords: ['orbitz'], category: 'travel', label: 'Travel Booking' },

  // Transit
  { keywords: ['uber'], category: 'transit', label: 'Rideshare' },
  { keywords: ['lyft'], category: 'transit', label: 'Rideshare' },
  { keywords: ['mta', 'metro card', 'metrocard'], category: 'transit', label: 'Public Transit' },
  { keywords: ['amtrak'], category: 'transit', label: 'Rail' },
  { keywords: ['bird '], category: 'transit', label: 'Scooter / Transit' },
  { keywords: ['lime '], category: 'transit', label: 'Scooter / Transit' },
  { keywords: ['via transport'], category: 'transit', label: 'Transit' },

  // Streaming
  { keywords: ['netflix'], category: 'streaming', label: 'Streaming' },
  { keywords: ['spotify'], category: 'streaming', label: 'Streaming' },
  { keywords: ['hulu'], category: 'streaming', label: 'Streaming' },
  { keywords: ['disney+', 'disney plus'], category: 'streaming', label: 'Streaming' },
  { keywords: ['hbo max', 'max.com', 'hbomax'], category: 'streaming', label: 'Streaming' },
  { keywords: ['apple tv', 'apple tv+'], category: 'streaming', label: 'Streaming' },
  { keywords: ['amazon prime video', 'prime video'], category: 'streaming', label: 'Streaming' },
  { keywords: ['peacock'], category: 'streaming', label: 'Streaming' },
  { keywords: ['paramount+', 'paramount plus'], category: 'streaming', label: 'Streaming' },
  { keywords: ['youtube premium', 'youtube tv'], category: 'streaming', label: 'Streaming' },
  { keywords: ['tidal'], category: 'streaming', label: 'Streaming' },
  { keywords: ['apple music'], category: 'streaming', label: 'Streaming' },
  { keywords: ['sirius', 'siriusxm'], category: 'streaming', label: 'Streaming' },

  // Entertainment
  { keywords: ['amc theatres', 'amc theater', 'regal cinema', 'cinemark'], category: 'entertainment', label: 'Movie Theater' },
  { keywords: ['fandango'], category: 'entertainment', label: 'Movie Tickets' },
  { keywords: ['ticketmaster'], category: 'entertainment', label: 'Entertainment / Events' },
  { keywords: ['stubhub'], category: 'entertainment', label: 'Entertainment / Events' },
  { keywords: ['seat geek', 'seatgeek'], category: 'entertainment', label: 'Entertainment / Events' },
  { keywords: ['live nation'], category: 'entertainment', label: 'Entertainment / Events' },
  { keywords: ['comedy cellar', 'comedy club'], category: 'entertainment', label: 'Entertainment' },

  // Drugstore
  { keywords: ['cvs'], category: 'drugstore', label: 'Drugstore / Pharmacy' },
  { keywords: ['walgreens'], category: 'drugstore', label: 'Drugstore / Pharmacy' },
  { keywords: ['rite aid'], category: 'drugstore', label: 'Drugstore / Pharmacy' },
  { keywords: ['duane reade'], category: 'drugstore', label: 'Drugstore / Pharmacy' },

  // Online Shopping
  { keywords: ['amazon'], category: 'online_shopping', label: 'Online Retail' },
  { keywords: ['ebay'], category: 'online_shopping', label: 'Online Marketplace' },
  { keywords: ['etsy'], category: 'online_shopping', label: 'Online Marketplace' },
  { keywords: ['wayfair'], category: 'online_shopping', label: 'Online Retail' },
  { keywords: ['chewy'], category: 'online_shopping', label: 'Online Pet Supply' },

  // Wholesale
  { keywords: ['costco'], category: 'wholesale', label: 'Wholesale Club' },
  { keywords: ["sam's club", 'sams club'], category: 'wholesale', label: 'Wholesale Club' },
  { keywords: ["bj's wholesale", 'bjs wholesale', 'bj wholesale'], category: 'wholesale', label: 'Wholesale Club' },

  // Home Improvement
  { keywords: ['home depot'], category: 'home_improvement', label: 'Home Improvement' },
  { keywords: ["lowe's", 'lowes'], category: 'home_improvement', label: 'Home Improvement' },
  { keywords: ['menards'], category: 'home_improvement', label: 'Home Improvement' },
  { keywords: ['ace hardware'], category: 'home_improvement', label: 'Hardware / Home' },
];

// Keyword-based category inference fallback
const CATEGORY_KEYWORDS: { keywords: string[]; category: BenefitCategory; label: string }[] = [
  { keywords: ['restaurant', 'cafe', 'coffee', 'bar ', 'grill', 'bistro', 'kitchen', 'eatery', 'diner', 'sushi', 'pizza', 'burger', 'taco', 'bbq', 'steakhouse', 'deli', 'bakery', 'bagel'], category: 'dining', label: 'Dining' },
  { keywords: ['grocery', 'market', 'supermarket', 'food mart'], category: 'groceries', label: 'Grocery' },
  { keywords: ['gas', 'fuel', 'petrol', 'station'], category: 'gas', label: 'Gas Station' },
  { keywords: ['hotel', 'inn', 'motel', 'resort', 'lodge', 'suites'], category: 'hotels', label: 'Hotel' },
  { keywords: ['airline', 'air ', 'airways', 'aviation', 'flight'], category: 'airlines', label: 'Airline' },
  { keywords: ['travel', 'vacation', 'cruise', 'tour'], category: 'travel', label: 'Travel' },
  { keywords: ['transit', 'subway', 'bus ', 'train', 'rail', 'rideshare', 'taxi', 'cab '], category: 'transit', label: 'Transit' },
  { keywords: ['stream', 'music', 'podcast', 'subscription'], category: 'streaming', label: 'Streaming' },
  { keywords: ['theater', 'theatre', 'cinema', 'concert', 'event', 'ticket'], category: 'entertainment', label: 'Entertainment' },
  { keywords: ['pharmacy', 'drug', 'rx', 'health mart'], category: 'drugstore', label: 'Drugstore' },
  { keywords: ['hardware', 'home improvement', 'lumber', 'garden center'], category: 'home_improvement', label: 'Home Improvement' },
];

export function classifyMerchant(input: string): { category: BenefitCategory; label: string } {
  const normalized = input.toLowerCase().trim();

  // Exact/substring match against merchant database
  for (const entry of MERCHANT_DATABASE) {
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword)) {
        return { category: entry.category, label: entry.label };
      }
    }
  }

  // Keyword fallback
  for (const entry of CATEGORY_KEYWORDS) {
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword)) {
        return { category: entry.category, label: entry.label };
      }
    }
  }

  return { category: 'general', label: 'General Purchase' };
}
