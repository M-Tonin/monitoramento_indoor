#define TAMbytes 4
#define Select D0
#define BUZZER D1
#define Botao D2
#define Sensor A0


#include <ESP8266WiFi.h>
#include <stdlib.h>
//const char* ssid = "yourNetworkName";
//const char* password =  "yourNetworkPass";

const char *ssid = "Inst Brasilia de Tec e Inov 2G";  //ENTER YOUR WIFI SETTINGS
const char *password = "#ibti@2019";
 
const uint16_t port = 12345;
const char * host = "192.168.2.196";


static uint8_t mydata[TAMbytes];
String s_data = "" ;
uint8_t downlink = 0;
// VARIÁVEIS SENSORES

// Valor de temperatura e bytes mais e menos significativos respectivamente
uint16_t temp;
uint8_t tempHIGH;
uint8_t tempLOW;
// Valor de bytes mais e menos significativos respectivamente
uint16_t lux;
uint8_t luxHIGH;
uint8_t luxLOW;
// Contantes auxiliáres
unsigned long int intervalo = 10000;
unsigned long int aux_intervalo;
unsigned long MillisAnterior = 0;
void setup()
{
 
  Serial.begin(115200);
 
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("...");
  }
 
  Serial.print("WiFi connected with IP: ");
  Serial.println(WiFi.localIP());

  pinMode(Select,OUTPUT);
  pinMode(Sensor,INPUT);
  pinMode(Botao,INPUT);
 
}
 
void loop()
{
    WiFiClient client;

    if(digitalRead(Botao) == HIGH){

      aux_intervalo = intervalo;
      intervalo = 1;
      }
    if (millis() - MillisAnterior >= intervalo) {
    
    MillisAnterior = millis();
    if (!client.connect(host, port)) {
 
        Serial.println("Connection to host failed");
 
        delay(1000);
        return;
    }

    
//////////////////////////////////////////////////////////////////////////////
    
    temp = ReadTemp();
    lux = ReadLux();
    luxHIGH = ShiftingBytesH(lux);
    luxLOW = ShiftingBytesL(lux);
    tempHIGH = ShiftingBytesH(temp);
    tempLOW = ShiftingBytesL(temp);


    // Alocando dos dados no vetor de dados a ser enviado
    mydata[0] = tempHIGH;
    mydata[1] = tempLOW;
    mydata[2] = luxHIGH;
    mydata[3] = luxLOW;

    
    Serial.println("Connected to server successful!");
   

    client.write(mydata,4);

    
    Serial.println("Lendo se existe downlink");
    
    s_data = client.readStringUntil('\n');
    Serial.println("Leu se existe downlink");
    Serial.println(s_data);
    downlink = strtol(s_data.c_str(), NULL, 16);
    Serial.println(downlink, HEX);
    if (s_data.length() > 0)
    {
      intervalo = downlink * 1000;
      tone (BUZZER, 1500);
      Serial.println("Recebeu Downlink!!");
      delay(500);
      noTone(BUZZER);
      s_data = "";
    }
    Serial.println("Disconnecting...");
    client.stop();
    if(intervalo == 1){
    intervalo = aux_intervalo;
    }
}
else{
  return;
}
}



uint16_t ReadTemp() {
  digitalWrite(Select, HIGH);
  uint16_t temp;
  int rawValue;
  int outputValue;
  rawValue = analogRead(Sensor);
  outputValue = map(rawValue, 0, 1023, 0, 255);
  // Convertendo o valor cru para um valor de tensão
  //voltage = outputValue * (3.3 / 255) * 1000;
  temp = ((outputValue * (3.3 / 255)) / 0.01) * 10;

  //Serial.print("Valor de temperatura:"); Serial.print(temp);Serial.println("°C");
  return temp;
}

uint16_t ReadLux() {

  // Conversão de unidades
  digitalWrite(Select, LOW);
  int rawValue;
  float voltage;
  float resistance;
  float divisao;
  uint16_t lux;
  int outputValue =0;

  // Lendo o valor cru da entrada analógica
  rawValue = analogRead(Sensor);
  outputValue = map(rawValue, 0, 1023, 0, 255);
  
  // Convertendo o valor cru para um valor de tensão
  voltage = outputValue * (3.3 / 255) * 1000;
  //Medindo a resistência do sensor de luz
  resistance = 10000 * ( voltage / ( 3300.0 - voltage) );

  // imprimindo os valores lidos
  //Serial.print("Valor de tensão Sensor luz:"); Serial.print(voltage); Serial.print("mV");
  //Serial.print(", Valor de Resistência Sensor luz:"); Serial.print(resistance); Serial.println("Ohm");

  // Convervento a resistência do sensor de luz para um valor e lux
  // Lux = (resistência/103.922)^-1.42, sendo resistência dada em KOhm
  // Escritório ~ 500 lx
  resistance = resistance / 1000;
  divisao = resistance / 103.922;
  lux = pow(divisao, -1.42);
  return lux;
}

uint8_t ShiftingBytesH(uint16_t sensor) {
  uint8_t MSB;
  // Dividindo os 2 Bytes recolhidos do sensor em 1 Byte
  // para cada variável para o envio do dado

  MSB = (sensor & 0xFF00) >> 8;
  return MSB;
}

uint8_t ShiftingBytesL(uint16_t sensor) {
  uint8_t LSB;
  // Dividindo os 2 Bytes recolhidos do sensor em 1 Byte
  // para cada variável para o envio do dado

  LSB = (sensor & 0x00FF);
  return LSB;
}
/*#include <ESP8266WiFi.h>

const char *ssid = "Inst Brasilia de Tec e Inov 2G";  //ENTER YOUR WIFI SETTINGS
const char *password = "#ibti@2019";

const uint16_t port = 12345;
const char * host = "192.168.2.29";


void setup()
{
  Serial.begin(115200);
  Serial.println();

  Serial.printf("Connecting to %s ", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected");
}


void loop()
{
  WiFiClient client;

  Serial.printf("\n[Connecting to %s ... ", host);
  if (client.connect(host, port))
  {
    Serial.println("connected]");

    Serial.println("[Sending a request]");
    client.print(String("GET /") + " HTTP/1.1\r\n" +
                 "Host: " + host + "\r\n" +
                 "Connection: close\r\n" +
                 "\r\n"
                );

    Serial.println("[Response:]");
    while (client.connected() || client.available())
    {
      if (client.available())
      {
        String line = client.readStringUntil('\n');
        Serial.println(line);
      }
    }
    client.stop();
    Serial.println("\n[Disconnected]");
  }
  else
  {
    Serial.println("connection failed!]");
    client.stop();
  }
  delay(5000);
}*/
