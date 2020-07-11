import React, { useEffect, useState } from 'react';
//import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text, TextInput, View, StyleSheet, Switch, ScrollView, LayoutAnimation, Platform, UIManager, TouchableOpacity, Image, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';


const { width, height } = Dimensions.get('window');

import Icon from 'react-native-vector-icons/FontAwesome5';
import { FlatList } from 'react-native-gesture-handler';

//Cores do IBTI:
// #F6A100  AMARELO
// #00919C  AZUL CLARO
// #0B7534  VERDE ESCURO
// #109F6C  VERDE CLARO

export default function Home() {
    //Inicialização das variáveis
    const [expanded, setExpanded] = useState(false); //Controla o estado dos detalhes (expanded, collapsed)
    const [frequencyCounter, setFrequencyCounter] = useState(0);
    const [devices, setDevices] = useState([
        { key: 1, name: 'Dispositivo 1', expanded: false, lightState: true },
        { key: 2, name: 'Dispositivo 2', expanded: false, lightState: false }
    ]);

    //const [isEnabled, setIsEnabled] = useState(false);
    //const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    //Para funcionar no Android sem bugs, no iOS já funciona corretamente
    if (Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    //Função que realiza a troca do estado dos detalhes do dispositivo, bem como tipo de animação realizada na troca de estado
    function changeLayout(searchKey) {
        let expand; //Variável que vai receber a mudança do estado, e inserir no novo array
        let devicesUpdated = []; //Novo Array de dispositivos que substituirá o array inicial, com os estados dinamicamente alterados
        devices.forEach((device) => { //Laço para percorrer todos os dispositivos existentes
            if (device.key === searchKey) { //Se a a chave recebida for igual a lida atualmente, inverte o estado do dispositivo atual
                expand = !device.expanded;
            }
            else {//Se a chave não for igual, o estado deve ser false, para que apenas 1 dropdown esteja aberto por vez
                expand = false;
            }
            let list = { //Cada dispositivo será alterado como necessitar
                key: device.key,
                name: device.name,
                expanded: expand,
                lightState: device.lightState
            }
            devicesUpdated.push(list); //Insere cada dispostivo no novo Array de dispositivos
        });
        setDevices(devicesUpdated); //Altera o array antigo, com o array novo, garantindo o funcionamento do dropdown para todos os dispositivos
        //alert(JSON.stringify(devicesUpdated));


        //alert(key);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        //let expand = !expanded; //Pegamos o oposto do valor atual de expanded, para abrir se estiver fechada, e fechar se estiver aberta
        //setExpanded(expand); //Passamos o novo valor para a expanded
    }

    //Função que aumenta a frequência
    function moreFrequency() {
        if ((frequencyCounter + 1) < 60) {
            let freq = frequencyCounter + 1;
            setFrequencyCounter(freq);
        }
    }

    //Função que diminui a frequência
    function lessFrequency() {
        if ((frequencyCounter - 1) > -1) {
            let freq = frequencyCounter - 1;
            setFrequencyCounter(freq);
        }
    }

    return (
        <LinearGradient
            style={{ flex: 1, heigh: '100%' }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={['#00AB98', '#00AB98']}>
            <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={['#00AB98', '#03A63C']}
                style={styles.difArea}>
                <Text style={styles.difText}>CDT</Text>
                <Text style={styles.difText}>10°</Text>
            </LinearGradient>

            <View style={styles.devicesArea}>
                <FlatList
                    contentContainerStyle={{ height: '100%', width: 1.0 * width }}
                    data={devices}
                    renderItem={({ item }) => (
                        <View style={{
                            width: 1 * width, alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#FFF', height: 0.075 * height, marginTop: 10, borderTopRightRadius: 5, borderTopLeftRadius: 5,
                                    borderBottomLeftRadius: item.expanded ? 0 : 5, borderBottomRightRadius: item.expanded ? 0 : 5
                                }} onPress={() => { changeLayout(item.key) }}>
                                <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    colors={['#F28705', '#F2E205']}
                                    style={styles.device}>
                                    {item.expanded ?
                                        (<Icon name="chevron-up" color={'#FFF'} size={20}></Icon>)
                                        :
                                        (<Icon name="chevron-down" color={'#FFF'} size={20}></Icon>)
                                    }
                                    <Text style={styles.deviceText}>{item.name}</Text>
                                </LinearGradient>
                            </TouchableOpacity>


                            <ScrollView style={{ height: item.expanded ? null : 0, overflow: 'hidden', backgroundColor: '#FFF', width: 0.95 * width }}>
                                <View style={styles.deviceDetailsArea}>
                                    <Text>Nome do dispositivo: {item.name}</Text>
                                    <Text>Local: Sala de reunião</Text>
                                    <Text>Última Temperatura Registarda: 20°</Text>
                                    <View style={{ flexDirection: "row", width: 0.95 * width, alignItems: "center", justifyContent: "flex-end", padding: 20 }}>
                                        <Icon name="lightbulb" size={20}></Icon>
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#00AB98" }}
                                            thumbColor={item.lightState ? "#03A63C" : "#f4f3f4"}
                                            ios_backgroundColor="#3e3e3e"
                                            //onValueChange={toggleSwitch}
                                            disabled={true}
                                            value={item.lightState}
                                        />
                                    </View>
                                    <View style={{width: '100%', height: 220, alignItems: "center", justifyContent: "center", borderWidth: 1}}>
                                        <Image style={{ width: 300, height: 200 }} source={require('../../assets/images/lineGraphic.png')}></Image>
                                    </View>
                                </View>

                                <View style={styles.btnArea}>
                                    <TouchableOpacity>
                                        <LinearGradient
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            colors={['#03A63C', '#00AB98']}
                                            style={styles.btnBuzzer}>
                                            <Icon name="bullhorn" color={'#FFF'} size={25}></Icon>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <View style={styles.frequencyChange}>
                                        <TouchableOpacity style={styles.btnLessFrequency} onPress={() => { lessFrequency() }}>
                                            <Icon name="minus" color={'#FFF'} size={15}></Icon>
                                        </TouchableOpacity>

                                        <Text style={styles.frequencyInput}>{frequencyCounter}</Text>

                                        <TouchableOpacity style={styles.btnMoreFrequency} onPress={() => { moreFrequency() }}>
                                            <Icon name="plus" color={'#FFF'} size={15}></Icon>
                                        </TouchableOpacity>
                                    </View>
                                </View>


                            </ScrollView>
                        </View>
                    )}
                    keyExtractor={item => item.id}
                ></FlatList>
            </View>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    difArea: {
        height: '10%',
        backgroundColor: '#109F6C',
        width: '100%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        justifyContent: "center",
        alignItems: "center"
    },
    difText: {
        color: '#FFF',
        fontSize: 30,
        fontWeight: "bold"
    },
    devicesArea: {
        height: '70%',
        alignItems: "center",
        justifyContent: "flex-start"
    },
    device: {
        alignItems: "center",
        flexDirection: "row",

        padding: 5,
        width: 0.95 * width,
        height: 0.075 * height,
        //backgroundColor: '#00919C',
        borderRadius: 5
    },
    deviceText: {
        color: '#FFF',
        marginLeft: 5
    },
    deviceDetails: {

    },
    deviceDetailsArea: {
        //height: '50%'
        height: 400,
        padding: 20
    },
    btnArea: {
        flexDirection: "row",
        //height: '10%',
        height: 75,
        alignItems: "center",
        justifyContent: "flex-end"
    },
    btnBuzzer: {
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
        padding: 10,
        backgroundColor: '#0B7534',
        borderRadius: 5
    },
    textBuzzer: {
        color: '#FFF',
        fontSize: 15
    },
    frequencyChange: {
        flexDirection: "row",
        marginRight: 15
    },
    frequencyInput: {
        fontSize: 15,
        textAlign: "center",
        textAlignVertical: "center",
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#999'
    },
    btnMoreFrequency: {
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: '#0B7534',
        backgroundColor: '#0B7534'
    },
    btnLessFrequency: {
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        borderWidth: 1,
        borderRightWidth: 0,
        borderColor: '#D9534F',
        backgroundColor: '#D9534F'
    }

})