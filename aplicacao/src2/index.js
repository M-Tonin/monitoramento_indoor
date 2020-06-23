import React, { useEffect, useState } from 'react'
import { View, Text, AsyncStorage, FlatList, SafeAreaView, TouchableOpacity } from 'react-native'

import axios from 'axios';
export default function Index() {
  const [tdOcorrencias, setTdOcorrencias] = useState([])
  useEffect(() => {
    axios.get("http://192.168.2.113:5000/dados_graph").then(res => {//obtem os dados para o grafico
      //const persons = res.data;
      //setPessoa({ persons });
      //alert(JSON.stringify(res.data));
      const ocor = res.data;
      setTdOcorrencias(ocor)

    })
    //calert(JSON.stringify(tdOcorrencias))
  }, [])
  const { ocorrencias } = tdOcorrencias;
  //alert(JSON.stringify(ocorrencias))
  return (
    <SafeAreaView>
      <View>
        <FlatList
          data={ocorrencias}
          keyExtractor={item => `${item.id_ocorrencia.toString()}`}
          renderItem={({ item }) => (
            <View style={{ margin: 10, padding: 10 }}>
              <Text style={{ flex: 1, marginTop: 2 }}>Ocorrencia: {item.id_ocorrencia}</Text>
              <Text style={{ flex: 1, marginTop: 2 }}>Dispositivo: {item.id_dispositivo}</Text>
              <Text style={{ flex: 1, marginTop: 2 }}>Temperatura: {item.vl_temperatura}</Text>
            </View>
          )}

        />
      </View>

    </SafeAreaView>
  );
}

