import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { WebView } from 'react-native-webview';
import CustomHeader from '../../components/header/CustomHeader';

const WebviewScreen = (props) => {
  const { navigation } = props;

  useEffect(() => {
   console.log(props.route.params.url)
  }, [])
  

  return (
    <>
    <CustomHeader navigation={navigation} theme={"light"} title={"Payment"} />
    <View style={{ flex: 1 }}>
    <WebView
      source={{ uri: 'https://expo.dev'}}
      style={{ flex: 1 }}
    />
  </View>
    </>
  )
}

export default WebviewScreen

const styles = StyleSheet.create({})