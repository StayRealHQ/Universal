import { parsePhoneNumber, formatIncompletePhoneNumber, getCountryCallingCode } from 'libphonenumber-js';

/**
 * Formats a phone number to international format as the user types
 * @param input - The raw phone number input from the user
 * @param country - Optional country code to assist with parsing (defaults to user's region)
 * @returns Formatted phone number string
 */
export const formatPhoneNumberAsYouType = (input: string, country?: string): string => {
  // Remove all non-digit characters except +
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // If the input is empty or just +, return it as is
  if (!cleaned || cleaned === '+') {
    return cleaned;
  }

  try {
    // Use formatIncompletePhoneNumber for real-time formatting
    return formatIncompletePhoneNumber(cleaned, country as any);
  } catch (error) {
    // If parsing fails, return the cleaned input
    return cleaned;
  }
};

/**
 * Converts a phone number to international format (+XXXXXXXXXXXX)
 * @param phoneNumber - The phone number to convert
 * @param defaultCountry - Default country code if the number doesn't have a country code
 * @returns International format phone number or null if invalid
 */
export const toInternationalFormat = (phoneNumber: string, defaultCountry?: string): string | null => {
  try {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    if (!cleaned) {
      return null;
    }

    // Try to parse the phone number
    const parsed = parsePhoneNumber(cleaned, defaultCountry as any);
    
    if (parsed && parsed.isValid()) {
      return parsed.format('E.164'); // International format: +XXXXXXXXXXXX
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Validates if a phone number is valid
 * @param phoneNumber - The phone number to validate
 * @param defaultCountry - Default country code if the number doesn't have a country code
 * @returns true if the phone number is valid
 */
export const isValidPhoneNumber = (phoneNumber: string, defaultCountry?: string): boolean => {
  try {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    const parsed = parsePhoneNumber(cleaned, defaultCountry as any);
    return parsed ? parsed.isValid() : false;
  } catch (error) {
    return false;
  }
};

/**
 * Gets the user's country code from their locale
 * @returns Country code string (e.g., 'US', 'FR', 'GB')
 */
export const getUserCountryCode = (): string | undefined => {
  try {
    // Try to get country from browser locale
    const locale = navigator.language || 'en-US';
    const region = new Intl.Locale(locale).region;
    return region;
  } catch (error) {
    // Fallback to undefined if we can't determine the country
    return undefined;
  }
};

/**
 * Auto-detects and formats a phone number to international format
 * This is the main function to use for the authentication feature
 * @param input - Raw phone number input
 * @returns Formatted international phone number or the original input if formatting fails
 */
export const autoFormatToInternational = (input: string): string => {
  // If input already has international format, clean and return it
  if (input.startsWith('+')) {
    const international = toInternationalFormat(input);
    return international || input.replace(/[^\d+]/g, '');
  }
  
  // Try with user's country code first
  const userCountry = getUserCountryCode();
  let international = toInternationalFormat(input, userCountry);
  
  // If that fails and user country is available, try some common fallbacks
  if (!international && userCountry) {
    // Try with common country codes as fallbacks
    const fallbackCountries = ['US', 'FR', 'GB', 'DE', 'ES', 'IT'];
    for (const country of fallbackCountries) {
      if (country !== userCountry) {
        international = toInternationalFormat(input, country);
        if (international) break;
      }
    }
  }
  
  // Return the international format if successful, otherwise return the cleaned input
  return international || input.replace(/[^\d+]/g, '');
};