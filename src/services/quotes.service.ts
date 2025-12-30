/**
 * Quotes Service
 * Fetches inspirational quotes from ZenQuotes API
 * API: https://zenquotes.io/api/quotes
 */

export interface Quote {
  q: string; // Quote text
  a: string; // Author
  c: string; // Character count
  h: string; // HTML formatted quote
}

const ZENQUOTES_API_URL = 'https://zenquotes.io/api/quotes';

export const quotesService = {
  /**
   * Fetch quotes from ZenQuotes API
   * Returns an array of quotes
   */
  async getQuotes(): Promise<Quote[]> {
    try {
      const response = await fetch(ZENQUOTES_API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch quotes: ${response.statusText}`);
      }
      const quotes: Quote[] = await response.json();
      return quotes;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      // Return fallback quotes if API fails
      return [
        {
          q: 'Embrace the journey. Every step forward is a victory.',
          a: 'Pause Collective',
          c: '60',
          h: '<blockquote>&ldquo;Embrace the journey. Every step forward is a victory.&rdquo; &mdash; <footer>Pause Collective</footer></blockquote>',
        },
        {
          q: 'The only way to do great work is to love what you do.',
          a: 'Steve Jobs',
          c: '58',
          h: '<blockquote>&ldquo;The only way to do great work is to love what you do.&rdquo; &mdash; <footer>Steve Jobs</footer></blockquote>',
        },
        {
          q: 'In the midst of chaos, there is also opportunity.',
          a: 'Sun Tzu',
          c: '49',
          h: '<blockquote>&ldquo;In the midst of chaos, there is also opportunity.&rdquo; &mdash; <footer>Sun Tzu</footer></blockquote>',
        },
      ];
    }
  },

  /**
   * Get 3 random quotes from the fetched quotes
   */
  async getDailyQuotes(): Promise<Quote[]> {
    const quotes = await this.getQuotes();
    // Shuffle and take first 3
    const shuffled = quotes.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  },
};


