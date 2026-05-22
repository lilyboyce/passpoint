// Drop your card images into assets/cards/ using the filename {templateId}.png
// Then uncomment the corresponding line below and the image will appear in the card row.

const images: Record<string, any> = {
  // chase_sapphire_reserve:          require('../../assets/cards/chase_sapphire_reserve.png'),
  // chase_sapphire_preferred:        require('../../assets/cards/chase_sapphire_preferred.png'),
  // chase_freedom_unlimited:         require('../../assets/cards/chase_freedom_unlimited.png'),
  // chase_freedom_flex:              require('../../assets/cards/chase_freedom_flex.png'),
  // amex_gold:                       require('../../assets/cards/amex_gold.png'),
  // amex_platinum:                   require('../../assets/cards/amex_platinum.png'),
  // amex_blue_cash_preferred:        require('../../assets/cards/amex_blue_cash_preferred.png'),
  // capital_one_venture_x:           require('../../assets/cards/capital_one_venture_x.png'),
  // citi_double_cash:                require('../../assets/cards/citi_double_cash.png'),
  // discover_it:                     require('../../assets/cards/discover_it.png'),
  // bank_of_america_premium_rewards: require('../../assets/cards/bank_of_america_premium_rewards.png'),
  // wells_fargo_active_cash:         require('../../assets/cards/wells_fargo_active_cash.png'),
  // delta_amex_platinum:             require('../../assets/cards/delta_amex_platinum.png'),
  // apple_card:                      require('../../assets/cards/apple_card.png'),
  // chase_southwest_priority:        require('../../assets/cards/chase_southwest_priority.png'),
  // chase_amazon_prime:              require('../../assets/cards/chase_amazon_prime.png'),
};

export function getCardImage(templateId: string): any {
  return images[templateId] ?? null;
}
