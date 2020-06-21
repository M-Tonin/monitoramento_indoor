import React, {useEffect, useState } from 'react'
import { View, Text, AsyncStorage, FlatList, SafeAreaView } from 'react-native'

import axios from 'axios';

export default class index extends React.Component {
  state = {
    persons: []
  }

  componentDidMount() {
    axios.get("https://jsonplaceholder.typicode.com/users")
      .then(res => {
        const persons = res.data;
        this.setState({ persons });
      })
  }

  render() {
      const {persons} = this.state
    return (
    <SafeAreaView>
      <View>
          <FlatList
          data={persons}
          keyExtractor={({id}, index) =>id}
          renderItem={({item}) => (
            <View style={{margin:10, padding:10}}>
              <Text style={{flex:1, marginTop:2}}>{item.id} = {item.name}</Text>
              <Text style={{flex:1, marginTop:2}}>E-Mail: {item.email}</Text>
            </View>
          )}
          
          />
          
            
          
      </View>
      </SafeAreaView>
       
    
    )
  }
}