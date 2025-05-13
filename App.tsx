/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, PermissionsAndroid, Platform, Alert, NativeModules, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { DeveloperMode } = NativeModules;

// Deklarasi type untuk global.nativeDebuggerConnected
declare global {
  var nativeDebuggerConnected: boolean;
}

function App(): React.JSX.Element {
  const [isDevModeAlertShown, setIsDevModeAlertShown] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y < -100) { // Jika user menarik ke bawah lebih dari 100 unit
      if (webViewRef.current) {
        webViewRef.current.reload();
      }
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  useEffect(() => {
    const checkDeveloperMode = async () => {
      try {
        console.log('Checking developer mode...');
        if (Platform.OS === 'android') {
          DeveloperMode.isDeveloperModeEnabled((error, isEnabled) => {
            if (error) {
              console.error('Error checking developer mode:', error);
              return;
            }
            console.log('Developer mode enabled:', isEnabled);
            if (isEnabled && !isDevModeAlertShown) {
              console.log('Showing developer mode alert');
              setIsDevModeAlertShown(true);
              Alert.alert(
                'Mode Developer Aktif',
                'Mohon nonaktifkan mode developer untuk keamanan aplikasi',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('Alert closed');
                      setIsDevModeAlertShown(false);
                    },
                  },
                ],
                { cancelable: false }
              );
            }
          });
        }
      } catch (error) {
        console.error('Error checking developer mode:', error);
      }
    };

    // Cek mode developer setiap 5 detik
    const devModeInterval = setInterval(checkDeveloperMode, 5000);
    // Cek pertama kali
    checkDeveloperMode();

    return () => {
      clearInterval(devModeInterval);
    };
  }, [isDevModeAlertShown]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          ]);
          
          if (
            granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('Semua permission diberikan');
          } else {
            console.log('Beberapa permission ditolak');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const checkGpsStatus = () => {
      if (!isSubscribed) {
        return;
      }

      try {
        if (Platform.OS === 'android') {
          Geolocation.getCurrentPosition(
            (_position) => {
              console.log('GPS aktif');
            },
            (error) => {
              if (!isSubscribed) {
                return;
              }
              
              console.log('GPS Error:', error);
              if (error.code === 1 || error.code === 2) {
                Alert.alert(
                  'GPS Tidak Aktif',
                  'Mohon aktifkan GPS Anda untuk menggunakan aplikasi ini',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        if (isSubscribed) {
                          checkGpsStatus();
                        }
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
              forceRequestLocation: true,
            }
          );
        }
      } catch (error) {
        console.error('Error checking GPS:', error);
      }
    };

    const intervalId = setInterval(checkGpsStatus, 5000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <WebView 
        ref={webViewRef}
        source={{ uri: 'https://presensi.eksperimen.online/' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={true}
        allowsBackForwardNavigationGestures={true}
        allowsLinkPreview={true}
        mediaCapturePermissionGrantType="grant"
        onShouldStartLoadWithRequest={(request) => {
          if (request.url.startsWith('https://presensi.eksperimen.online/')) {
            return true;
          }
          return false;
        }}
        onScroll={handleScroll}
      />
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Icon name="refresh" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2196F3',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default App;
