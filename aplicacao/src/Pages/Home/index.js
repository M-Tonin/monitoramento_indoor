import React, { useEffect, useState } from 'react';
//import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text, TextInput, View, StyleSheet, Switch, ScrollView, Modal, LayoutAnimation, Platform, UIManager, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
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

export default function Home({ navigation }) {
    const [devices, setDevices] = useState();
    const [expanded, setExpanded] = useState(false); //Controla o estado dos detalhes (expanded, collapsed)
    const [ocorrencias, setOcorrencias] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const [temperatura, setTemperatura] = useState();
    const [horaRegistrada, setHoraRegistrada] = useState();
    const [dataRegistro, setDataRegistro] = useState();
    const [diferencaTemperatura, setDiferencaTemperatura] = useState();

    const [frequencyCounterC, setFrequencyCounterC] = useState(0);
    const [frequencyCounterD, setFrequencyCounterD] = useState(0);
    const [frequencyCounterU, setFrequencyCounterU] = useState(0);

    function readDevices() {
        alert(JSON.stringify(devices));
    }

    function testeConnection() {
        try {
            axios.get('http://a65175939246.ngrok.io/devices')
                .then(response => {
                    alert(JSON.stringify(response.data));
                })
                .catch(error => {
                    alert(JSON.stringify(error));
                })
        } catch (error) {
            alert(JSON.stringify(error))
        }
    }

    async function getDevices() {
        setDevices([]);
        await axios.get('http://a65175939246.ngrok.io/devices')
            .then(response => {
                //alert(JSON.stringify(response.data));
                setTemperatura(response.data.ultimaTemperatura.temperatura);
                setHoraRegistrada(response.data.ultimaTemperatura.horaRegistrada);
                setDataRegistro(response.data.ultimaTemperatura.dataRegistro);
                //alert("DATA: " + response.data.ultimaTemperatura.dataRegistro);

                if (response.data.diferencaTemperatura != null) {
                    setDiferencaTemperatura(response.data.diferencaTemperatura);
                }
                else {
                    setDiferencaTemperatura(null);
                }
                //setDiferencaTemperatura(10);

                setDevices([]);
                response.data.dispositivos.forEach((disp) => {
                    //alert(JSON.stringify(disp));
                    let list = {
                        key: disp.idDispositivo,
                        //name: 'Dispositivo ' + disp.idDispositivo, 
                        name: disp.nomeDispositivo,
                        local: disp.localDispositivo,
                        expanded: false,
                        lightState: disp.statusLuminosidade == 1 ? true : false,
                        chartComponent: []
                    }
                    setDevices(oldArray => [...oldArray, list]);
                })
                //setDevices(response.data.dispositivos);
            })
            .catch(error => {
                alert("Erro na requisição getDevices: " + JSON.stringify(error));
            });
    }

    function getFrequency(frequency) {
        let ar = frequency.toString().split("");//recebe o valor da frequência atual divida casa por casa (CDU)
        //se o valor da frequência for composto por três casas, salva os valores na suas respectivas variáveis
        if (ar.length === 3) {
            setFrequencyCounterC(parseInt(ar[0]));
            setFrequencyCounterD(parseInt(ar[1]));
            setFrequencyCounterU(parseInt(ar[2]));
        }
        else {//se for composto por duas casas, define a centena como 0 e salva a dezena e a unidade nas respectivas variáveis.
            if (ar.length === 2) {
                setFrequencyCounterC(0)
                setFrequencyCounterD(parseInt(ar[0]));
                setFrequencyCounterU(parseInt(ar[1]));
            }
            else {//se for composto por uma casa, define a centena e a dezena como 0 e a salva a unidade na sua variável.
                if (ar.length === 1) {
                    setFrequencyCounterC(0);
                    setFrequencyCounterD(0);
                    setFrequencyCounterU(parseInt(ar[0]));
                }
                else {
                    alert("Opção não cadastrada!");
                }
            }
        }
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
            id_dispositivo: keyDevice,//indica qual dispositivo será atualizado
            nova_frequencia: parseInt(newFrequency)//nova frequência do dispositivo

        }
        //requisição de atualização
        axios.post("http://a65175939246.ngrok.io/updateFreq", params).then(response => {
            if (response.data.success) {
                alert('Frequência alterada com sucesso!');
            }
        }).catch(error => { alert(JSON.stringify(error)) });
        //alert("A frequência do " +  teste.nome + " foi alterada para " + teste.data + "!" + teste.hora);

    }

    function changeLayout(searchKey, graphicData) {
        //alert('INICIANDO: ' + JSON.stringify(graphicData));
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        let expand; //Variável que vai receber a mudança do estado, e inserir no novo array
        let devicesUpdated = []; //Novo Array de dispositivos que substituirá o array inicial, com os estados dinamicamente alterados
        devices.forEach((device) => { //Laço para percorrer todos os dispositivos existentes
            var graphicComponent;
            if (device.key === searchKey) { //Se a a chave recebida for igual a lida atualmente, inverte o estado do dispositivo atual
                expand = !device.expanded;
                if (device.expanded === false) {
                    if (graphicData != null && graphicData != undefined) {
                        //alert("UHUUUUL: " + JSON.stringify(graphicData));
                        graphicComponent = (
                            <LineChart
                                fromZero
                                renderDotContent={({ x, y, index }) => <Text style={{ position: "absolute", top: y - 25, left: x - 10, borderRadius: 100, width: 50, height: 20, textAlign: "center", textAlignVertical: "center" }}>{graphicData ? graphicData.datasets[0].data[index] : ""}</Text>}
                                yAxisSuffix="°C"
                                verticalLabelRotation={90}
                                data={graphicData}
                                //data={teste}
                                width={Dimensions.get("window").width + (graphicData.labels.length * 40)}
                                height={500}
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
                        )
                    }
                    else {
                        graphicComponent = [];
                    }
                }
            }
            else {//Se a chave não for igual, o estado deve ser false, para que apenas 1 dropdown esteja aberto por vez
                expand = false;
                graphicComponent = [];
            }

            let list = { //Cada dispositivo será alterado como necessitar
                key: device.key,
                name: device.name,
                local: device.local,
                expanded: expand,
                lightState: device.lightState,
                chartComponent: graphicComponent
            }
            devicesUpdated.push(list); //Insere cada dispostivo no novo Array de dispositivos
        });
        setDevices(devicesUpdated);//Altera o array antigo, com o array novo, garantindo o funcionamento do dropdown para todos os dispositivos
        //alert(JSON.stringify(devicesUpdated));


        //alert(key);
        //let expand = !expanded; //Pegamos o oposto do valor atual de expanded, para abrir se estiver fechada, e fechar se estiver aberta
        //setExpanded(expand); //Passamos o novo valor para a expanded
        //setFrequencyCounterC(0);
        //setFrequencyCounterD(0);
        //setFrequencyCounterU(0);
    }

    async function getOcorrencias(searchKey) {
        const params = {
            id_dispositivo: searchKey
        }

        devices.forEach(async (dev) => {
            if (dev.key == searchKey) {
                if (dev.expanded == true) {
                    changeLayout();
                    return;
                }
                else {
                    setModalVisible(true);
                    await axios.post('http://a65175939246.ngrok.io/temperatures', params)
                        .then(response => {
                            //alert(JSON.stringify(response.data));

                            //setOcorrencias(response.data.ocorrencias);
                            let horaRegistrada = [], dataRegistro = [], temperatura = [];

                            response.data.ocorrencias.forEach((ocorr) => {
                                //horaRegistrada.push(ocorr.horaRegistrada.substr(0,5) + " " + ocorr.dataRegistro.substr(5,10));
                                horaRegistrada.push(ocorr.horaRegistrada.substr(0, 5) + " - " + ocorr.dataRegistro.substr(5, 9).split('-').reverse().join('/'));
                                temperatura.push(ocorr.temperatura);
                            });

                            let graphicData = {
                                labels: horaRegistrada,
                                datasets: [{ data: temperatura, strokeWidth: 2 }]
                            }
                            //alert(JSON.stringify(graphicData));
                            setOcorrencias(graphicData);
                            getFrequency(response.data.frequenciaDoDispositivo);
                            //changeLayout(searchKey, graphicData);

                            if (graphicData.labels.length > 0) {
                                changeLayout(searchKey, graphicData);
                            }
                            else {
                                alert("Não existem registros para o dispositivo selecionado!");
                            }

                        })
                        .catch(error => {
                            alert("Erro na requisição getOcorrencias: " + JSON.stringify(error))
                        })
                        .finally(() => {
                            setModalVisible(false);
                        });
                }
            }
        })
    }

    useEffect(() => {
        getDevices();
        //testeConnection();
    }, [])

    /*return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text style={{ textAlign: "center" }}>Devices: {JSON.stringify(devices)}</Text>
            <TouchableOpacity
                style={{ height: 40, width: 120, backgroundColor: '#000', borderRadius: 25, alignItems: "center", justifyContent: "center", marginTop: 25, marginBottom: 25 }}
                onPress={() => { getOcorrencias(1) }}
            >
                <Text style={{ color: '#FFF' }}>GetOcorrencias</Text>
            </TouchableOpacity>

            <Text>Ocorrências: {JSON.stringify(ocorrencias)}</Text>

            <Text>Última Temepratura Registrada: {JSON.stringify(temperatura)}</Text>
            <Text>Hora Registrada: {JSON.stringify(horaRegistrada)}</Text>
            <Text>Diferença de Temperatura: {JSON.stringify(diferencaTemperatura)}</Text>

            <Text>Frequencia C: {JSON.stringify(frequencyCounterC)}</Text>
            <Text>Frequencia D: {JSON.stringify(frequencyCounterD)}</Text>
            <Text>Frequencia U: {JSON.stringify(frequencyCounterU)}</Text>

        </View>
    );*/

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
                                <TouchableOpacity style={{ height: 50, width: 0.95 * width, flexDirection: "row", borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomRightRadius: item.expanded ? 0 : 5, borderBottomLeftRadius: item.expanded ? 0 : 5, backgroundColor: '#FFF', shadowColor: '#000', elevation: 10 }} onPress={() => { getOcorrencias(item.key) }}>
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

                                {item.loaderComponent}

                                {/* Container para exibir os detalhes do dispositivo quando o usuário clicar sobre seu botão */}
                                <View style={{ height: item.expanded ? 850 : 0, width: 0.95 * width, overflow: "hidden", marginBottom: 15, backgroundColor: '#FFF' }}>
                                    <Text style={{ paddingLeft: 15, paddingTop: 15 }}>Nome do dispositivo: <Text style={{ fontWeight: "bold" }}>{item.name}</Text></Text>
                                    <Text style={{ paddingLeft: 15 }}>Local: <Text style={{ fontWeight: "bold" }}>{item.local}</Text> </Text>
                                    <Text style={{ paddingLeft: 15 }}>Última Temperatura Registarda: <Text style={{ fontWeight: "bold" }}>{temperatura}°C</Text></Text>
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
                                    <View style={{ width: '90%', height: 500, marginLeft: '5%', alignItems: "center", justifyContent: "center", borderWidth: 0.2, borderColor: '#777' }}>
                                        <ScrollView horizontal={true} style={{ height: 220 }} contentContainerStyle={{ borderWidth: 1 }}>
                                            {item.chartComponent}
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
                                                {/*Label para campo de Centena*/}
                                                <Text style={{textAlign: "center"}}>C</Text>
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
                                                {/*Label para campo de Dezena*/}
                                                <Text style={{textAlign: "center"}}>D</Text>
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
                                                {/*Label para campo de Unidade*/}
                                                <Text style={{textAlign: "center"}}>U</Text>
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
                                    <Text style={{ fontWeight: "bold", textAlign: "center", marginTop: 15 }}>*Em segundos</Text>
                                </View>
                            </View>
                        )}
                        keyExtractor={item => item.id}
                    ></FlatList>
                </ScrollView>
                <View style={{ height: '7.5%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ alignItems: "center" }}>
                        {diferencaTemperatura != null ?
                            (
                                <View style={{flexDirection: "row"}}>
                                    <Icon name="not-equal" color={"#FFF"} size={16}></Icon>
                                    <Text style={{ color: '#fff', marginLeft: 5 }}><Text style={{ fontWeight: "bold" }}>{diferencaTemperatura}°C</Text></Text>
                                </View>
                            )
                            :
                            (
                                <></>
                            )

                        }

                        {typeof dataRegistro === 'string' ?
                            (
                                <Text style={{ color: '#fff' }}>Última atualização em <Text style={{ fontWeight: 'bold' }}>{dataRegistro.substr(0, dataRegistro.length).split('-').reverse().join('/')}</Text><Text> às </Text><Text style={{ fontWeight: 'bold' }}>{horaRegistrada} ({temperatura}°C)</Text></Text>
                            )
                            :
                            (
                                <></>
                            )

                        }
                    </View>
                </View>
            </LinearGradient>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
            >
                <View style={{ width: '100%', height: '100%', alignItems: "center", justifyContent: "center", backgroundColor: 'rgba(0,0,0, 0.5)' }}>
                    <ActivityIndicator size="large" color="#F2E205" />
                    <Text style={{ color: '#FFF' }}>Carregando...</Text>
                </View>
            </Modal>
        </View>
    );
}