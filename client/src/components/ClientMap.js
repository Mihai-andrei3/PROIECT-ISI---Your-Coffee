import React, { useState, useEffect, useRef } from "react";
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import "@arcgis/core/assets/esri/themes/light/main.css";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { solve } from "@arcgis/core/rest/route";
import RouteParameters from "@arcgis/core/rest/support/RouteParameters";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import esriConfig from "@arcgis/core/config";
import Navbar from "./Navbar";
import ClientNavbar from "./ClientNavBar";

esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurMNdIrFiU6ZOShV7HJ-op3xT7A3oEhvlzQ9wV7zK_lXSkjgl7ToBUp2BEQvPXK2oVAjDliJ_XSSpSNGTfZeVYyrNmaGncbiTuZnn27iY1_7VMxJ9fj7Tij4N2izLWLnwRo5xP_W_5mDrqppNrS3WPcrjrLkRabght7v4T3Tov96KZGOuQomoeJkf3c2lmA0eXI6a5ghCTIC0M7vcuRzddAM.AT1_6NuC7WFm";

const ClientMap = () => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [favoriteCoffeeShop, setFavoriteCoffeeShop] = useState(null);
  const [filter, setFilter] = useState("all"); // Filter: all or favorite
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const viewRef = useRef(null);
  const graphicsLayerRef = useRef(null); // Reference to the graphics layer

  const userId = auth.currentUser ? auth.currentUser.uid : null;

  // Fetch coffee shops and the user's favorite coffee shop
  useEffect(() => {
    const fetchCoffeeShops = async () => {
      try {
        const shopsQuery = query(collection(db, "coffeeShops"));
        const querySnapshot = await getDocs(shopsQuery);
        const shops = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCoffeeShops(shops);

        if (userId) {
          const userDocRef = doc(db, "users", userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const favoriteShop = shops.find((shop) => shop.id === userData.preferredCafeId);
            setFavoriteCoffeeShop(favoriteShop);
          }
        }
      } catch (error) {
        console.error("Error fetching coffee shops:", error);
      }
    };

    fetchCoffeeShops();
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
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  // Initialize the map
  useEffect(() => {
    let view;

    if (mapRef.current && userLocation) {
      const webMap = new WebMap({
        basemap: "topo-vector",
      });

      view = new MapView({
        container: mapRef.current,
        map: webMap,
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 13,
      });

      const graphicsLayer = new GraphicsLayer();
      webMap.add(graphicsLayer);
      graphicsLayerRef.current = graphicsLayer;

      viewRef.current = view;

      const addUserLocationToMap = () => {
        const userPoint = {
          type: "point",
          longitude: userLocation.longitude,
          latitude: userLocation.latitude,
        };

        const userSymbol = {
          type: "simple-marker",
          color: [0, 0, 255],
          size: "10px",
          outline: {
            color: [255, 255, 255],
            width: 2,
          },
        };

        const userGraphic = new Graphic({
          geometry: userPoint,
          symbol: userSymbol,
          popupTemplate: {
            title: "Your Location",
            content: "This is your current location.",
          },
        });

        graphicsLayer.add(userGraphic);
      };

      const addShopsToMap = (shops) => {
        graphicsLayer.removeAll(); // Clear all graphics
        addUserLocationToMap();

        shops.forEach((shop) => {
          const point = {
            type: "point",
            longitude: shop.longitude,
            latitude: shop.latitude,
          };

          const markerSymbol = {
            type: "simple-marker",
            color: [226, 119, 40],
            outline: {
              color: [255, 255, 255],
              width: 2,
            },
          };

          const popupTemplate = {
            title: shop.name,
            content: `
              <div>
                <p><strong>Address:</strong> ${shop.address}</p>
                <p><strong>Location:</strong> ${shop.latitude}, ${shop.longitude}</p>
              </div>
            `,
          };

          const pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol,
            attributes: shop,
            popupTemplate: popupTemplate,
          });

          graphicsLayer.add(pointGraphic);
        });
      };

      view.on("click", (event) => {
        view.hitTest(event).then((response) => {
          const clickedGraphic = response.results.find((res) => res.graphic.attributes);
          if (clickedGraphic) {
            const selectedShop = clickedGraphic.graphic.attributes;

            // Clear existing route graphics
            graphicsLayer.graphics.removeMany(
              graphicsLayer.graphics.filter((graphic) => graphic.geometry.type === "polyline")
            );

            const routeTaskUrl =
              "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
            const routeParams = new RouteParameters({
              stops: new FeatureSet({
                features: [
                  new Graphic({
                    geometry: {
                      type: "point",
                      longitude: userLocation.longitude,
                      latitude: userLocation.latitude,
                    },
                  }),
                  new Graphic({
                    geometry: {
                      type: "point",
                      longitude: selectedShop.longitude,
                      latitude: selectedShop.latitude,
                    },
                  }),
                ],
              }),
              returnDirections: true,
            });

            solve(routeTaskUrl, routeParams)
              .then((result) => {
                const routeResult = result.routeResults[0].route;
                routeResult.symbol = {
                  type: "simple-line",
                  color: [0, 0, 255],
                  width: 3,
                };
                graphicsLayer.add(routeResult);
              })
              .catch((error) => {
                console.error("Error solving route:", error);
              });
          }
        });
      });

      if (filter === "all") {
        addShopsToMap(coffeeShops);
      } else if (filter === "favorite" && favoriteCoffeeShop) {
        addShopsToMap([favoriteCoffeeShop]);
      }
    }

    return () => {
      if (view) {
        view.container = null; // Clean up WebGL context
      }
    };
  }, [coffeeShops, favoriteCoffeeShop, userLocation, filter]);

  return (
    <div style={styles.container}>
      <ClientNavbar />
      <div style={styles.mapContainer}>
        <div style={styles.filterContainer}>
          <label>
            <input
              type="radio"
              value="all"
              checked={filter === "all"}
              onChange={() => setFilter("all")}
            />
            Show All Coffee Shops
          </label>
          <label>
            <input
              type="radio"
              value="favorite"
              checked={filter === "favorite"}
              onChange={() => setFilter("favorite")}
            />
            Show Favorite Coffee Shop
          </label>
        </div>
        <div ref={mapRef} style={styles.map}></div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    width: "100%",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  mapContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginTop: "70px",
  },
  map: {
    width: "90%",
    height: "75vh",
    border: "1px solid #ddd", 
    borderRadius: "8px",
  },
  filterContainer: {
    position: "absolute",
    top: "8px",
    right: "80px",
    backgroundColor: "white",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: 100, 
  },
};


export default ClientMap;