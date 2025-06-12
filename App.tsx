import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Modal, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import HotspotModule from './src/HotspotModule';

const { width } = Dimensions.get('window');

const App = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [devices, setDevices] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(width));

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => setShowDialog(false));
  };

  const checkHotspotStatus = () => {
    HotspotModule.isHotspotEnabled((status:any) => {
      if (status) {
        fetchDevices();
      } else {
        setShowDialog(true);
        animateIn();
      }
    });
  };

  const handleTurnOnHotspot = () => {
    animateOut();
    HotspotModule.turnOnHotspot();
    // Check again after 2 seconds
    setTimeout(checkHotspotStatus, 2000);
  };

  const handleCancel = () => {
    animateOut();
  };

  const fetchDevices = () => {
    setIsRefreshing(true);
    HotspotModule.getConnectedDevices((deviceArray:any) => {
      const parsed:any = Array.isArray(deviceArray) ? deviceArray : [];
      setDevices(parsed);
      setIsRefreshing(false);
    });
  };

  useEffect(() => {
    checkHotspotStatus();
    animateIn();
  }, []);

  const renderDeviceItem = ({ item, index }: {
    item: any;
    index: any;
}) => (
    <Animated.View 
      style={[
        styles.deviceCard,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }
      ]}
    >
      <View style={styles.deviceHeader}>
        {/* <MaterialIcons name="devices" size={24} color="#6200EE" /> */}
        <Text style={styles.deviceName}>{item.deviceName || 'Unknown Device'}</Text>
      </View>
      <View style={styles.deviceDetails}>
        <View style={styles.detailRow}>
          {/* <MaterialIcons name="settings-ethernet" size={18} color="#666" /> */}
          <Text style={styles.detailText}>IP: {item.ip || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          {/* <MaterialIcons name="fingerprint" size={18} color="#666" /> */}
          <Text style={styles.detailText}>MAC: {item.mac || 'N/A'}</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hotspot Manager</Text>
        <TouchableOpacity 
            onPress={fetchDevices} 
            style={styles.refreshButtonLarge}
          >
            <Text style={styles.refreshButtonText}>Refresh Devices</Text>
          </TouchableOpacity>
      </View>

      {devices.length === 0 ? (
        <View style={styles.emptyState}>
          {/* <MaterialIcons name="wifi-off" size={60} color="#ccc" /> */}
          <Text style={styles.emptyText}>No devices connected</Text>
          <TouchableOpacity 
            onPress={fetchDevices} 
            style={styles.refreshButtonLarge}
          >
            <Text style={styles.refreshButtonText}>Refresh Devices</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={fetchDevices}
              colors={['#6200EE']}
              tintColor="#6200EE"
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={renderDeviceItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <Modal visible={showDialog} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              }
            ]}
          >
            <Text style={styles.modalTitle}>Hotspot is Disabled</Text>
            <Text style={styles.modalText}>
              You need to enable your mobile hotspot to see connected devices.
            </Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                onPress={handleCancel} 
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleTurnOnHotspot} 
                style={[styles.button, styles.confirmButton]}
              >
                <Text style={styles.buttonText}>Turn On Hotspot</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#6200EE',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#3700B3',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  listContent: {
    padding: 16,
  },
  deviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  deviceDetails: {
    marginLeft: 36,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  separator: {
    height: 16,
  },
  refreshButtonLarge: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 2,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#6200EE',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;