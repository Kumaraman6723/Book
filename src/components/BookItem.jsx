// components/BookItem.jsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import * as api from '../services/api';

const BookItem = ({book, onViewPress}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Request storage permission for Android
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to download files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  // Function to download the file
  const downloadFile = async () => {
    // Check permission first
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download files.',
      );
      return;
    }

    if (!book.fileUrl) {
      Alert.alert('Error', 'File URL not available');
      return;
    }

    try {
      setDownloading(true);
      setProgress(0);

      // Get the source URL from the API
      const sourceUrl = api.getFileUrl(book.fileUrl);

      // Check if file exists on server
      const fileCheck = await api.checkFileExists(sourceUrl);
      if (!fileCheck.exists) {
        throw new Error('File not found on server');
      }

      // Create a safe filename from the book title
      const safeFilename = book.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);

      // Get the correct path for downloads based on platform
      const downloadPath =
        Platform.OS === 'ios'
          ? `${RNFS.DocumentDirectoryPath}/${safeFilename}.pdf`
          : `${RNFS.DownloadDirectoryPath}/${safeFilename}.pdf`;

      // Check if file exists locally already
      const fileExists = await RNFS.exists(downloadPath);
      if (fileExists) {
        setDownloading(false);
        Alert.alert('File Already Downloaded', 'Do you want to open it?', [
          {
            text: 'Open',
            onPress: () => openFile(downloadPath),
          },
          {
            text: 'Download Again',
            onPress: () => startDownload(sourceUrl, downloadPath),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]);
        return;
      }

      // Start the download if file doesn't exist
      await startDownload(sourceUrl, downloadPath);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Error', error.message);
      setDownloading(false);
    }
  };

  // Helper function to start the actual download
  const startDownload = async (sourceUrl, destinationPath) => {
    try {
      const options = {
        fromUrl: sourceUrl,
        toFile: destinationPath,
        background: true,
        progressDivider: 10,
        begin: res => {
          console.log('Download began', res);
        },
        progress: res => {
          // Calculate progress percentage
          const percentage = Math.round(
            (res.bytesWritten / res.contentLength) * 100,
          );
          setProgress(percentage);
        },
      };

      const download = RNFS.downloadFile(options);
      const result = await download.promise;

      setDownloading(false);

      if (result.statusCode === 200) {
        Alert.alert(
          'Download Complete',
          'The document has been saved to your device.',
          [
            {
              text: 'Open',
              onPress: () => openFile(destinationPath),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ],
        );
      } else {
        throw new Error(
          `Download failed with status code: ${result.statusCode}`,
        );
      }
    } catch (error) {
      setDownloading(false);
      throw error;
    }
  };

  // Function to open downloaded file
  const openFile = async filePath => {
    try {
      await FileViewer.open(filePath, {
        showOpenWithDialog: true,
        displayName: book.title,
      });
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Could not open the file: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{book.categoryName}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {book.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.codeContainer}>
            <Icon name="bookmark" size={16} color="#0066cc" />
            <Text style={styles.codeText}>{book.publishedCode}</Text>
          </View>

          <View style={styles.dateContainer}>
            <Icon name="access-time" size={16} color="#666" />
            <Text style={styles.dateText}>
              {new Date(book.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onViewPress}
          activeOpacity={0.7}
          disabled={downloading}>
          <Icon name="visibility" size={24} color="#0066cc" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={downloadFile}
          activeOpacity={0.7}
          disabled={downloading}>
          {downloading ? (
            <>
              <ActivityIndicator size="small" color="#0066cc" />
              <Text style={styles.actionText}>{progress}%</Text>
            </>
          ) : (
            <>
              <Icon name="file-download" size={24} color="#0066cc" />
              <Text style={styles.actionText}>Download</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  categoryContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 14,
    color: '#0066cc',
    marginLeft: 4,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
});

export default BookItem;
