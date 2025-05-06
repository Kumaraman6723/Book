// screens/TeacherScreen.jsx
import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {uploadBook} from '../services/api';
import {AppContext} from '../context/AppContext';
import CustomButton from '../components/CustomButton';

const TeacherScreen = () => {
  const {categories, refreshBooks} = useContext(AppContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      // Using @react-native-documents/picker correctly
      const result = await pick({
        type: types.pdf,
        allowMultiSelection: false,
      });

      console.log('Document picked result:', result);

      if (result && result.length > 0) {
        setSelectedFile(result[0]);
        console.log('Selected file:', result[0]);
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error picking document:', err);
        Alert.alert('Error', 'There was an issue selecting the document.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a PDF file');
      return;
    }

    setLoading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('categoryId', selectedCategory);

      // Add file to form data with appropriate attributes
      formData.append('pdfFile', {
        uri: selectedFile.uri,
        type: selectedFile.type || 'application/pdf',
        name: selectedFile.name || 'document.pdf',
      });

      console.log('Uploading form data:', JSON.stringify(formData));

      // Upload book
      const response = await uploadBook(formData);

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedCategory('');
      setSelectedFile(null);

      // Refresh books list
      await refreshBooks();

      // Show success message
      Alert.alert(
        'Success',
        `Book uploaded successfully! Published Code: ${response.book.publishedCode}`,
      );
    } catch (error) {
      console.error('Error uploading book:', error);
      Alert.alert('Error', 'Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Upload Study Material</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Book Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter book title"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter book description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={itemValue => setSelectedCategory(itemValue)}
              style={styles.picker}>
              <Picker.Item label="Select a category" value="" />
              {categories.map(category => (
                <Picker.Item
                  key={category._id}
                  label={category.name}
                  value={category._id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>PDF File</Text>
          <TouchableOpacity
            style={styles.filePicker}
            onPress={pickDocument}
            activeOpacity={0.7}>
            <Icon name="attach-file" size={24} color="#0066cc" />
            <Text style={styles.filePickerText}>
              {selectedFile ? 'Change PDF File' : 'Select PDF File'}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <View style={styles.fileInfoContainer}>
              <Icon name="description" size={20} color="#0066cc" />
              <Text style={styles.fileSelectedText} numberOfLines={1}>
                {selectedFile.name}
              </Text>
            </View>
          )}
        </View>

        <CustomButton
          title="Upload Book"
          onPress={handleSubmit}
          isLoading={loading}
          disabled={
            !title ||
            !description ||
            !selectedCategory ||
            !selectedFile ||
            loading
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  filePickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0066cc',
    flex: 1,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  fileSelectedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
});

export default TeacherScreen;
