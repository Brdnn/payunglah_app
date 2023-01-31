import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar as StatusBar2 } from "expo-status-bar";
import { fonts } from "../../constants/fonts";

type ThemeType = "auto" | "light" | "dark";

const CustomHeader = ({
  title,
  theme,
}: {
  title: string;
  theme: ThemeType;
}) => {
  const navigation = useNavigation();

  const goBack = () => {
    let canGoBack = navigation.canGoBack();
    return canGoBack
      ? navigation.goBack()
      : navigation.reset({
          index: 0,
          routes: [{ name: "MyDrawer" }],
        });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar2 style={theme ? theme : "auto"} />
      <View style={styles.headerContainer}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 3, alignItems: "center" }}>
          <Text numberOfLines={1} style={[fonts.h2, styles.title]}>
            {title}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "500",
  },
});
