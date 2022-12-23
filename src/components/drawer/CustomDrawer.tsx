import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  DrawerContent,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { colors } from "../../constants/colors";
import * as Linking from "expo-linking";
import LinearGradient from "react-native-linear-gradient";

const CustomDrawer = (props: { navigation: any; }) => {
  const { navigation } = props;

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
          colors={[colors.primary, colors.quaternary]}
          style={{ flex: 1 }}
        >
          <View
            style={{ marginHorizontal: 15, marginBottom: 20, marginTop: 20 }}
          >
            <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>
              PayungLah
            </Text>
          </View>
          <DrawerItem
            label={"Payment and Credit"}
            onPress={() => navigation.navigate("HelpScreen")}
            labelStyle={{ color: "white", fontSize: 16 }}
          />
          <DrawerItem
            label={"History"}
            onPress={() => navigation.navigate("HelpScreen")}
            labelStyle={{ color: "white", fontSize: 16 }}
          />
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
          {/* <DrawerItemList {...props} /> */}
        </LinearGradient>
      </DrawerContentScrollView>
    </View>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({});
