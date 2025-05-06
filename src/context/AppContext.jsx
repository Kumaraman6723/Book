// context/AppContext.jsx
import React, {createContext, useState, useEffect} from 'react';
import {getCategories, getBooks} from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories and books on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, booksData] = await Promise.all([
        getCategories(),
        getBooks(),
      ]);

      setCategories(categoriesData);
      setBooks(booksData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please check your connection.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshBooks = async () => {
    setLoading(true);
    try {
      const booksData = await getBooks();
      setBooks(booksData);
      setError(null);
    } catch (err) {
      setError('Failed to refresh books. Please try again.');
      console.error('Error refreshing books:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    categories,
    books,
    loading,
    error,
    refreshData: fetchData,
    refreshBooks,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
