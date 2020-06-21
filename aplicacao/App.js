import React from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";

import { LineChart, YAxis, XAxis, Grid } from "react-native-svg-charts";
import { G, Line } from "react-native-svg";
import * as shape from "d3-shape";
import * as scale from "d3-scale";
import moment from "moment";


const data = [//arraya com as informações do gráfico
  {
    value: 50,
    date: new Date(2018, 0, 1, 2)
  },
  {
    value: 0,
    date: new Date(2018, 0, 1, 9)
  },
  {
    value: 150,
    date: new Date(2018, 0, 1, 10)
  },
  {
    value: 10,
    date: new Date(2018, 0, 1, 13)
  },
  {
    value: 100,
    date: new Date(2018, 0, 1, 21)
  },
  {
    value: 20,
    date: new Date(2018, 0, 2, 0)
  },
  {
    value: 115,
    date: new Date(2018, 0, 2, 8)
  },
  {
    value: 75,
    date: new Date(2018, 0, 2, 10)
  },
  {
    value: 25,
    date: new Date(2018, 0, 2, 16)
  },
  {
    value: 125,
    date: new Date(2018, 0, 2, 17)
  },
  {
    value: 66,
    date: new Date(2018, 0, 2, 19)
  },
  {
    value: 85,
    date: new Date(2018, 0, 2, 23)
  }
];

export default class ChartTest extends React.Component {
  renderChart() {
    const xAxisHeight = 35; //espaçamento entre as linhas horinzontais
    const verticalContentInset = { top: 10, bottom: 10 }; //ajusta a altura do gráfico top 10 > faz com ele retroceda do topo  bottom 10 > faz com que ele retroceda de baixo

    return (
      <View style={{ height: 250, padding: 20, width: "90%", flexDirection: "row" }}>{/*tamanho, altura e direção do gráfico */}
        <YAxis
          style={{ marginBottom: xAxisHeight }}
          data={data}
          contentInset={verticalContentInset}
          yAccessor={({ item }) => item.value}
          xAccessor={({ item }) => item.date}
          svg={{
            fill: "#FFFFFF"
          }}
          numberOfTicks={15}//numeros na vertical, define a quantidade de quanto em quanto ele deve ir
          formatLabel={value => `${value} ºC`}//valor que serão recebidos
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <LineChart
            style={{ flex: 1 }}
            data={data}
            contentInset={verticalContentInset}
            yAccessor={({ item }) => item.value}
            xAccessor={({ item }) => item.date}
            svg={{
              stroke: "#81B0C0"
            }}
            scale={scale.scaleTime}
            numberOfTicks={10}//define a quantidade de linhas na horinzontal, 10 > serão varias linhas
          >
            <Grid belowChart={true} svg={{ stroke: "#FFF" }} />
          </LineChart>
          <XAxis
            data={data}
            svg={{
              fill: "#FFFFFF",
              fontSize: 8,//tamanho do horário na horinzontal
              fontWeight: "bold",//formatação do texto de como ele será exibido
              rotation: 90,//rotação é quanto os valores irão ficar inclinados
              originY: 20,//o quanto será espaçado do eixo Y
              y: 0//distância de cima para baixo dos valores da horizontal
            }}
            xAccessor={({ item }) => item.date}
            scale={scale.scaleTime}
            numberOfTicks={30}//muda os valores na horizontal, almentando a quantidade
            style={{ marginHorizontal: -10, height: xAxisHeight }}
            contentInset={verticalContentInset}
            formatLabel={value => moment(new Date(value)).format("HH:mm")}//define o formato dos valores, neste caso as horas 
          />
        </View>
      </View>
    );
  }
  render() {
    //alert(JSON.stringify(data));
    return (
      <View style={styles.container}>{this.renderChart()}
        <View>
          <Text style={{color: "#FFF"}}>{JSON.stringify(data)}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#343334",
    alignItems: "center",
    justifyContent: "center"
  }
});