import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import CustomHeader from "../../components/header/CustomHeader";
import { colors } from "../../constants/colors";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { dummy_marker } from "../../config/data";
import { MarkerType } from "../../types/Types";
import { height, width } from "../../utils";
import { fonts } from "../../constants/fonts";
import tw from "twrnc";
import SubmitBtn from "../../components/button/SubmitBtn";
import { siteUrl } from "../../config/site";
import { SocketContext } from "../../context/SocketContext";
import * as Notifications from "expo-notifications";

const RentalScreen = (props: any) => {
  const { code } = props.route.params;
  const navigation = useNavigation();
  const { userToken, isLoggedIn } = useContext(AuthContext);

  const [deviceData, setDeviceData] = useState<MarkerType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const socket = useContext(SocketContext);

  useEffect(() => {
    socket.on("startRental", (data) => {
      console.log("startRental", data);
      scheduleNotification();
      Alert.alert("Success", "Rental started");
      navigation.navigate("HomeScreen")
    });
  }, []);

  const scheduleNotification = async () => {
    const notification = {
      content: {
        title: "Reminder",
        body: '10 more minutes to reach 1 hour',
        data: {screenName: "HomeScreen"}
      },
      trigger: {
        date: new Date().getTime() + 1000 * 60 * 50,
      },
    }
  
    await Notifications.scheduleNotificationAsync(notification)
  }

  useEffect(() => {
    if (code) {
      dummy_marker.filter((item) => {
        if (item.device.id == code) {
          setDeviceData(item);
          console.log(item);
        }
      });
    }
    if (isLoggedIn && userToken && code) {
      checkDeviceStatus(code);
    } else {
      if (!code) {
        Alert.alert("Error", "Device not found");
        return;
      } else {
        // Alert.alert("Error", "Please login first");
        // navigation.navigate("AuthScreen");
        return;
      }
    }
  }, [isLoggedIn, userToken, code]);

  const checkDeviceStatus = async (code: string) => {
    try {
      let res = await axios.post(
        `https://api.payunglah.com.my/v1/api/rental/scan/check_device_status`,
        {
          deviceName: code,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (!res.data.response) {
        alert("Device not found");
        return;
      }
        else if(res.data.response.result.value != "active"){
          Alert.alert("Device is offline", "Please try again later");
          return;
        }
      console.log(res.data.response.result.value);
    } catch (error) {
      console.log("checkDevice", error);
      Alert.alert("Error", error.response.data.message);
    }
  };

  const handleRent = async () => {
    try {
      setIsLoading(true);
      if (!isLoggedIn || !userToken) {
        Alert.alert("Error", "Please login first");
        setIsLoading(false);
        navigation.navigate("AuthScreen");
        return;
      }

      let res = await axios.post(
        `${siteUrl}/rental/scan/rent`,
        {
          deviceName: code,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      console.log(res.data);
      if (res.data.status == "failed") {
        Alert.alert("Error", res.data.message);
        setIsLoading(false);
        return;
      }
      Alert.alert("Success", "Please take your umbrella");
      console.log("Start renting");
      setIsLoading(false);
    } catch (error) {
      console.log("handleRent", error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <CustomHeader title={""} theme="light" />
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      )}
      <View style={styles.container}>
        {deviceData?.address && (
          <View>
            <Image
              source={{ uri: deviceData?.image }}
              style={{
                width,
                height: 300,
              }}
            />
            <View style={tw`p-4`}>
              <View style={[tw`flex-row items-center`]}>
                <View style={[tw` py-2`]}>
                  <View style={{}}>
                    <Text style={[fonts.h2, styles.markerTitle]}>
                      {deviceData?.title}
                    </Text>
                    <Text style={[tw`mt-1`, fonts.p, styles.markerAddress]}>
                      {deviceData.address}
                    </Text>
                  </View>
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
                  <Text style={[fonts.h3, styles.markerUnitTitle]}>
                    Available
                  </Text>
                  <Text style={[fonts.p, styles.markerUnit]}>
                    {deviceData.device.available}
                  </Text>
                </View>
                <View style={[tw`flex-1 items-center`]}>
                  <Text style={[fonts.h3, styles.markerUnitTitle]}>
                    Free Slots
                  </Text>
                  <Text style={[fonts.p, styles.markerUnit]}>
                    {deviceData.device.free_slot}
                  </Text>
                </View>
              </View>
              <View style={tw`mt-2`}>
                <Text
                  style={[
                    fonts.h2,
                    tw`mb-1`,
                    { fontSize: 16, color: colors.lightBlack },
                  ]}
                >
                  Device Overview
                </Text>
                <Text style={[fonts.p, { fontSize: 16 }]}>ID: {code}</Text>
                <Text style={[fonts.p, { fontSize: 16 }]}>Rental: RM1/hr</Text>
                <Text style={[fonts.p, { fontSize: 16 }]}>
                  First 5mins is Free
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
      <SubmitBtn
        text={"Start Rent"}
        disabled={isLoading}
        callback={handleRent}
      />
    </>
  );
};

export default RentalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
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
});
