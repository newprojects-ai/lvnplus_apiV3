import { customAlphabet } from 'nanoid';

// Create a custom alphabet for generating codes
// Using only uppercase letters and numbers for better readability
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CODE_LENGTH = 8;

// Create a nanoid generator with our custom alphabet
const nanoid = customAlphabet(ALPHABET, CODE_LENGTH);

/**
 * Generates a unique code for linking students with guardians
 * Format: XXXX-XXXX where X is a character from the alphabet
 * @returns {string} The generated code
 */
export function generateLinkCode(): string {
  const code = nanoid();
  // Insert a hyphen in the middle for better readability
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
