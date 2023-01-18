import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import { height, width } from "../../utils";
import { Button, Icon } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import BottomSheet, {
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from "@gorhom/bottom-sheet";
import { AuthContext } from "../../context/AuthContext";
import { dummy_marker } from "../../config/data";
import tw from "twrnc";
import * as Linking from "expo-linking";
import HomeHeader from "../../components/header/HomeHeader";
import axios from "axios";
import { siteUrl } from "../../config/site";
import { LocationType, MarkerType, RentalType } from "../../types/Types";
import { fonts } from "../../constants/fonts";
import { SocketContext } from "../../context/SocketContext";
import UmbrellaIcon from "../../assets/svgs/umbrella_icon";
import MapboxGL from "@rnmapbox/maps";

MapboxGL.setAccessToken(
  "pk.eyJ1IjoicGF5dW5nbGFoIiwiYSI6ImNsY3Jiem1oNjBlZzgzcHF2dnE1YnNsNGIifQ.WlPf2-aWhCwdsiqf0S1iBQ"
);
MapboxGL.setWellKnownTileServer(MapboxGL.TileServers.Mapbox);
const HomeScreen = (props: { navigation: any }) => {
  const { navigation } = props;
  // const mapRef = useRef<Map>(null);
  const mapRef = useRef<MapboxGL.MapView | null>(null);
  const mapCameraRef = useRef<MapboxGL.Camera | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const socket = useContext(SocketContext);

  const { isLoading, logout, userToken, userData } = useContext(AuthContext);
  const [isLocationPermit, setIsLocationPermit] = useState<boolean>(true);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<LocationType>({
    latitude: 3.0720837,
    longitude: 101.6041568,
    latitudeDelta: 0.0015,
    longitudeDelta: 0.0015,
  });
  const [coordinates, setCoordinates] = useState([
    [-73.99155, 40.73581],
    [101.5991578, 3.0733837],
  ]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType>(null);
  const [isRentalLoading, setRentalLoading] = useState<boolean>(false);
  const [ongoingRental, setOngoingRental] = useState<RentalType>(null);
  const [startTime, setStartTime] = useState<Date | null>(null); // start date
  const [timeElapsed, setTimeElapsed] = useState(0); // time elapsed in seconds

  // Bottom Sheet Snap Points (Dynamic height based on child components)
  const initialSnapPoints = useMemo(() => ["5", "CONTENT_HEIGHT"], []);
  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  useEffect(() => {
    socket.on("refresh", (data) => {
      handleRefresh();
    });
  }, []);

  useEffect(() => {
    if (!isLoading && mapReady) getCurrentLocation(true);
  }, [isLoading, mapReady]);

  useEffect(() => {
    if (userToken) getOngoingRental();
  }, [userToken]);

  useEffect(() => {
    if (startTime) {
      // start time counter if start date is found
      const interval = setInterval(() => {
        // calculate time elapsed in seconds
        const timeElapsed = Math.floor(
          (new Date().getTime() - startTime.getTime()) / 1000
        );
        setTimeElapsed(timeElapsed);
      }, 1000); // update time elapsed every second

      return () => clearInterval(interval);
    }
  }, [startTime]);

  const handleRefresh = useCallback(() => {
    getCurrentLocation(false);
    setOngoingRental(null);
    setStartTime(null);
    setTimeElapsed(0);
    if (userToken) {
      getOngoingRental();
    }
  }, [userToken]);

  //Get Current Location Coordinates
  const getCurrentLocation = async (animate: boolean) => {
   try {
     //Request Location Permission
     let { status } = await Location.requestForegroundPermissionsAsync();

     if (status !== "granted") {
       //If Permission is denied
       setIsLocationPermit(false);
       // alert("Permission to access location was denied");
       return;
     }
 
     setIsMapLoading(true);
     //Get Current Location Coordinates
     // let location = await Location.getCurrentPositionAsync({ accuracy: 6 });
     const location = await Location.getCurrentPositionAsync({
       accuracy:
         Platform.OS === "android"
           ? Location.Accuracy.Low
           : Location.Accuracy.Lowest,
     });
     setIsLocationPermit(true);

     //Animate Map to Current Location Coordinates
     if (animate) {
       //Set Current Location Coordinates
       setLocation({
         latitude: location.coords.latitude,
         longitude: location.coords.longitude,
         latitudeDelta: 0.0015,
         longitudeDelta: 0.0015,
       });
       // mapRef.current?.animateToRegion(
       //   {
       //     latitude: location.coords.latitude,
       //     longitude: location.coords.longitude,
       //     latitudeDelta: 0.02,
       //     longitudeDelta: 0.02,
       //   },
       //   1000
       // );
       mapCameraRef.current?.flyTo(
         [location.coords.longitude, location.coords.latitude],
         1000
       );
       mapCameraRef.current.setCamera({ zoomLevel: 15 });
       //Open Bottom Sheet
       bottomSheetRef.current.expand();
     }
     setIsMapLoading(false);
   } catch (error) {
    // console.log(error)
    Alert.alert("Error", "Something went wrong, please try again later.");
    setIsMapLoading(false);
   }
   
  };

  //Get Ongoing Rental
  const getOngoingRental = async () => {
    try {
      setRentalLoading(true);
      let res = await axios.get(`${siteUrl}/rental/ongoing`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      // console.log(res.data.data);
      if (res.data?.data) {
        setOngoingRental(res.data.data);
        setStartTime(new Date(res.data.data.startTime));
      }

      setRentalLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setRentalLoading(false);
    }
  };

  //Handle Rent
  const handleRent = () => {
    if (userData?.displayName.trim() == "") {
      Alert.alert(
        "Incomplete Profile",
        "Please update your profile to continue",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Update",
            onPress: () => navigation.navigate("ProfileScreen"),
          },
        ]
      );
      return;
    } else if (userData?.balance < 20) {
      Alert.alert(
        "Insufficient Balance",
        "Please top up your balance to continue",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Top Up",
            onPress: () => navigation.navigate("ReloadScreen"),
          },
        ]
      );
      return;
    } else {
      navigation.navigate("ScannerScreen");
    }
  };

  const renderAnnotation = (counter) => {
    const id = `pointAnnotation${counter}`;
    const coordinate = dummy_marker[counter];

    return (
      <MapboxGL.PointAnnotation
        key={id}
        id={id}
        coordinate={[
          coordinate.coordinates.longitude,
          coordinate.coordinates.latitude,
        ]}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setSelectedMarker(coordinate);
            bottomSheetRef.current?.expand();
          }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              padding: 8,
              borderRadius: 50,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <UmbrellaIcon style={{ width: 20, height: 20 }} />
          </View>
        </TouchableWithoutFeedback>
      </MapboxGL.PointAnnotation>
    );
  };

  const renderAnnotations = () => {
    const items = [];

    for (let i = 0; i < dummy_marker.length; i++) {
      items.push(renderAnnotation(i));
    }

    return items;
  };

  // calculate hours, minutes, and seconds
  const hours = Math.floor(timeElapsed / 3600);
  const minutes = Math.floor((timeElapsed % 3600) / 60);
  const seconds = Math.round(timeElapsed % 60);
  // pad hours, minutes, and seconds with leading zeros if necessary
  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  //Calculate Total Rental Cost
  let totalPrice = 0;
  if (timeElapsed > 1800) {
    // start charge if time exceeds 5 minutes (300 seconds)
    totalPrice =
      hours >= 1 ? hours * ongoingRental.rate : 1 * ongoingRental.rate;
    // set max price to 20
    totalPrice >= 20 ? (totalPrice = 20) : totalPrice;
  }
  return (
    <>
      <HomeHeader navigation={navigation} theme="light" />
      <View style={styles.container}>
        {!isLocationPermit && (
          <View style={styles.overlay}>
            <View
              style={{
                backgroundColor: colors.white,
                padding: 20,
                borderRadius: 16,
                marginHorizontal: 20,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Icon
                  reverse
                  size={32}
                  name="location-off"
                  type="marterialicon"
                  color={colors.primary}
                />
              </View>
              <Text
                style={[
                  fonts.h2,
                  {
                    fontSize: 18,
                    marginTop: 10,
                  },
                ]}
              >
                Permission to access location was denied
              </Text>
              <Text
                style={[
                  fonts.p,
                  {
                    marginTop: 5,
                  },
                ]}
              >
                Please enable location services to use this app. You can enable
                it in your phone settings.
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  padding: 10,
                  borderRadius: 32,
                  marginTop: 15,
                  width: width - 80,
                  alignItems: "center",
                }}
                onPress={async () => await Linking.openURL("app-settings:")}
              >
                <Text
                  style={[
                    fonts.h3,
                    {
                      color: colors.white,
                      fontSize: 14,
                    },
                  ]}
                >
                  Open Setting
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {isMapLoading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        )}
        <View style={styles.container}>
          <>
            {Platform.OS === "ios" && (
              <>
                <MapboxGL.MapView
                  ref={mapRef}
                  style={styles.map}
                  logoEnabled={false}
                  testID={"show-map"}
                  onPress={() => {
                    bottomSheetRef.current?.collapse();
                  }}
                  onDidFinishLoadingMap={() => {
                    setMapReady(true);
                    bottomSheetRef.current?.expand();
                  }}
                >
                  <MapboxGL.UserLocation
                    visible={true}
                    // onUpdate={(e) => console.log(e)}
                  />
                  <MapboxGL.Camera
                    ref={mapCameraRef}
                    zoomLevel={15}
                    animationMode={"flyTo"}
                    centerCoordinate={[location.longitude, location.latitude]}
                    animationDuration={250}
                  />
                  {renderAnnotations()}
                </MapboxGL.MapView>
                {/* <MapView
                ref={mapRef}
                style={styles.map}
                userInterfaceStyle={"light"}
                showsUserLocation={true}
                showsMyLocationButton={true}
                region={location}
                onMapReady={() => {
                  setMapReady(true);
                  bottomSheetRef.current?.expand();
                }}
                clusterColor={colors.primary}
                onMarkerDeselect={() => {
                  bottomSheetRef.current?.collapse();
                }}
                onPress={
                  selectedMarker
                    ? () => {
                        bottomSheetRef.current?.collapse();
                      }
                    : null
                }
              >
                {dummy_marker.map((item, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: item.coordinates.latitude,
                      longitude: item.coordinates.longitude,
                    }}
                    onPress={() => {
                      setSelectedMarker(item);
                      bottomSheetRef.current?.expand();
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: colors.primary,
                        padding: 8,
                        borderRadius: 50,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <UmbrellaIcon style={{ width: 20, height: 20 }} />
                    </View>
                  </Marker>
                ))}
              </MapView> */}
              </>
            )}
          </>
          {mapReady && (
            <>
              <View style={styles.menuRightContainer}>
                <TouchableOpacity
                  onPress={handleRefresh}
                  disabled={isMapLoading}
                  style={{ marginBottom: 10 }}
                >
                  <Icon
                    style={styles.menuRightBtn}
                    name="refresh"
                    type="material"
                    color="black"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => getCurrentLocation(true)}
                  disabled={isMapLoading}
                >
                  <Icon
                    style={styles.menuRightBtn}
                    name="ios-compass-outline"
                    type="ionicon"
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
        {userToken && ongoingRental && (
          <View style={{ zIndex: 99, position: "absolute", top: 0 }}>
            <View style={styles.onGoingRentalContainer}>
              <View style={[tw`flex-row items-center justify-between`]}>
                <Text style={[fonts.p, { fontSize: 16 }]}>
                  Booking ID #{ongoingRental.id}
                </Text>
                <View
                  style={{
                    backgroundColor: colors.success,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={[fonts.p, { color: colors.white, fontSize: 12 }]}
                  >
                    Ongoing
                  </Text>
                </View>
              </View>
              <View style={[tw`flex-row items-center justify-between`]}>
                <Text style={[fonts.h3, { fontSize: 16 }]}>
                  {hours >= 1 ? `${paddedHours}h ` : null}
                  {paddedMinutes}m {paddedSeconds}s
                </Text>
                <Text style={[fonts.h3, { fontSize: 16 }]}>
                  RM {totalPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={animatedSnapPoints}
          handleHeight={animatedHandleHeight}
          contentHeight={animatedContentHeight}
          style={styles.shadowBottomSheet}
          onChange={(index) => {
            if (index == 0 && selectedMarker) {
              setSelectedMarker(null);
            }
          }}
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
                          <Text
                            numberOfLines={2}
                            style={[fonts.h2, styles.markerTitle]}
                          >
                            {selectedMarker.title}
                          </Text>
                          <Text
                            numberOfLines={2}
                            style={[tw`mt-1`, fonts.p, styles.markerAddress]}
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
                          color={colors.secondary}
                          size={18}
                        />
                      </View>
                    </View>
                    <View
                      style={[tw`flex-row my-4 items-center justify-around`]}
                    >
                      <View
                        style={[
                          tw`flex-1 items-center`,
                          {
                            borderRightWidth: StyleSheet.hairlineWidth,
                            borderColor: "#333",
                          },
                        ]}
                      >
                        <Text style={[fonts.h3, styles.markerUnitTitle]}>
                          Available
                        </Text>
                        <Text style={[fonts.p, styles.markerUnit]}>
                          {selectedMarker.device.available}
                        </Text>
                      </View>
                      <View style={[tw`flex-1 items-center`]}>
                        <Text style={[fonts.h3, styles.markerUnitTitle]}>
                          Free Slots
                        </Text>
                        <Text style={[fonts.p, styles.markerUnit]}>
                          {selectedMarker.device.free_slot}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                <Button
                  ViewComponent={LinearGradient}
                  linearGradientProps={{
                    colors: [colors.primary, colors.primary],
                    start: { x: 0, y: 0.5 },
                    end: { x: 1, y: 0.5 },
                  }}
                  onPress={handleRent}
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
                    style={[
                      fonts.h2,
                      {
                        color: colors.white,
                        fontSize: 18,
                      },
                    ]}
                  >
                    RENT AN UMBRELLA
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
                    colors: [colors.primary, colors.primary],
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
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    width,
    zIndex: 9999,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  menuRightContainer: {
    position: "absolute",
    right: 15,
    top: height / 2 - 130,
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
    zIndex: 9999,
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
    // fontWeight: "500",
  },
  markerUnit: {
    fontSize: 18,
    color: colors.lightBlack,
  },
  onGoingRentalContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: width - 40,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
