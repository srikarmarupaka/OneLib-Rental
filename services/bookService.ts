import { Book, Availability } from '../types';
import { LIBRARY_PARTNERS } from '../constants';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

// Helper to clean HTML tags from description
const stripHtml = (html: string) => {
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
};

// Deterministic hash function for consistent mock data
const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const fetchBooks = async (query: string = 'Indian Literature', category?: string, page: number = 1): Promise<Book[]> => {
  try {
    const startIndex = (page - 1) * 24;
    
    // Construct query
    let searchUrl = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}`;
    if (category && category !== 'All') {
      searchUrl += `+subject:${encodeURIComponent(category)}`;
    }
    
    // Add parameters for relevance and filtering
    searchUrl += `&maxResults=24&startIndex=${startIndex}&printType=books&langRestrict=en`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item: any) => {
      const info = item.volumeInfo;
      const hash = getHash(item.id);
      
      // Deterministic "random" values
      const isFree = (hash % 10) > 8; // 20% chance
      const hasAudio = (hash % 10) > 5; // 40% chance of Audio
      const partnerIndex = hash % LIBRARY_PARTNERS.length;
      const rating = (hash % 15) / 10 + 3.5; // 3.5 to 5.0
      const rentPrice = (hash % 50) + 29; // 29 to 79
      
      const totalCopies = (hash % 5) + 1; // 1 to 5 copies
      const rentedCopies = (hash % totalCopies); 
      const availableCopies = totalCopies - rentedCopies;
      
      const availability = availableCopies > 0 ? Availability.AVAILABLE : Availability.RENTED;

      const partner = LIBRARY_PARTNERS[partnerIndex].name;

      // Handle images (use high quality if available, fallback to thumbnail)
      const imageLinks = info.imageLinks;
      const coverUrl = imageLinks?.thumbnail?.replace('http:', 'https:') || 
                       imageLinks?.smallThumbnail?.replace('http:', 'https:') ||
                       'https://via.placeholder.com/128x192?text=No+Cover';

      return {
        id: item.id,
        title: info.title,
        author: info.authors ? info.authors[0] : 'Unknown Author',
        coverUrl: coverUrl,
        category: info.categories ? info.categories[0] : 'General',
        rating: parseFloat(rating.toFixed(1)),
        rentPrice: isFree ? 0 : rentPrice, 
        isDigitalFree: isFree,
        hasAudio: hasAudio,
        availability: availability,
        description: info.description ? stripHtml(info.description) : 'No description available for this title.',
        libraryPartner: partner,
        publisher: info.publisher || 'Unknown Publisher',
        totalCopies,
        availableCopies
      };
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

export const searchCategorizedBooks = async (query: string) => {
  try {
    const [titleResults, authorResults, publisherResults] = await Promise.all([
      fetchBooks(`intitle:${query}`),
      fetchBooks(`inauthor:${query}`),
      fetchBooks(`inpublisher:${query}`)
    ]);

    // Deduplicate logic could be added here if needed, but separate categories usually imply separate context
    return {
      title: titleResults,
      author: authorResults,
      publisher: publisherResults
    };
  } catch (error) {
    console.error("Error searching categorized books:", error);
    return { title: [], author: [], publisher: [] };
  }
};