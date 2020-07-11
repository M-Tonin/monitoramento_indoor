import React, { useEffect, useState } from 'react';
//import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text, TextInput, View, StyleSheet, Switch, ScrollView, Modal, LayoutAnimation, Platform, UIManager, TouchableOpacity, Image, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';


const { width, height } = Dimensions.get('window');

import Icon from 'react-native-vector-icons/FontAwesome5';
import { FlatList } from 'react-native-gesture-handler';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';

//Cores do IBTI:
// #F6A100  AMARELO
// #00919C  AZUL CLARO
// #0B7534  VERDE ESCURO
// #109F6C  VERDE CLARO

export default function Home() {
    //Inicialização das variáveis
    const [expanded, setExpanded] = useState(false); //Controla o estado dos detalhes (expanded, collapsed)
    const [frequencyCounterC, setFrequencyCounterC] = useState(0);
    const [frequencyCounterD, setFrequencyCounterD] = useState(0);
    const [frequencyCounterU, setFrequencyCounterU] = useState(0);
    const [graphData, setGraphData] = useState([]);
    const [dados, setDados] = useState();
    const [URD1, setURD1] = useState([]);
    const [URD2, setURD2] = useState([]);
    const [devices, setDevices] = useState([]);
    const [modalVisible, setModalVisible] = useState(false); //Define o modal como visivel ou não
    const [ultimaTemperatura, setUltimaTemperatura] = useState();
    const [horaRegistrada, setHoraRegistrada] = useState();
    const [diferencaTemperatura, setDiferencaTemperatura] = useState();
    const [diferencaMin, setDiferencaMin] = useState();

    const teste = {
        labels: [
            "01:00",
            "02:00",
            "03:00"
        ],
        datasets: [
            {
                data: [0, 1, 2],
                strokeWidth: 2
            }
        ]
    }

    //const [isEnabled, setIsEnabled] = useState(false);
    //const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    //Para funcionar no Android sem bugs, no iOS já funciona corretamente
    if (Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    function loadInitData() {
        axios.get('http://192.168.15.140:5000/devices_v3')
            .then(response => {
                //alert(JSON.stringify(response.data));
                const { dispositivos } = response.data;
                const { ultTempHoraRegistrada } = response.data;
                const { diferencaTemperatura } = response.data;
                const { diferencaMin } = response.data;
                setUltimaTemperatura(ultTempHoraRegistrada.ultimaTemperatura);
                setHoraRegistrada(ultTempHoraRegistrada.horaRegistrada);
                setDiferencaTemperatura(diferencaTemperatura);
                setDiferencaMin(diferencaMin);

                //alert(JSON.stringify(dispositivos));
                setDevices([]);
                dispositivos.forEach((disp) => {
                    //alert(JSON.stringify(disp));
                    let list = {
                        key: disp.idDispositivo,
                        //name: 'Dispositivo ' + disp.idDispositivo, 
                        name: disp.nomeDispositivo,
                        local: disp.localDispositivo,
                        expanded: false,
                        lightState: disp.statusLuminosidade == 1 ? true : false,
                        dadosDispositivo: []
                    }
                    setDevices(oldArray => [...oldArray, list]);
                })
            })
            .catch(error => {
                alert("ERRO: " + JSON.stringify(error));
            })
            //alert("Devices: " + JSON.stringify(devices));
    }

    //Função que realiza a troca do estado dos detalhes do dispositivo, bem como tipo de animação realizada na troca de estado
    function changeLayout(searchKey) {
        let expand; //Variável que vai receber a mudança do estado, e inserir no novo array
        let devicesUpdated = []; //Novo Array de dispositivos que substituirá o array inicial, com os estados dinamicamente alterados
        devices.forEach((device) => { //Laço para percorrer todos os dispositivos existentes
            if (device.key === searchKey) { //Se a a chave recebida for igual a lida atualmente, inverte o estado do dispositivo atual
                expand = !device.expanded;
                if (device.expanded === false) {
                    getFrequency(1);
                    loadDataForGraphic();
                    if (dados != null && dados != undefined){
                        var graphicComponent = (
                            <LineChart
                                fromZero
                                renderDotContent={({ x, y, index }) => <Text style={{ position: "absolute", top: y - 25, left: x - 10, borderRadius: 100, width: 50, height: 20, textAlign: "center", textAlignVertical: "center" }}>{dados ? dados.datasets[0].data[index] : ""}</Text>}
                                yAxisSuffix="°C"
                                verticalLabelRotation={90}
                                data={dados ? dados : []}
                                //data={teste}
                                width={Dimensions.get("window").width + (3 * 20)}
                                height={400}
                                chartConfig={{
                                    backgroundColor: '#1CC910',
                                    backgroundGradientFrom: '#EFF3FF',
                                    backgroundGradientTo: '#EFEFEF',
                                    color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
                                    style: { borderRadius: 16 },
    
                                }}
                                style={{ marginVertical: 8, borderRadius: 16 }}
                            >
    
    
                            </LineChart>
                        );
                    }
                    else{
                        var graphicComponent = [];
                    }
                    
                    //alert(JSON.stringify(graphData))
                }
            }
            else {//Se a chave não for igual, o estado deve ser false, para que apenas 1 dropdown esteja aberto por vez
                expand = false;
                var graphicComponent = [];
            }

            let list = { //Cada dispositivo será alterado como necessitar
                key: device.key,
                name: device.name,
                local: device.local,
                expanded: expand,
                lightState: device.lightState,
                dadosDispositivo: graphicComponent
            }
            devicesUpdated.push(list); //Insere cada dispostivo no novo Array de dispositivos
        });
        setDevices(devicesUpdated); //Altera o array antigo, com o array novo, garantindo o funcionamento do dropdown para todos os dispositivos
        //alert(JSON.stringify(devicesUpdated));


        //alert(key);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        //let expand = !expanded; //Pegamos o oposto do valor atual de expanded, para abrir se estiver fechada, e fechar se estiver aberta
        //setExpanded(expand); //Passamos o novo valor para a expanded
        setFrequencyCounterC(0);
        setFrequencyCounterD(0);
        setFrequencyCounterU(0);
    }

    //Função que aumenta a frequência
    function moreFrequency(btnCaller) {
        if (btnCaller === 1) {
            if ((frequencyCounterC + 1) < 10) {
                let freq = frequencyCounterC + 1;
                setFrequencyCounterC(freq);
            }
        }
        else {
            if (btnCaller === 2) {
                if ((frequencyCounterD + 1) < 10) {
                    let freq = frequencyCounterD + 1;
                    setFrequencyCounterD(freq);
                }
            }
            else {
                if (btnCaller === 3) {
                    if ((frequencyCounterU + 1) < 10) {
                        let freq = frequencyCounterU + 1;
                        setFrequencyCounterU(freq);
                    }
                }
            }
        }

    }

    //Função que diminui a frequência
    function lessFrequency(btnLess) {
        if (btnLess === 1) {
            if ((frequencyCounterC - 1) > -1) {
                let freq = frequencyCounterC - 1;
                setFrequencyCounterC(freq);
            }
        }
        else {
            if (btnLess === 2) {
                if ((frequencyCounterD - 1) > -1) {
                    let freq = frequencyCounterD - 1;
                    setFrequencyCounterD(freq);
                }
            }
            else {
                if (btnLess === 3) {
                    if ((frequencyCounterU - 1) > -1) {
                        let freq = frequencyCounterU - 1;
                        setFrequencyCounterU(freq);
                    }
                }
            }

        }

    }


    //Função que envia comando para atualização da frequência de envio dos dados pelo dispositivo
    function updateFrequency(keyDevice) {
        const newFrequency = frequencyCounterC.toString() + frequencyCounterD.toString() + frequencyCounterU.toString()//junta os valores de centena, dezena e unidade, formando o valor inteiro da nova frequência.
        const params = {//JSON com os dados para a atualização da frequência
            key: keyDevice,//indica qual dispositivo será atualizado
            frequencia: parseInt(newFrequency)//nova frequência do dispositivo

        }
        //requisição de atualização
        axios.post("http://192.168.15.140:5000/updateFreq", params).then(response => {
            if (response.data.success) {
                alert(JSON.stringify(response));
            }
        }).catch(error => { alert(JSON.stringify(error)) });
        //alert("A frequência do " +  teste.nome + " foi alterada para " + teste.data + "!" + teste.hora);

    }
    //função para obter o valor atual da frequência do dispositivo informado
    function getFrequency(key) {
        const params = {//JSON com os dados para consulta
            keyDevice: key
        }
        //requisição para obter o valor da frequência
        axios.post("http://192.168.15.140:5000/frequency", params).then(response => {
            let ar = response.data.frequenciaDoDispositivo.toString().split("");//recebe o valor da frequência atual divida casa por casa (CDU)
            //se o valor da frequência for composto por três casas, salva os valores na suas respectivas variáveis
            if (ar.length === 3) {
                setFrequencyCounterC(ar[0]);
                setFrequencyCounterD(ar[1]);
                setFrequencyCounterU(ar[2]);
            }
            else {//se for composto por duas casas, define a centena como 0 e salva a dezena e a unidade nas respectivas variáveis.
                if (ar.length === 2) {
                    setFrequencyCounterC(0)
                    setFrequencyCounterD(ar[0]);
                    setFrequencyCounterU(ar[1]);
                }
                else {//se for composto por uma casa, define a centena e a dezena como 0 e a salva a unidade na sua variável.
                    if (ar.length === 1) {
                        setFrequencyCounterC(0)
                        setFrequencyCounterD(0)
                        setFrequencyCounterU(ar[0])
                    }
                    else {
                        alert("Opção não cadastrada!")
                    }
                }
            }
        }).catch(error => { alert(JSON.stringify(error)) })
    }

    function loadDataForGraphic() {
        axios.get("http://192.168.15.140:5000/dados_graph")
            .then(response => {
                setGraphData(response.data);
                alert(JSON.stringify(graphData));

                const { ultimoRegDips1 } = graphData; //desconstrói recebendo o último valor do dispositivo 1
                const { ultimoRegDips2 } = graphData; //desconstrói recebendo o último valor do dispositivo 2
                setURD1(ultimoRegDips1); //Salva na state o último valor registrado do dispositivo 1
                setURD2(ultimoRegDips2); //Salva na state o último valor registrado do dispositivo 2

                //alert(JSON.stringify(graphData));
                const { ocorrencias: dataForGraphic } = graphData;
                //alert(JSON.stringify(dataForGraphic));

                let hr_ocorrencia = [], dt_ocorrencia = [], vl_temperatura = [];

                dataForGraphic.map((num) => {
                    hr_ocorrencia.push(num.hr_ocorrencia + " " + num.dt_ocorrencia);
                    //hr_ocorrencia.push(num.hr_ocorrencia);
                    //dt_ocorrencia.push(num.dt_ocorrencia);
                    vl_temperatura.push(num.vl_temperatura);
                });

                let graphicData = {
                    labels: hr_ocorrencia,
                    datasets: [{ data: vl_temperatura, strokeWidth: 2 }]
                }
                setDados(graphicData);
            })
            .catch(error => {
                alert("ERRO:" + JSON.stringify(error))
            })
    }

    useEffect(() => {
        loadInitData();
    }, [])



    return (
        // Container de toda a aplicação
        <View style={{ height: '100%', width: '100%' }}>
            {/* O Gradient abaixo deixa o fundo em degradê, nas cores indicadas pela prop 'colors' */}
            <LinearGradient
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={['#00AB98', '#007266']}>


                {/* Uma ScrollView que ocupará quase todo o restante da página, onde serão listados os dispositivos */}
                <ScrollView style={{ height: '82.5%', marginTop: 15 }}>
                    {/* Este FlatList renderizará todos os dispositivos cadastrados de acordo com a necessidade (usuário vai scrollando, vai carregando mais, caso haja) */}
                    <FlatList
                        contentContainerStyle={{ height: '100%', width: 1.0 * width }}
                        data={devices}
                        renderItem={({ item }) => (
                            // Componente que será renderizado, para cada dispositivo cadastrado
                            <View style={{ alignItems: "center" }}>
                                {/* Os dispositivos serão exibidos em botões */}
                                <TouchableOpacity style={{ height: 50, width: 0.95 * width, flexDirection: "row", borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomRightRadius: item.expanded ? 0 : 5, borderBottomLeftRadius: item.expanded ? 0 : 5, backgroundColor: '#FFF', shadowColor: '#000', elevation: 10 }} onPress={() => { changeLayout(item.key) }}>
                                    {/* Os botões terão um Gradient também */}
                                    <LinearGradient
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        colors={['#F28705', '#F2E205']}
                                        style={{ borderRadius: 5, width: '100%', flexDirection: "row", alignItems: "center" }}
                                    >
                                        {item.expanded ? //Se o item estiver expandido, mostra o ícone seta para cima
                                            (<Icon style={{ marginLeft: 5 }} name="chevron-up" size={20} color={'#FFF'}></Icon>)
                                            :
                                            //Se não, mostra o ícone seta para baixo 
                                            (<Icon style={{ marginLeft: 5 }} name="chevron-down" size={20} color={'#FFF'}></Icon>)
                                        }
                                        {/* Exibe o nome do dispositivo */}
                                        <Text style={{ marginLeft: 5, color: '#FFF', fontSize: 17, fontWeight: "bold" }}>{item.name}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                {/* Fim do botão que abre e fecha os detalhes do dispositivo */}

                                {/* Container para exibir os detalhes do dispositivo quando o usuário clicar sobre seu botão */}
                                <View style={{ height: item.expanded ? 750 : 0, width: 0.95 * width, overflow: "hidden", marginBottom: 15, backgroundColor: '#FFF' }}>
                                    <Text style={{ paddingLeft: 15, paddingTop: 15 }}>Nome do dispositivo: <Text style={{ fontWeight: "bold" }}>{item.name}</Text></Text>
                                    <Text style={{ paddingLeft: 15 }}>Local: <Text style={{ fontWeight: "bold" }}>{item.local}</Text> </Text>
                                    <Text style={{ paddingLeft: 15 }}>Última Temperatura Registarda: <Text style={{ fontWeight: "bold" }}>{ultimaTemperatura}°C</Text></Text>
                                    <View style={{ flexDirection: "row", width: 0.95 * width, alignItems: "center", justifyContent: "flex-end", padding: 20 }}>
                                        <Icon name="lightbulb" size={20}></Icon>
                                        {/* O Switch abaixo funcionará apenas para exibir o estado da luz (Apagada/Ligada), não podendo ser alterado pelo usuário */}
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#00AB98" }} //Cores do 'caminho' da bolinha do Switch
                                            thumbColor={item.lightState ? "#03A63C" : "#f4f3f4"} //Cores da bolinha do Switch
                                            ios_backgroundColor="#3e3e3e"
                                            //onValueChange={toggleSwitch}
                                            disabled={true} //Desabilita a possibilidade do usuário interagir com o Switch
                                            value={item.lightState} //O valor dele, vem do fato do dispositivo estar ligado ou não (informação do DB)
                                        />
                                    </View>
                                    {/* Gráfico para exemplificar design */}
                                    <View style={{ width: '90%', height: 400, marginLeft: '5%', alignItems: "center", justifyContent: "center", borderWidth: 0.2, borderColor: '#777' }}>
                                        <ScrollView horizontal={true} style={{ height: 220 }} contentContainerStyle={{ borderWidth: 1 }}>
                                            {teste ?
                                                (
                                                    <>
                                                        {item.dadosDispositivo}
                                                    </>
                                                )
                                                :
                                                (
                                                    <>
                                                        <Text>Não há dados registrados</Text>
                                                    </>


                                                )
                                            }
                                        </ScrollView>
                                    </View>

                                    {/* Container para a área dos botões */}
                                    <View style={{ width: '100%', flexDirection: 'row' }}>
                                        <View style={{ flexDirection: "row", height: 160, width: '50%', marginTop: 15, justifyContent: "flex-end", alignItems: 'center' }}>

                                            {/* Botão para salvar a nova frequência */}
                                            <TouchableOpacity onPress={() => { updateFrequency(item.key) }}>
                                                {/* Deixa o botão de salvar em Gradient */}
                                                <LinearGradient
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                    colors={['#03A63C', '#00AB98']}
                                                    style={{ width: 50, height: 50, alignItems: "center", justifyContent: "center", marginRight: 15, padding: 10, backgroundColor: '#0B7534', borderRadius: 5 }}>
                                                    {/* Ícone de buzina para simbolizar comando de mandar o buzzer apitar */}
                                                    <Icon name="save" color={'#FFF'} size={25}></Icon>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ flexDirection: "row", height: 160, width: '50%', marginTop: 15, justifyContent: "flex-end", alignItems: 'center', justifyContent: 'center' }}>
                                            {/* Botões de + e - para aumentar ou diminuir a frequência de envio das informações pelo dispositivo */}
                                            <View style={{ flexDirection: "column" }}>
                                                {/* Botão de aumentar frequência */}
                                                <TouchableOpacity style={{ width: 50, height: 50, alignItems: "center", justifyContent: "center", padding: 5, borderWidth: 1, borderLeftWidth: 0, borderColor: '#0B7534', backgroundColor: '#0B7534' }} onPress={() => { moreFrequency(1) }}>
                                                    <Icon name="plus" color={'#FFF'} size={15}></Icon>
                                                </TouchableOpacity>

                                                {/* Exibe o valor atual da frequência de envio */}
                                                <Text style={{ fontSize: 15, textAlign: "center", textAlignVertical: "center", width: 50, height: 50, borderWidth: 1, borderColor: '#999' }}>{frequencyCounterC}</Text>

                                                {/* Botão de diminuir frequência */}
                                                <TouchableOpacity style={{ width: 50, height: 50, alignItems: "center", justifyContent: "center", padding: 5, borderWidth: 1, borderRightWidth: 0, borderColor: '#D9534F', backgroundColor: '#D9534F' }} onPress={() => { lessFrequency(1) }}>
                                                    <Icon name="minus" color={'#FFF'} size={15}></Icon>
                                                </TouchableOpacity>
                                            </View>

                                            {/* Botões de + e - para aumentar ou diminuir a frequência de envio das informações pelo dispositivo */}
                                            <View style={{ flexDirection: "column", marginLeft: 10 }}>
                                                {/* Botão de aumentar frequência */}
                                                <TouchableOpacity style={{ width: 50, height: 50, alignItems: "center", justifyContent: "center", padding: 5, borderWidth: 1, borderLeftWidth: 0, borderColor: '#0B7534', backgroundColor: '#0B7534' }} onPress={() => { moreFrequency(2) }}>
                                                    <Icon name="plus" color={'#FFF'} size={15}></Icon>
                                                </TouchableOpacity>
                                                {/* Exibe o valor atual da frequência de envio */}
                                                <Text style={{ fontSize: 15, textAlign: "center", textAlignVertical: "center", width: 50, height: 50, borderWidth: 1, borderColor: '#999' }}>{frequencyCounterD}</Text>
                                                {/* Botão de diminuir frequência */}
                                                <TouchableOpacity style={{ width: 50, height: 50, alignItems: "center", justifyContent: "center", padding: 5, borderWidth: 1, borderRightWidth: 0, borderColor: '#D9534F', backgroundColor: '#D9534F' }} onPress={() => { lessFrequency(2) }}>
                                                    <Icon name="minus" color={'#FFF'} size={15}></Icon>
                                                </TouchableOpacity>
                                            </View>

                                            {/* Botões de + e - para aumentar ou diminuir a frequência de envio das informações pelo dispositivo */}
                                            <View style={{ flexDirection: "column", marginLeft: 10 }}>
                                                {/* Botão de aumentar frequência */}
                                                <TouchableOpacity style={{ width: 50, height: 50, alignItems: "center", justifyContent: "center", padding: 5, borderWidth: 1, borderLeftWidth: 0, borderColor: '#0B7534', backgroundColor: '#0B7534' }} onPress={() => { moreFrequency(3) }}>
                                                    <Icon name="plus" color={'#FFF'} size={15}></Icon>
                                                </TouchableOpacity>
                                                {/* Exibe o valor atual da frequência de envio */}
                                                <Text style={{ fontSize: 15, textAlign: "center", textAlignVertical: "center", width: 50, height: 50, borderWidth: 1, borderColor: '#999' }}>{frequencyCounterU}</Text>
                                                {/* Botão de diminuir frequência */}
                                                <TouchableOpacity style={{ width: 50, height: 50, alignItems: "center", justifyContent: "center", padding: 5, borderWidth: 1, borderRightWidth: 0, borderColor: '#D9534F', backgroundColor: '#D9534F' }} onPress={() => { lessFrequency(3) }}>
                                                    <Icon name="minus" color={'#FFF'} size={15}></Icon>
                                                </TouchableOpacity>
                                            </View>


                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                        keyExtractor={item => item.id}
                    ></FlatList>
                </ScrollView>
                <View style={{ height: '7.5%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Icon name="not-equal" color={"#FFF"} size={16}></Icon>
                        <Text style={{ color: '#fff', marginLeft: 5 }}><Text style={{ fontWeight: "bold" }}>{diferencaTemperatura}°C</Text></Text>
                    </View>
                    <Text style={{ color: '#fff' }}>Última atualização às: <Text style={{ fontWeight: 'bold' }}>{horaRegistrada}({ultimaTemperatura}°C)</Text></Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({

});