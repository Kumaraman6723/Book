// screens/StudentScreen.jsx
import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AppContext} from '../context/AppContext';
import BookItem from '../components/BookItem';
import {viewDocument} from '@react-native-documents/viewer';
import * as api from '../services/api';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

const StudentScreen = () => {
  const {books, loading, refreshBooks} = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewingPdf, setViewingPdf] = useState(false);

  // Extract unique categories from books
  const categories = [...new Set(books.map(book => book.categoryName))].sort();

  // Filter books based on search query and selected category
  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.publishedCode &&
        book.publishedCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      !selectedCategory || book.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSelectedCategory(null);
  };

  // Updated function to open and view PDF file
  const viewPdf = async pdfUri => {
    if (!pdfUri) {
      Alert.alert('Error', 'PDF file not available');
      return;
    }

    // Prevent multiple concurrent view operations
    if (viewingPdf) return;
    setViewingPdf(true);

    try {
      // Get the full URL from the API service
      const fullUri = api.getFileUrl(pdfUri);
      console.log('Opening PDF at URI:', fullUri);

      // Check if the file exists on the server
      const fileCheck = await api.checkFileExists(fullUri);
      if (!fileCheck.exists) {
        throw new Error('File not found on server');
      }

      // Create a temporary file path with a unique name
      const timestamp = Date.now();
      const tempFileName = `temp_pdf_${timestamp}.pdf`;
      const tempFilePath = `${RNFS.CachesDirectoryPath}/${tempFileName}`;

      // Show loading indicator
      Alert.alert('Loading', 'Opening document, please wait...', [], {
        cancelable: false,
      });

      // Download the file to cache
      const downloadResult = await RNFS.downloadFile({
        fromUrl: fullUri,
        toFile: tempFilePath,
        background: true,
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Dismiss the loading alert
        Alert.dismiss?.() || console.log('Alert dismissed (fallback)');

        // Choose method based on platform
        if (Platform.OS === 'ios') {
          // For iOS, use the viewDocument function
          await viewDocument({
            uri: `file://${tempFilePath}`,
            mimeType: 'application/pdf',
          });
        } else {
          // For Android, use FileViewer
          await FileViewer.open(tempFilePath, {
            showOpenWithDialog: true,
            displayName: 'Document',
          });
        }

        // Clean up temp file after a delay to ensure the viewer has loaded it
        setTimeout(() => {
          RNFS.unlink(tempFilePath).catch(err =>
            console.log('Error cleaning temp file:', err),
          );
        }, 5000);
      } else {
        throw new Error(
          'Download failed with status code: ' + downloadResult.statusCode,
        );
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      Alert.alert('Error', 'Failed to open PDF file: ' + error.message);
    } finally {
      setViewingPdf(false);
    }
  };

  // Render a book item with view function
  const renderBookItem = ({item}) => (
    <BookItem book={item} onViewPress={() => viewPdf(item.fileUrl)} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Materials</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterVisible(!filterVisible)}>
            <Icon name="filter-list" size={24} color="#0066cc" />
          </TouchableOpacity>
        </View>

        {filterVisible && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by Category:</Text>
            <View style={styles.categoriesContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category &&
                      styles.selectedCategoryChip,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      category === selectedCategory ? null : category,
                    )
                  }>
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category &&
                        styles.selectedCategoryChipText,
                    ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedCategory && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="library-books" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory
                ? 'No books match your search criteria'
                : 'No books available yet'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshBooks} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  filterButton: {
    padding: 10,
    marginLeft: 8,
  },
  filterContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedCategoryChip: {
    backgroundColor: '#0066cc',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 6,
  },
  clearButtonText: {
    color: '#0066cc',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default StudentScreen;
