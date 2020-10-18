import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Callout,
} from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Feather
} from '@expo/vector-icons';
import mapMarker from '../images/map-marker.png';
import { RectButton } from 'react-native-gesture-handler';
import api from '../services/api';
import {
  requestPermissionsAsync,
  getCurrentPositionAsync,
} from 'expo-location';

interface Orphanage {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export default function OrphanagesMap() {
  const navigation = useNavigation();
  const [orphanages, setOrphanages] = useState<Orphanage[]>([])
  const [lat, setLat] = useState<number>(-22.5052230)
  const [lon, setLon] = useState<number>(-41.9512004)

  useFocusEffect(() => {
    api.get('orphanages').then(res => {
      setOrphanages(res.data)
    })
  }, [])

  useEffect(() => {
    const getUserLocation = async () => {
      const {granted} = await requestPermissionsAsync();
      if(granted) {
        const location = await getCurrentPositionAsync({})

        const { latitude, longitude } = location.coords
        if(!latitude || !longitude) return

        setLat(latitude)
        setLon(longitude)
      }
    }
    getUserLocation()
  }, [])

  function handleNavigateToOrphanageDetails(id: number) {
    navigation.navigate('OrphanageDetails', { id });
  }

  function handleNavigateToCreateOrphanage() {
    navigation.navigate('SelectMapPosition', {lat, lon});
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider = {PROVIDER_GOOGLE}
        style = {styles.map}
        initialRegion={{
          latitude: lat!,
          longitude: lon!,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
      >
        {orphanages.map(orphanage => (
          <Marker
            key={orphanage.id}
            icon={mapMarker}
            calloutAnchor={{
              x: 2.7,
              y: 0.8,
            }}
            coordinate={{
              latitude: orphanage.latitude,
              longitude: orphanage.longitude,
            }}
        >
          <Callout tooltip onPress={() => handleNavigateToOrphanageDetails(orphanage.id)} >
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutText} >{orphanage.name}</Text>
            </View>
          </Callout>
        </Marker>
        ))}
      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{orphanages.length} orfanato{orphanages.length > 1? 's' : ''} encontrado{orphanages.length > 1? 's' : ''}</Text>
        <RectButton style={styles.createOrphanageButton} onPress={handleNavigateToCreateOrphanage} >
          <Feather name='plus' size={20} color='#fff' />
        </RectButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  calloutContainer: {
    width: 150,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    justifyContent: 'center',
  },
  calloutText: {
    color: '#0080a5',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 32,

    backgroundColor: '#fff',
    borderRadius: 20,
    height: 46,
    paddingLeft: 24,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    elevation: 3,
  },
  footerText: {
    fontFamily: 'Nunito_700Bold',
    color: '#8fa7b3'
  },
  createOrphanageButton: {
    width: 56,
    height: 56,
    backgroundColor: '#15c3d6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
