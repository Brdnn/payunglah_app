import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import CustomHeader from "../../components/header/CustomHeader";
import { height, width } from "../../utils";
import BarcodeMask from "react-native-barcode-mask";
import { colors } from "../../constants/colors";
import { fonts } from "../../constants/fonts";

const ScannerScreen = (props) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data, bounds }) => {
    // Check if the scanned QR code is within the desired area
    const { origin, size } = bounds;
    const { x, y } = origin;
    const { width, height } = size;
    const isWithinArea =
      x >= 40 && x + width <= 360 && y >= 40 && y + height <= 360;

    if (isWithinArea) {
      setScanned(true);
      alert(`Bar code with type ${type} and data ${data} has been scanned!`);
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
