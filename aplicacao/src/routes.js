import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, HeaderTitle } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient'; 
import { Image, Text } from 'react-native';
import Icom from 'react-native-vector-icons/FontAwesome5';

const HomeStack = createStackNavigator();

import HomePage from './Pages/Home';

export default function HomeNavigator(route) {
	return (
		<NavigationContainer>
			<HomeStack.Navigator initialRouteName="Home" headerMode="screen">
				<HomeStack.Screen name="HomePage" component={HomePage} options={{
					headerShown: true,
					headerRight:() =>(
						<Image style={{height:50,width:50}} source={require('./assets/images/IBTI-Tratado.png')}></Image>
					),
					headerLeft:() =>(
						<Image style={{height:50,width:50}} source={require('./assets/images/IBTI-Tratado.png')}></Image>
					),
					headerTitle: props => <Text style={{fontSize: 18}}>Monitoramento Indoor</Text>,
					headerTitleAlign: 'center',
					headerStyle:{
						backgroundColor: '#FFF'
					}
				}}></HomeStack.Screen>
			</HomeStack.Navigator>
		</NavigationContainer>
	);
}