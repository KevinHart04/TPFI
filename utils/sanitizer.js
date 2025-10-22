/**
 * Escapes HTML entities in a string to prevent XSS attacks.
 * @param {string} text - The string to escape.
 * @returns {string} The escaped string.
 */
export const escapeHtml = (text) => {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  // Replace characters with their HTML escaped equivalents
  return text.replace(/[&<>"']/g, m => map[m]);
};