import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { WebView } from "react-native-webview";
import CustomHeader from "../../components/header/CustomHeader";
import { colors } from "../../constants/colors";
import { width } from "../../utils";
import { siteUrl } from "../../config/site";
import axios from "axios";

const PaymentScreen = (props) => {
  const { navigation } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");
  const handleNavigationStateChange = (navState) => {
    if (!navState.loading) {
      if (!navState.url) {
        return;
      }

      setCurrentUrl(navState.url);
      if (currentUrl == navState.url) {
        return;
      }
      if (
        navState.url.includes(
          "https://api.payunglah.com.my/v1/api/wallet/topup/callback/success"
        )
      ) {
        let url = decodeURIComponent(navState.url);

        if (url.includes("billplz[paid]=true")) {
          Alert.alert("Success", "Payment successful");
          navigation.navigate("HomeScreen");
        } else {
          removeDueBill();
        }
      }
    }
  };

  const removeDueBill = async () => {
    try {
      setIsLoading(true);
      let res = await axios.delete(
        `${siteUrl}/wallet/bill/${props.route.params.billId}`
      );
      console.log(res.data);
      Alert.alert(
        "Payment failed",
        "There is some error with your payment, please try again"
      );
      setIsLoading(false);
      navigation.navigate("ReloadScreen");
    } catch (error) {
      Alert.alert("Payment failed", "Something went wrong");
      navigation.navigate("ReloadScreen");
    }
  };

  return (
    <>
      <CustomHeader navigation={navigation} theme={"light"} title={"Payment"} />
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        )}
        <WebView
          onLoadEnd={() => setIsLoading(false)}
          source={{ uri: props.route.params.url }}
          onNavigationStateChange={handleNavigationStateChange}
          style={{ flex: 1 }}
        />
      </View>
    </>
  );
};

export default PaymentScreen;

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
});
