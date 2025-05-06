// services/api.js
import axios from 'axios';
import {Platform} from 'react-native';

// Use localhost for iOS and 10.0.2.2 for Android emulator
// Or use your actual IP address for physical devices
const HOST = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
const PORT = 5000;

// For physical devices on the same network, use your actual IP
// Uncomment and modify this line when testing on physical devices
// const HOST = '192.168.1.39';

// Build the base URL and file URLs
const BASE_URL = `http://${HOST}:${PORT}/api`;
const UPLOADS_URL = `http://${HOST}:${PORT}/uploads`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add a timeout to avoid hanging requests
});

// Helper function to get a full file URL
export const getFileUrl = relativeUrl => {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http')) return relativeUrl;

  // Handle Windows-style paths (if they exist in your data)
  const cleanPath = relativeUrl.replace(/\\/g, '/');

  // Extract just the filename from the path
  const filename = cleanPath.split('/').pop();

  return `${UPLOADS_URL}/${filename}`;
};

// Process book objects to ensure fileUrls are complete
const processBookData = book => {
  if (book.fileUrl && !book.fileUrl.startsWith('http')) {
    book.fileUrl = getFileUrl(book.fileUrl);
  }
  return book;
};

// Category APIs
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Book APIs
export const getBooks = async () => {
  try {
    const response = await api.get('/books');
    // Process all books to ensure fileUrls are properly formatted
    const processedBooks = response.data.map(book => processBookData(book));
    return processedBooks;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const uploadBook = async formData => {
  try {
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading book:', error);
    throw error;
  }
};

export const getBookById = async id => {
  try {
    const response = await api.get(`/books/${id}`);
    // Process the book to ensure fileUrl is properly formatted
    return processBookData(response.data);
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

// File operations for viewing and downloading
export const checkFileExists = async fileUrl => {
  try {
    // Make a HEAD request to check if file exists and get its size
    const response = await axios.head(fileUrl);
    return {
      exists: true,
      size: parseInt(response.headers['content-length'] || '0', 10),
      contentType: response.headers['content-type'],
    };
  } catch (error) {
    console.error('Error checking file existence:', error);
    return {exists: false, size: 0, contentType: null};
  }
};

// Helper function to get the correct storage path for downloads
export const getDownloadPath = filename => {
  if (Platform.OS === 'ios') {
    // For iOS, we use the Documents directory
    return `${RNFS.DocumentDirectoryPath}/${filename}`;
  } else {
    // For Android, we can use external storage
    return `${RNFS.DownloadDirectoryPath}/${filename}`;
  }
};

// Combined export
export default {
  getCategories,
  getBooks,
  uploadBook,
  getBookById,
  getFileUrl,
  checkFileExists,
  getDownloadPath,
};
