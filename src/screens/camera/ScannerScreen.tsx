import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import CustomHeader from "../../components/header/CustomHeader";
import { height, width } from "../../utils";
import BarcodeMask from "react-native-barcode-mask";
import { colors } from "../../constants/colors";

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
    const isWithinArea = x >= 40 && x + width <= 360 && y >= 40 && y + height <= 360;

    if (isWithinArea) {
      setScanned(true);
      alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <>
      <CustomHeader theme="dark" title="Scan QR" />
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={[StyleSheet.absoluteFill, styles.container]}
          barCodeTypes={[BarCodeScanner.Constants.Type.qr]}
        />
        <BarcodeMask
          edgeColor={colors.primary}
          outerMaskOpacity={0.8}
          edgeBorderWidth={0}
          showAnimatedLine={false}
          width={width / 1.5}
          height={width / 1.5}
          showAnimatedLine={false}
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
          <Button
            title={"Tap to Scan Again"}
            onPress={() => setScanned(false)}
          />
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
