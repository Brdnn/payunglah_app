import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import CustomHeader from "../../components/header/CustomHeader";
import { AuthContext } from "../../context/AuthContext";
import { RentalType } from "../../types/Types";
import axios from "axios";
import { siteUrl } from "../../config/site";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../../constants/colors";
import { fonts } from "../../constants/fonts";
import tw from "twrnc";

const RentalHistoryScreen = (props) => {
  const { navigation } = props;
  const { userToken, userData } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rentalHistory, setRentalHistory] = useState<RentalType[]>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isMoreData, setIsMoreData] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);

  useEffect(() => {
    if (!userToken) {
      Alert.alert("Error", "Please login to continue");
      navigation.navigate("AuthScreen");
      return;
    }
  }, [userToken]);

  useFocusEffect(
    useCallback(() => {
      // Code to execute when the component gains focus
      getRentalHistory();
    }, [])
  );

  const getRentalHistory = async () => {
    try {
      setIsInitialLoading(true);
      let res = await axios.get(
        `${siteUrl}/rental/myrentals?limit=${perPage}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsInitialLoading(false);
        return;
      }
      if (res.data.data.length >= perPage) {
        setIsMoreData(true);
      }
      let dummyArr = [];

      // for (let i = 0; i < 10; i++) {
      //   let date = new Date();
      //   dummyArr.push(
      //     Object.assign({}, res.data.data[0], {
      //       id: res.data.data[0].id + i * 39,
      //       totalHours: Math.floor(Math.random() * 20 + 1),
      //       status: Math.random() < 0.5 ? "ongoing" : "completed",
      //       createdAt: date.setDate(date.getDate() + i * 23),
      //       totalPrice: Math.floor(Math.random() * 20 + 1),
      //     })
      //   );
      // }
      console.log(res.data.data.length);
      setRentalHistory(res.data.data);
      setIsInitialLoading(false);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsInitialLoading(false);
    }
  };

  const getExtraPage = async () => {
    try {
      const newPage = page + 1;
      let res = await axios.get(
        `${siteUrl}/rental/myrentals?limit=${perPage}&page=${newPage}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsLoading(false);
        return;
      }
      if (res.data.data.length < perPage) {
        setIsMoreData(false);
      }
      let dummyArr = [];

      // for (let i = 0; i < 10; i++) {
      //   let date = new Date();
      //   dummyArr.push(
      //     Object.assign({}, res.data.data[0], {
      //       id: res.data.data[0].id + i * 39,
      //       totalHours: Math.floor(Math.random() * 20 + 1),
      //       status: Math.random() < 0.5 ? "ongoing" : "completed",
      //       createdAt: date.setDate(date.getDate() + i * 23),
      //       totalPrice: Math.floor(Math.random() * 20 + 1),
      //     })
      //   );
      // }
      setPage(newPage);
      setRentalHistory([...rentalHistory, ...res.data.data]);
      // setUserBalance(res.data.data.balance);
    } catch (error) {
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isInitialLoading && !isLoading && isMoreData) {
      getExtraPage();
    }
  };

  const renderData = ({ item, index }) => {
    return (
      <View style={styles.listContainer}>
        <View style={tw`flex-row items-center justify-between`}>
          <Text style={[fonts.h2, { fontSize: 16 }]}>#{item.id}</Text>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
              backgroundColor:
                item.status == "ongoing" ? colors.success : colors.lightBlack,
            }}
          >
            <Text
              numberOfLines={2}
              style={[
                fonts.p,
                {
                  fontSize: 14,
                  color: colors.white,
                  textTransform: "capitalize",
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-1 pr-4`}>
            <Text
              numberOfLines={2}
              style={[fonts.p, { fontSize: 14, color: colors.lightGrey }]}
            >
              {item.totalHours ? item.totalHours : 0} hours @ RM{item.rate}/hr
            </Text>
            <Text style={[fonts.p, { fontSize: 14, color: colors.lightGrey }]}>
              {new Date(item.createdAt).toDateString()}{" "}
              {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
          </View>
          <View style={[tw`items-end`]}>
            <Text
              style={[
                fonts.h3,
                {
                  fontSize: 16,
                  color: colors.lightBlack,
                },
              ]}
            >
              RM
              {item?.totalPrice ? item?.totalPrice?.toFixed(2) : (0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSeparator = () => {
    return <View style={{ height: 1, backgroundColor: colors.lightWhite }} />;
  };

  return (
    <>
      <CustomHeader theme="light" title="Rental History" />
      <View>
        <FlatList
          data={rentalHistory}
          keyExtractor={(item, index) => `${item.id}-${index}}`}
          renderItem={renderData}
          ItemSeparatorComponent={renderSeparator}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      </View>
    </>
  );
};

export default RentalHistoryScreen;

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
});
