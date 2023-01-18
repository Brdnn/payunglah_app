import {
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar as StatusBar2 } from "expo-status-bar";
import { AuthContext } from "../../context/AuthContext";
import { confirmAction } from "../../utils";
import SvgLogo from "../../assets/svgs/payunglah_logo";

type ThemeType = "auto" | "light" | "dark";

const HomeHeader = ({
  navigation,
  theme,
}: {
  navigation: any;
  theme: ThemeType;
}) => {
  const { isLoading, logout, userToken, userData } = useContext(AuthContext);

  return (
    <SafeAreaView style={{ backgroundColor: colors.primary }}>
      <StatusBar2 style={theme ? theme : "auto"} />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="ios-menu" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 3, alignItems: "center" }}>
          <Image source={require("../../assets/payunglah_logo_h-02-01.png")} 
          style={{ width: 150, height: 25 }}
          resizeMode="contain"
          />
          {/* <SvgLogo style={{ width: 120, height: 25 }} /> */}
        </View>
        <View style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
  },
  headerContainer: {
    backgroundColor: colors.primary,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
});
