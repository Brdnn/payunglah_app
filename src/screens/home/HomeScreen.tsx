import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { colors } from "../../constants/colors";
import Map, { Marker } from "react-native-maps";
import MapView from "react-native-map-clustering";
import * as Location from "expo-location";
import { confirmAction, height, width } from "../../utils";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Button, Icon } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import { StatusBar } from "expo-status-bar";
import BottomSheet, {
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import { AuthContext } from "../../context/AuthContext";
import { dummy_marker } from "../../config/data";
import tw from "twrnc";
import * as Linking from "expo-linking";

type MarkerType = {
  title: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  image: string;
  device: {
    available: number;
    free_slot: number;
  };
};

type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const HomeScreen = (props: { navigation: any; }) => {
  const { navigation } = props;
  const mapRef = useRef<Map>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const { isLoading, logout, userToken, userData } = useContext(AuthContext);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [location, setLocation] = useState<LocationType>({
    latitude: 3.0720837,
    longitude: 101.6041568,
    latitudeDelta: 0.0015,
    longitudeDelta: 0.0015,
  });
  const [selectedMarker, setSelectedMarker] = useState<MarkerType>(null);

  // Bottom Sheet Snap Points (Dynamic height based on child components)
  const initialSnapPoints = useMemo(() => ["CONTENT_HEIGHT", "2"], []);
  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  useEffect(() => {
    if (!isLoading) getCurrentLocation();
  }, [isLoading]);

  const getCurrentLocation = async () => {
    //Request Location Permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      //If Permission is denied
      alert("Permission to access location was denied");
      return;
    }

    //Get Current Location Coordinates
    let location = await Location.getCurrentPositionAsync({});

    //Set Current Location Coordinates
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0015,
      longitudeDelta: 0.0015,
    });

    //Animate Map to Current Location Coordinates
    mapRef.current?.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      1000
    );
    //Open Bottom Sheet
    bottomSheetRef.current.collapse();
  };

  //Create Random Markers for Demo
  const renderRandomMarkers = (n: number) => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = location;
    return new Array(n).fill().map((x, i) => (
      <Marker
        key={i}
        coordinate={{
          latitude: latitude + (Math.random() - 0.5) * latitudeDelta,
          longitude: longitude + (Math.random() - 0.5) * longitudeDelta,
        }}
        title={`Umberlla #${i}`}
      >
        <Image
          source={require("../../assets/44156.png")}
          style={{ width: 26, height: 28 }}
          resizeMode="contain"
        />
      </Marker>
    ));
  };

  // if(isLoading){
  //   return(
  //     <View>
  //       <ActivityIndicator size={"large"} />
  //     </View>
  //   )
  // }

  return (
    <View style={styles.container}>
      <StatusBar style={"light"} />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="ios-menu" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 3, alignItems: "center" }}>
          <Text style={styles.headerTitle}>{/* PayungLah */}</Text>
        </View>
        {userToken ? (
          <TouchableOpacity
            style={{ flex: 1, flexDirection: "row-reverse" }}
            onPress={() =>
              confirmAction(
                "Logout",
                "Are you sure to logout?",
                "Logout",
                logout
              )
            }
          >
            <Ionicons name="ios-log-out" size={24} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}
      </View>
      <View style={styles.container}>
        <>
        {Platform.OS === "ios" && <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={true}
          region={location}
          onMapReady={() => {
            setMapReady(true);
          }}
          clusterColor={colors.primary}
          onMarkerDeselect={() => {
            console.log("deselect");
            bottomSheetRef.current?.expand();
          }}
          onPress={
            selectedMarker
              ? () => {
                  setSelectedMarker(null);
                  bottomSheetRef.current?.expand();
                }
              : null
          }
        >
          {/* {renderRandomMarkers(80)} */}
          {dummy_marker.map((item, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: item.coordinates.latitude,
                longitude: item.coordinates.longitude,
              }}
              onPress={() => {
                console.log("pressed marker");
                setSelectedMarker(item);
                bottomSheetRef.current?.collapse();
              }}
            >
              <Image
                source={require("../../assets/44156.png")}
                style={{ width: 26, height: 28 }}
                resizeMode="contain"
              />
            </Marker>
          ))}
        </MapView>}
        </>
        {mapReady && (
          <>
            <View style={styles.menuRightContainer}>
              <View>
                <Icon
                  onPress={() => getCurrentLocation()}
                  style={styles.menuRightBtn}
                  name="ios-compass-outline"
                  type="ionicon"
                  color="black"
                />
              </View>
            </View>
          </>
        )}
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        style={styles.shadowBottomSheet}
      >
        <BottomSheetView
          onLayout={(e) => {
            handleContentLayout(e);
          }}
        >
          {userToken ? (
            <View style={styles.bottomBox}>
              {selectedMarker && (
                <View>
                  <Image
                    source={{ uri: selectedMarker.image }}
                    style={{
                      flex: 1,
                      width: width - 40,
                      height: 200,
                      borderRadius: 10,
                    }}
                  />
                  <View
                    style={[
                      tw`flex-1 mt-2 flex-row items-center justify-center `,
                    ]}
                  >
                    <View style={[tw`flex-2 justify-center py-2`]}>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={2} style={styles.markerTitle}>
                          {selectedMarker.title}
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={[tw`mt-1`, styles.markerAddress]}
                        >
                          {selectedMarker.address}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[tw` flex-row flex-1 items-end justify-end`, {}]}
                    >
                      <Icon
                        onPress={() => {
                          navigation.navigate(
                            "MapDetailScreen",
                            selectedMarker
                          );
                        }}
                        reverse
                        name="alert-circle"
                        type="ionicon"
                        color={colors.secondary}
                        size={18}
                      />
                      <Icon
                        onPress={() => {
                          //Open and navigate maps based on phone OS
                          const scheme = Platform.select({
                            ios: "maps:0,0?q=",
                            android: "geo:0,0?q=",
                          });
                          const latLng = `${selectedMarker.coordinates.latitude},${selectedMarker.coordinates.longitude}`;
                          const label = selectedMarker.title;
                          const url = Platform.select({
                            ios: `${scheme}${label}@${latLng}`,
                            android: `${scheme}${latLng}(${label})`,
                          });
                          Linking.openURL(url);
                        }}
                        reverse
                        name="location-sharp"
                        type="ionicon"
                        color={colors.tertiary}
                        size={18}
                      />
                    </View>
                  </View>
                  <View style={[tw`flex-row my-4 items-center justify-around`]}>
                    <View
                      style={[
                        tw`flex-1 items-center`,
                        {
                          borderRightWidth: StyleSheet.hairlineWidth,
                          borderColor: "#333",
                        },
                      ]}
                    >
                      <Text style={styles.markerUnitTitle}>Available</Text>
                      <Text style={styles.markerUnit}>
                        {selectedMarker.device.available}
                      </Text>
                    </View>
                    <View style={[tw`flex-1 items-center`]}>
                      <Text style={styles.markerUnitTitle}>Free Slots</Text>
                      <Text style={styles.markerUnit}>
                        {selectedMarker.device.free_slot}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              <Button
                ViewComponent={LinearGradient}
                linearGradientProps={{
                  colors: [colors.quaternary, colors.primary],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
                onPress={() => navigation.navigate("ScannerScreen")}
                containerStyle={{
                  width: width - 40,
                  marginTop: 15,
                }}
                buttonStyle={{
                  borderRadius: 30,
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: "600",
                    fontSize: 18,
                  }}
                >
                  I WANT AN UMBRELLA
                </Text>
              </Button>
            </View>
          ) : (
            <View style={[tw`items-center`, styles.bottomBox]}>
              <Text
                style={{
                  color: "black",
                  fontWeight: "bold",
                  fontSize: 24,
                }}
              >
                Let's get set up
              </Text>
              <Text
                style={{
                  color: colors.lightBlack,
                  marginTop: 10,
                }}
              >
                Sign up or log in to start using
              </Text>
              <Button
                ViewComponent={LinearGradient} // Don't forget this!
                linearGradientProps={{
                  colors: [colors.quaternary, colors.primary],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
                onPress={() => navigation.navigate("AuthScreen")}
                // style={styles.signupBtn}
                containerStyle={{
                  width: width - 60,
                  marginTop: 15,
                }}
                buttonStyle={{
                  borderRadius: 30,
                  paddingVertical: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: "600",
                    fontSize: 18,
                  }}
                >
                  Let's go
                </Text>
              </Button>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerContainer: {
    backgroundColor: colors.primary,
    height: 100,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  menuRightContainer: {
    position: "absolute",
    right: 15,
    top: height / 2 - 100,
    zIndex: 999,
  },
  menuRightBtn: {
    backgroundColor: colors.white,
    padding: 5,
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  shadowBottomSheet: {
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 20,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomBox: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  signupBtn: {
    backgroundColor: colors.quaternary,
    width: width - 60,
    paddingVertical: 10,
    borderRadius: 32,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  markerTitle: {
    color: "black",
    fontWeight: "bold",
    fontSize: 20,
  },
  markerAddress: {
    color: colors.lightBlack,
    fontSize: 14,
  },
  markerUnitTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  markerUnit: {
    fontSize: 18,
    color: colors.lightBlack,
  },
});
