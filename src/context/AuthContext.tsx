import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { dummy_userData } from "../config/data";
import { siteUrl } from "../config/site";
import { Alert } from "react-native";
import { SocketContext } from "./SocketContext";

export const AuthContext = createContext(null);

type UserData = {
  username: string;
  phone: string;
  wallet: number;
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string>(null);
  const [userData, setUserData] = useState<UserData>(null);
  const socket = useContext(SocketContext);

  const login = async (token: string) => {
    try {
      setIsLoading(true);
      let res = await axios.get(`${siteUrl}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(res.data);
      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        setIsLoading(false);
        setIsLoggedIn(false);
        return;
      }
      await SecureStore.setItemAsync("userToken", JSON.stringify(token));
      setUserToken(token);
      setUserData(res.data.data);
      setIsLoggedIn(true);
      socket.emit("user_connected", { userId: res.data.data.id });
      setIsLoading(false);
    } catch (error) {
      console.log("login", error);
      setIsLoading(false);
      setIsLoggedIn(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await SecureStore.deleteItemAsync("userToken");
      setUserToken(null);
      setUserData(null);
      setIsLoading(false);
      setIsLoggedIn(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const checkLogin = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync("userToken");
      console.log("checkLogin", token);
      if (!token) {
        setIsLoading(false);
        return;
      }

      let res = await axios.get(`${siteUrl}/user/me`, {
        headers: { Authorization: `Bearer ${JSON.parse(token)}` },
      });

      if (!res.data?.data) {
        Alert.alert("Error", "Something went wrong");
        await SecureStore.deleteItemAsync("userToken");
        setUserToken(null);
        setUserData(null);
        setIsLoading(false);
        setIsLoggedIn(false);
        return;
      }
      console.log("Logged In", JSON.parse(token));
      setIsLoggedIn(true);
      setUserToken(JSON.parse(token));
      setUserData(res.data.data);
      socket.emit("user_connected", { userId: res.data.data.id });
      setIsLoading(false);
      return res.data.data
    } catch (error) {
      console.log("checkLogin", error);
      setUserToken(null);
      setUserData(null);
      setIsLoading(false);
      setIsLoggedIn(false);
      return false
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{ login, logout, isLoggedIn, isLoading, userToken, userData, checkLogin, setUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};
