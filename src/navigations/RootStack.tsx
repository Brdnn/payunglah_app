import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/home/HomeScreen";
import IntroScreen from "../screens/intro/IntroScreen";

import { createDrawerNavigator } from "@react-navigation/drawer";
import AuthScreen from "../screens/auth/AuthScreen";
import MapDetailScreen from "../screens/home/MapDetailScreen";
import ScannerScreen from "../screens/camera/ScannerScreen";
import CustomDrawer from "../components/drawer/CustomDrawer";
import HelpScreen from "../screens/help/HelpScreen";
import SMSOtpScreen from "../screens/otp/SMSOtpScreen";

const Drawer = createDrawerNavigator();

const MyDrawer = () => {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} /> }>
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
  return (
    <NavigationContainer>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
