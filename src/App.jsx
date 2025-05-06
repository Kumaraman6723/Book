// App.jsx
import React, {useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import TeacherScreen from './screens/TeacherScreen';
import StudentScreen from './screens/StudentScreen';

// Context
import {AppProvider} from './context/AppContext';

const Tab = createBottomTabNavigator();

const App = () => {
  const [role, setRole] = useState(null);

  // Role selection screen
  const RoleSelectionScreen = () => {
    return (
      <View style={styles.roleContainer}>
        <Text style={styles.title}>Select Your Role</Text>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => setRole('teacher')}>
          <Icon name="upload-file" size={32} color="#0066cc" />
          <Text style={styles.roleText}>Teacher</Text>
          <Text style={styles.roleDescription}>Upload and manage books</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => setRole('student')}>
          <Icon name="menu-book" size={32} color="#0066cc" />
          <Text style={styles.roleText}>Student</Text>
          <Text style={styles.roleDescription}>View and read books</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Main app with tabs
  const MainApp = () => {
    return (
      <NavigationContainer>
        {role === 'student' ? (
          <View style={styles.studentScreenContainer}>
            <View style={styles.studentHeader}>
              <Text style={styles.studentTitle}></Text>
              <TouchableOpacity
                style={styles.accessibleBackButton}
                onPress={() => setRole(null)}>
                <Icon name="arrow-back" size={20} color="#0066cc" />
                <Text style={styles.backButtonText}>Back to Roles</Text>
              </TouchableOpacity>
            </View>
            <StudentScreen />
          </View>
        ) : (
          <Tab.Navigator
            screenOptions={({route}) => ({
              tabBarIcon: ({focused, color, size}) => {
                let iconName;

                if (route.name === 'Teacher') {
                  iconName = 'upload-file';
                } else if (route.name === 'Student') {
                  iconName = 'menu-book';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#0066cc',
              tabBarInactiveTintColor: 'gray',
              headerShown: true,
              headerLeft: () => (
                <TouchableOpacity
                  style={{marginLeft: 15}}
                  onPress={() => setRole(null)}>
                  <Icon name="arrow-back" size={24} color="#0066cc" />
                  <Text style={{color: '#0066cc', marginLeft: 5}}>
                    Back to Roles
                  </Text>
                </TouchableOpacity>
              ),
            })}>
            <Tab.Screen
              name="Teacher"
              component={TeacherScreen}
              options={{title: 'Upload Books'}}
            />
            <Tab.Screen
              name="Student"
              component={StudentScreen}
              options={{title: 'View Books'}}
            />
          </Tab.Navigator>
        )}
      </NavigationContainer>
    );
  };

  return (
    <AppProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        {role ? <MainApp /> : <RoleSelectionScreen />}
      </SafeAreaView>
    </AppProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  roleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  roleButton: {
    width: '80%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  studentScreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  studentHeader: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  studentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  accessibleBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#0066cc',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default App;
