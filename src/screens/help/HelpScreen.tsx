import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/header/CustomHeader'

const HelpScreen = (props) => {
    const { navigation } = props;
  return (
   <>
   <CustomHeader theme="dark" title='Help' />
   <View>
      <Text>HelpScreen</Text>
    </View>
   </>
  )
}

export default HelpScreen

const styles = StyleSheet.create({})