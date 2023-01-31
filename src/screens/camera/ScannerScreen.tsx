import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import CustomHeader from "../../components/header/CustomHeader";
import { height, width } from "../../utils";
import BarcodeMask from "react-native-barcode-mask";
import { colors } from "../../constants/colors";
import { fonts } from "../../constants/fonts";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";
// import * as IntentLauncher from "expo-intent-launcher";

const ScannerScreen = (props) => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [scannerMount, setScannerMount] = useState<boolean>(false)
 

  useFocusEffect(
    useCallback(() => {
      getBarCodeScannerPermissions();

      return () => {
        console.log("ScannerScreen unmounted");
        setScannerMount(false)
      };
    }, [])
  );

  const getBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if (status === "denied") {
      Alert.alert(
        "Permisssion Required",
        "Camera Access required to scan",
        [
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS == "ios") {
                Linking.openURL("app-settings://");
              } else {
                // IntentLauncher.startActivityAsync(
                //   IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
                //   {data: "package:com.dcuss.dcussapp"}
                // );
              }
            },
          },
          {
            text: "Back",
            style: "cancel",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    }
    setHasPermission(status === "granted");
    setScannerMount(true)
  };

  var width = Dimensions.get("window").width;
  var height = Dimensions.get("window").height;

  let finderWidth = width / 2;
  let finderHeight = width / 2;
  let viewMinX = (width - finderWidth) / 2;
  let viewMinY = (height - finderHeight) / 2;
  
  const handleBarCodeScanned = ({ type, data, bounds }) => {
    // Check if the scanned QR code is within the desired area
    const { origin, size } = bounds;
    const { x, y } = origin;
    const { width, height } = size;
    const isWithinArea =
      x >= viewMinX &&
      y >= viewMinY &&
      x <= viewMinX + finderWidth / 2 &&
      y <= viewMinY + finderHeight / 2;

    if (isWithinArea) {
      setScanned(true);
      console.log(data);
      if (
        data.includes("https://payunglah.com.my/qr") ||
        data.slice(0, 8) == "payunglah"
      ) {
        let code = data.includes("qr/")
          ? data.split("qr/")[1]
          : data.split("payunglah/rent/")[1];
        console.log("this is code", code);
        navigation.navigate("RentalScreen", { code });
      } else {
        alert("Invalid QR Code");
        console.log("Invalid QR Code");
        setScanned(true)
        // setScanned(false);
      }
      // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    }
  };

  if (hasPermission === null) {
    return (
      <>
        <CustomHeader theme="dark" title="Scan QR" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Requesting for camera permission</Text>
        </View>
      </>
    );
  }
  if (hasPermission === false) {
    return (
      <>
        <CustomHeader theme="dark" title="Scan QR" />
        <View
          style={{
            flex: 1,
            backgroundColor: colors.white,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
          }}
        >
          <Text style={[fonts.h2]}>No access to camera</Text>
          <Text style={[fonts.p, { textAlign: "center" }]}>
            Please enable your camera permission on setting to continue
          </Text>
        </View>
      </>
    );
  }

  if(!scannerMount){
    return (
      <>
        <CustomHeader theme="dark" title="Scan QR" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader theme="dark" title="Scan QR" />
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={[StyleSheet.absoluteFill, styles.container]}
          // barCodeTypes={[BarCodeScanner.Constants.Type.qr]}
        />
        <BarcodeMask
          edgeColor={colors.primary}
          outerMaskOpacity={0.8}
          edgeBorderWidth={0}
          showAnimatedLine={false}
          width={width / 1.5}
          height={width / 1.5}
        />
        <View
          style={{
            ...StyleSheet.absoluteFill,
            zIndex: 999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ width: width / 2, height: width / 2 }}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View style={[styles.leftTop, { flex: 1 }]} />
              <View style={{ flex: 3 }} />
              <View style={[styles.rightTop, { flex: 1 }]} />
            </View>
            <View style={{ flex: 3 }} />
            <View style={{ flex: 1, flexDirection: "row" }}>
              <View style={[styles.leftBottom, { flex: 1 }]} />
              <View style={{ flex: 3 }} />
              <View style={[styles.rightBottom, { flex: 1 }]} />
            </View>
          </View>
        </View>

        {scanned && (
          <TouchableOpacity
            onPress={() => setScanned(false)}
            style={{ zIndex: 999 }}
          >
            <Text style={{ fontSize: 18, color: colors.white }}>
              Tap to Scan Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};
const leftTop = {
  borderLeftWidth: 3,
  borderTopWidth: 3,
  borderColor: colors.primary,
};
const leftBottom = {
  borderLeftWidth: 3,
  borderBottomWidth: 3,
  borderColor: colors.primary,
};
const rightTop = {
  borderRightWidth: 3,
  borderTopWidth: 3,
  borderColor: colors.primary,
};
const rightBottom = {
  borderRightWidth: 3,
  borderBottomWidth: 3,
  borderColor: colors.primary,
};
const opacity = "rgba(0, 0, 0, .6)";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  leftTop: {
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: colors.primary,
  },
  leftBottom: {
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: colors.primary,
  },
  rightTop: {
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderColor: colors.primary,
  },
  rightBottom: {
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: colors.primary,
  },
});

export default ScannerScreen;
