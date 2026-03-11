// Helper function to convert spoken words to numbers
function parseSpokenNumbers(text) {
  if (!text) return "";
  const wordsToNumbers = {
    'zero': '0', 'oh': '0',
    'one': '1', 'won': '1',
    'two': '2', 'to': '2', 'too': '2',
    'three': '3', 'tree': '3',
    'four': '4', 'for': '4',
    'five': '5',
    'six': '6',
    'seven': '7',
    'eight': '8', 'ate': '8',
    'nine': '9',
    'ten': '10'
  };
  
  // Replace spoken words with digits
  let processed = text.toLowerCase();
  for (const [word, digit] of Object.entries(wordsToNumbers)) {
    // using regex boundary to replace whole words
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    processed = processed.replace(regex, digit);
  }
  
  // Finally, strip all non-alphanumeric characters (spaces, punctuation) and make uppercase
  // This ensures things like "23 b127" become "23B127"
  return processed.replace(/[^a-z0-9]/ig, '').toUpperCase();
}

module.exports = {
  parseSpokenNumbers
};
