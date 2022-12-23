import { StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomHeader from "../../components/header/CustomHeader";
import { colors } from "../../constants/colors";

type MapDetail = {
  title: string;
  address: string;
  image: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

const MapDetailScreen = (props) => {
  let mapDetail: MapDetail = props.route.params;
  return (
    <>
      <CustomHeader theme="light" title={"Road Guide"} />
      <View style={{padding: 20}}>
        <Text style={styles.title} >{mapDetail.title}</Text>
        <Text style={styles.address}>{mapDetail.address}</Text>
      </View>
    </>
  );
};

export default MapDetailScreen;

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    address: {
        fontSize: 16,
        color: colors.lightBlack,
    }
    
});
