import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase'; // Firebase configuration
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebase'; // To get current user's UID
import '@arcgis/core/assets/esri/themes/light/main.css'; // ArcGIS CSS
import MapView from '@arcgis/core/views/MapView'; // Correct import
import WebMap from '@arcgis/core/WebMap'; // Correct import
import Graphic from '@arcgis/core/Graphic'; // Correct import
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'; // Correct import
import PopupTemplate from '@arcgis/core/PopupTemplate'; // Correct import
import Navbar from './Navbar'; // Import the Navbar component

const MyMap = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const mapRef = useRef(null); // To store map view
  const [userLocation, setUserLocation] = useState(null);

  const userId = auth.currentUser ? auth.currentUser.uid : null;

  // Fetch coffee shops for the logged-in user
  useEffect(() => {
    if (userId) {
      const fetchCoffeeShops = async () => {
        try {
          const q = query(
            collection(db, "coffeeShops"),
            where("userId", "==", userId) // Only get coffee shops for the logged-in user
          );
          const querySnapshot = await getDocs(q);
          const shops = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCoffeeShops(shops);
        } catch (error) {
          console.error("Error getting coffee shops: ", error);
        }
      };

      fetchCoffeeShops();
    }
  }, [userId]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location: ", error);
        }
      );
    }
  }, []);

  // Initialize the map
  useEffect(() => {
    if (mapRef.current && userLocation) {
      const webMap = new WebMap({
        basemap: 'streets-navigation-vector'
      });

      const view = new MapView({
        container: mapRef.current,
        map: webMap,
        center: [userLocation.longitude, userLocation.latitude], // Center based on user location
        zoom: 13
      });

      const graphicsLayer = new GraphicsLayer();
      webMap.add(graphicsLayer);

      coffeeShops.forEach(shop => {
        const point = {
          type: "point",
          longitude: shop.longitude,
          latitude: shop.latitude
        };

        const markerSymbol = {
          type: "simple-marker",
          color: [226, 119, 40],
          outline: {
            color: [255, 255, 255],
            width: 2
          }
        };

        const popupTemplate = new PopupTemplate({
          title: shop.name,
          content: `
            <div>
              <p><strong>Address:</strong> ${shop.address}</p>
              <p><strong>Location:</strong> ${shop.latitude}, ${shop.longitude}</p>
              <img src="${shop.picture}" alt="${shop.name}" style="width:100%;height:auto;"/>
            </div>
          `
        });

        const pointGraphic = new Graphic({
          geometry: point,
          symbol: markerSymbol,
          attributes: shop,
          popupTemplate: popupTemplate
        });

        graphicsLayer.add(pointGraphic);
      });
    }
  }, [coffeeShops, userLocation]);

  return (
    <div style={styles.container}>
      <Navbar /> {}
      <div style={styles.mapContainer}>
        <div ref={mapRef} style={styles.map}></div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  mapContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  map: {
    width: '800px', 
    height: '600px', 
  },
};

export default MyMap;