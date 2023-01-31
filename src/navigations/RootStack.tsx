import * as React from "react";
import { View, Text, Platform, Alert } from "react-native";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//Expo
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import HomeScreen from "../screens/home/HomeScreen";
import IntroScreen from "../screens/intro/IntroScreen";

import { createDrawerNavigator } from "@react-navigation/drawer";
import AuthScreen from "../screens/auth/AuthScreen";
import MapDetailScreen from "../screens/home/MapDetailScreen";
import ScannerScreen from "../screens/camera/ScannerScreen";
import CustomDrawer from "../components/drawer/CustomDrawer";
import HelpScreen from "../screens/help/HelpScreen";
import SMSOtpScreen from "../screens/otp/SMSOtpScreen";
import WalletScreen from "../screens/wallet/WalletScreen";
import PaymentScreen from "../screens/payment/PaymentScreen";
import ReloadScreen from "../screens/payment/ReloadScreen";
import RentalHistoryScreen from "../screens/rental/RentalHistoryScreen";
import WithdrawalScreen from "../screens/payment/WithdrawalScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import { siteUrl } from "../config/site";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useContext, useEffect, useRef } from "react";
import RentalScreen from "../screens/rental/RentalScreen";

const Drawer = createDrawerNavigator();

const MyDrawer = () => {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawer {...props} />}>
      <Drawer.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: "Home",
          // activeTintColor: "red",
        }}
      />
      <Drawer.Screen
        name="IntroScreen"
        component={IntroScreen}
        options={{
          headerShown: false,
          title: "Intro",
        }}
      />
      <Drawer.Screen
        name="HelpScreen"
        component={HelpScreen}
        options={{
          headerShown: false,
          title: "Help",
        }}
      />
    </Drawer.Navigator>
  );
};

const Stack = createNativeStackNavigator();

const RootStack = () => {
  //Notification Ref
  const notificationListener = useRef(null);
  const responseListener = useRef(null);
  const navigationRef = useNavigationContainerRef();

  const { setUserData , isLoggedIn, userToken} = useContext(AuthContext);

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
  
  // useEffect(() => {
  //   scheduleNotification()
  // }, [])
  

  useEffect(() => {
   if(isLoggedIn && userToken){
    registerForPushNotificationsAsync(userToken);
   }
  }, [isLoggedIn, userToken])
  
  useEffect(() => {
       responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          onResponseReceived
        );
      notificationListener.current =
        Notifications.addNotificationReceivedListener(_handleNotification);
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
        Notifications.removeNotificationSubscription(responseListener.current);
      };
  }, []);

  //Notification
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  //Push Notification Listener (On Clicked)
  const onResponseReceived = (response) => {
    let stackName = response.notification.request.content.data.stackName;
    let screenName = response.notification.request.content.data.screenName;
    let params = response.notification.request.content.data.params;
    let paramsValue = response.notification.request.content.data.paramsValue;
    let url = response.notification.request.content.data.url;
    let androidUrl = response.notification.request.content.data.androidUrl;

    setTimeout(() => {
      if (screenName) {
        navigationRef.current.navigate(screenName);
      } 
      if (url) {
        if (androidUrl) {
          Platform.OS == "ios"
            ? Linking.openURL(url)
            : Linking.openURL(androidUrl);
        } else {
          Linking.openURL(url);
        }
      }
    }, 1000);
  };
  //Push Notification Listener (On Received)
  const _handleNotification = (notification) => {
    let name = notification.request.content.data.name;
    let params = notification.request.content.data.params;
    let url = notification.request.content.data.url;
    let popup = notification.request.content.data.popup;
    if (popup) {
      navigationRef.current.navigate("HomeScreen");
    }
  };

  const registerForPushNotificationsAsync = async (userToken: string) => {
    let token = await SecureStore.getItemAsync("userToken");

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        // alert("Failed to get push token for push notification!");
        // Linking.openURL("app-settings://")
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync({ 
        projectId: "4459a31f-481e-41f7-8b68-b55a6481bc3d",
      })).data;

      await SecureStore.setItemAsync("pushToken", JSON.stringify(token));
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    if (token) {
      savePushToken(token, userToken);
    }
  };

  const savePushToken = async (token: string, userToken: string) => {
    try {
      let res = await axios.put(
        `${siteUrl}/user/me`,
        {
          pushToken: token,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        return false;
      }

      setUserData(res.data.data);
      return true;
    } catch (error) {
      console.log("savePushToken", error.response.data.message);
      Alert.alert("Error", error.response.data.message);
    }
  };

  const prefix = Linking.createURL("/");
  const linking = {
    prefixes: [prefix],
    // // Custom function to get the URL which was used to open the app
    // async getInitialURL() {
    //   // First, you may want to do the default deep link handling
    //   // Check if app was opened from a deep link
    //   const urlLink = await Linking.getInitialURL();

    //   if (urlLink != null) {
    //     return urlLink;
    //   }

    //   // Handle URL from expo push notifications
    //   const response = await Notifications.getLastNotificationResponseAsync();
    //   const url = response?.notification.request.content.data.url;

    //   return url;
    // },

    // // Custom function to subscribe to incoming links
    // subscribe(listener) {
    //   //Notification Listener
    //   responseListener.current =
    //     Notifications.addNotificationResponseReceivedListener(
    //       onResponseReceived
    //     );
    //   notificationListener.current =
    //     Notifications.addNotificationReceivedListener(_handleNotification);
    //   return () => {
    //     // Do something when the screen is unfocused
    //     // Useful for cleanup functions
    //     Notifications.removeNotificationSubscription(
    //       notificationListener.current
    //     );
    //     Notifications.removeNotificationSubscription(responseListener.current);
    //   };
    // },
    config: {
      screens: {
        HomeScreen: "home",
        RentalScreen: "rent/:code",
        AuthScreen: "auth",
        // SinglePollScreen: "poll/:poll_id",
        // SingleChatScreen: "chat",
        // NormalWebviewScreen: "notification/:id",
        // LoginScreen: "log",
        // PasswordlessLogin: "login/passwordless",
        // VerificationScreen: "verification",
        // BottomTabStack: {
        //   screens: {
        //     ProfileScreen: "profile",
        //   },
        // },
      },
    },
  };
  return (
    <NavigationContainer ref={navigationRef} linking={linking} >
      <Stack.Navigator>
        <Stack.Screen
          name="MyDrawer"
          component={MyDrawer}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AuthScreen"
          component={AuthScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SMSOtpScreen"
          component={SMSOtpScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="IntroScreen"
          component={IntroScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MapDetailScreen"
          component={MapDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ScannerScreen"
          component={ScannerScreen}
          options={{
            headerShown: false,
          }}
        />
         <Stack.Screen
          name="RentalScreen"
          component={RentalScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="ReloadScreen"
            component={ReloadScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="WithdrawalScreen"
            component={WithdrawalScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Group>
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Drawer.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name="WalletScreen"
            component={WalletScreen}
            options={{
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name="PaymentScreen"
            component={PaymentScreen}
            options={{
              headerShown: false,
            }}
          />
          <Drawer.Screen
            name="RentalHistoryScreen"
            component={RentalHistoryScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
