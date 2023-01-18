import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React, { useContext } from "react";
import {
  DrawerContent,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { colors } from "../../constants/colors";
import * as Linking from "expo-linking";
import LinearGradient from "react-native-linear-gradient";
import { AuthContext } from "../../context/AuthContext";
import SvgLogo from "../../assets/svgs/payunglah_logo";
import { confirmAction } from "../../utils";
import { fonts } from "../../constants/fonts";

const CustomDrawer = (props: { navigation: any }) => {
  const { navigation } = props;
  const { userToken, userData, logout } = useContext(AuthContext);

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        scrollEnabled={false}
        {...props}
        contentContainerStyle={{
          backgroundColor: colors.primary,
          flex: 1,
        }}
      >
        <LinearGradient
          colors={[colors.primary, colors.primary]}
          style={{ flex: 1 }}
        >
          <View
            style={{
              marginHorizontal: 15,
              marginBottom: 20,
              marginTop: 20,
            }}
          >
            <SvgLogo style={{ width: "100%", height: 40 }} />
          </View>
          {userToken && (
            <>
              <DrawerItem
                label={"Profile"}
                onPress={() => {
                  navigation.navigate("ProfileScreen");
                  navigation.closeDrawer();
                }}
                labelStyle={{ color: "white", fontSize: 16 }}
              />
              <DrawerItem
                label={"Wallet"}
                onPress={() => {
                  navigation.navigate("WalletScreen");
                  navigation.closeDrawer();
                }}
                labelStyle={{ color: "white", fontSize: 16 }}
              />
              <DrawerItem
                label={"History"}
                onPress={() => {
                  navigation.navigate("RentalHistoryScreen");
                  navigation.closeDrawer();
                }}
                labelStyle={{ color: "white", fontSize: 16 }}
              />
            </>
          )}

          <DrawerItem
            label={"Guide"}
            onPress={() => navigation.navigate("HelpScreen")}
            labelStyle={{ color: "white", fontSize: 16 }}
          />
          <DrawerItem
            label={"Help"}
            onPress={() => navigation.navigate("HelpScreen")}
            labelStyle={{ color: "white", fontSize: 16 }}
          />
          {userToken && (
            <DrawerItem
              label={"Logout"}
              onPress={() =>
                confirmAction(
                  "Logout",
                  "Are you sure to logout?",
                  "Logout",
                  logout
                )
              }
              labelStyle={[fonts.h2,{ color: colors.white, fontSize: 16, 
              marginTop: 10 }]}
            />
          )}
          {/* <DrawerItemList {...props} /> */}
        </LinearGradient>
      </DrawerContentScrollView>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({});
