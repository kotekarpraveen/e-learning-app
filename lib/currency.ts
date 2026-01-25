
export interface Currency {
  code: string;
  symbol: string;
  rate: number;
  name: string;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1, name: 'US Dollar', locale: 'en-US' },
  { code: 'INR', symbol: '₹', rate: 84.5, name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound', locale: 'en-GB' },
  { code: 'AUD', symbol: 'A$', rate: 1.52, name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', rate: 1.36, name: 'Canadian Dollar', locale: 'en-CA' },
];

export const getCurrency = (): Currency => {
  if (typeof window === 'undefined') return CURRENCIES[0];
  const storedCode = localStorage.getItem('aelgo_currency');
  return CURRENCIES.find(c => c.code === storedCode) || CURRENCIES[0]; // Default USD
};

export const setCurrency = (code: string) => {
  localStorage.setItem('aelgo_currency', code);
  // Dispatch event for components that listen (though reload is often safer for global config)
  window.dispatchEvent(new Event('currency-change'));
};

/**
 * Formats a base USD amount into the selected currency.
 * @param amountInUSD The amount in USD (base currency of DB)
 * @returns Formatted string (e.g., "$10.00" or "₹845.00")
 */
export const formatPrice = (amountInUSD: number | string | undefined): string => {
  const numAmount = Number(amountInUSD) || 0;
  const currency = getCurrency();
  const convertedValue = numAmount * currency.rate;

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedValue);
  } catch (error) {
    // Fallback if locale is not supported
    return `${currency.symbol}${convertedValue.toFixed(2)}`;
  }
};

/**
 * Returns the raw converted value without formatting
 */
export const convertPrice = (amountInUSD: number): number => {
    const currency = getCurrency();
    return amountInUSD * currency.rate;
};
