import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { quotesService, Quote } from '../services/quotes.service';

const QUOTES_STORAGE_KEY = '@pause_daily_quotes';
const QUOTES_DATE_KEY = '@pause_quotes_date';

/**
 * Hook to manage daily quotes
 * Fetches new quotes once per day and stores them in AsyncStorage
 */
export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTodayDateString = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  };

  const loadQuotes = async () => {
    try {
      setIsLoading(true);
      const storedDate = await AsyncStorage.getItem(QUOTES_DATE_KEY);
      const todayDate = getTodayDateString();

      // Check if we have quotes for today
      if (storedDate === todayDate) {
        // Load stored quotes
        const storedQuotes = await AsyncStorage.getItem(QUOTES_STORAGE_KEY);
        if (storedQuotes) {
          const parsedQuotes: Quote[] = JSON.parse(storedQuotes);
          // Ensure we have at least 3 quotes
          const quotesToSet = parsedQuotes.length >= 3 ? parsedQuotes.slice(0, 3) : parsedQuotes;
          setQuotes(quotesToSet);
          setIsLoading(false);
          return;
        }
      }

      // Fetch new quotes for today
      const newQuotes = await quotesService.getDailyQuotes();
      // Ensure we have at least 3 quotes
      const quotesToSet = newQuotes.length >= 3 ? newQuotes.slice(0, 3) : newQuotes;
      setQuotes(quotesToSet);

      // Store quotes and date
      await AsyncStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(newQuotes));
      await AsyncStorage.setItem(QUOTES_DATE_KEY, todayDate);
    } catch (error) {
      console.error('Error loading quotes:', error);
      // Set fallback quotes (always 3 quotes)
      setQuotes([
        {
          q: 'Embrace the journey. Every step forward is a victory.',
          a: 'Pause Collective',
          c: '60',
          h: '',
        },
        {
          q: 'The only way to do great work is to love what you do.',
          a: 'Steve Jobs',
          c: '58',
          h: '',
        },
        {
          q: 'In the midst of chaos, there is also opportunity.',
          a: 'Sun Tzu',
          c: '49',
          h: '',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  return {
    quotes,
    isLoading,
    refreshQuotes: loadQuotes,
  };
};

