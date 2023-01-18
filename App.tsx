import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import RootStack from "./src/navigations/RootStack";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { socket, SocketContext } from "./src/context/SocketContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  // useEffect(() => {
  //   const loadFonts = async () => {
  //     await Font.loadAsync({
  //       'PoppinsRegular': require('./src/assets/fonts/Poppins/Poppins-Regular.ttf'),
  //       'PoppinsMedium': require('./src/assets/fonts/Poppins/Poppins-Medium.ttf'),
  //       'PoppinsSemiBold': require('./src/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  //       'PoppinsBold': require('./src/assets/fonts/Poppins/Poppins-Bold.ttf'),
  //       'PoppinsExtraBold': require('./src/assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
  //     });
  //     setFontLoaded(true);
  //   };
  //   loadFonts();
  // }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          PoppinsRegular: require("./src/assets/fonts/Poppins/Poppins-Regular.ttf"),
          PoppinsMedium: require("./src/assets/fonts/Poppins/Poppins-Medium.ttf"),
          PoppinsSemiBold: require("./src/assets/fonts/Poppins/Poppins-SemiBold.ttf"),
          PoppinsBold: require("./src/assets/fonts/Poppins/Poppins-Bold.ttf"),
          PoppinsExtraBold: require("./src/assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
        });
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        // await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <SocketContext.Provider value={socket}>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </SocketContext.Provider>
  );
};

export default App;
