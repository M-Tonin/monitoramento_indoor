#define TAMbytes 4
#define Select D4
#define BUZZER D1
#define Botao D2
#define Sensor A0


#include <ESP8266WiFi.h>
#include <stdlib.h>
#include <ArduinoJson.h>
//const char* ssid = "yourNetworkName";
//const char* password =  "yourNetworkPass";

const char *ssid = "Inst Brasilia de Tec e Inov 2G";  //ENTER YOUR WIFI SETTINGS
const char *password = "#ibti@2019";
 
//const uint16_t port = 12345;
//const char * host = "192.168.2.196";
const uint16_t port = 5000;
const char * host = "192.168.1.70";

static uint8_t mydata[TAMbytes];
//int mydata[TAMbytes];
String s_data = "" ;
uint8_t downlink = 0;
// VARIÁVEIS SENSORES

// Valor de temperatura e bytes mais e menos significativos respectivamente
uint16_t temp;
uint8_t tempHIGH;
uint8_t tempLOW;
// Valor de bytes mais e menos significativos respectivamente
uint16_t lux;
unsigned long int luxmedium=0;
int lux_status;
int lux_previous = 0;
uint8_t luxHIGH;
uint8_t luxLOW;
// Contantes auxiliáres
unsigned long int intervalo = 600000;
unsigned long int aux_intervalo;
unsigned long int ant_botao = 0;

unsigned long MillisAnterior = 0;
void setup()
{
 
  Serial.begin(115200);
 
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
 
  Serial.println();
  Serial.print("WiFi connected with IP: ");
  Serial.println(WiFi.localIP());

  pinMode(Select,OUTPUT);
  pinMode(Sensor,INPUT);
  pinMode(Botao,INPUT);
 digitalWrite(Select, LOW);
}
 
void loop()
{
    WiFiClient client;
    StaticJsonDocument<15> jsonDocument;
    if(digitalRead(Botao) == HIGH && millis() - ant_botao > 500){
      ant_botao = millis();
      Serial.println("Entrou no IF do BOTÃO");
      
      aux_intervalo = intervalo;
      Serial.print("AUX_intervalo: ");Serial.println(aux_intervalo);
      intervalo = 1000;
      
      }
    
    for (int i=0;i<5;i++){
      lux = ReadLux();
      luxmedium+=lux;
    }
    if (luxmedium/5 >= 25){
      lux_status = 1;
     // Serial.println("Acesa");
    } else if (luxmedium/5 <= 15){
      lux_status = 0;
    //  Serial.println("Apagada");
    }
    luxmedium=0;

    char lux_bin[1];

    itoa(lux_status, lux_bin, 10);
    
    String url =  "/lightStatus?lightstatus=";
    url += lux_bin;
    
    //Serial.println(lux_status); 
    if(lux_status == 0 && lux_previous==1)
    {
      Serial.println("Apagou");   
      Serial.println(lux); 
      Serial.println(lux_status);     
      lux_previous = lux_status;

      if (!client.connect(host, port)) {
 
        Serial.println("Connection to host failed");
 
        delay(1000);
       

        while(!client.connect(host, port))
        {
           Serial.println("Connection to still host failed");
            delay(1000);
        }
         
    } 
      client.print(String("GET ") + url + " HTTP/1.1\r\n" +
                 "Host: " + host + "\r\n" +
                 "Connection: close\r\n\r\n");    Serial.println("Verificando downlink... ");
    //Serial.print("Intervalo antes de ler: "); Serial.println(intervalo);
    while (client.connected() || client.available())
{
    if (client.available())
      {
    s_data = client.readStringUntil('\n');
    //Serial.print("Intervalo depois de ler: "); Serial.println(intervalo);
   // Serial.println("Leu se existe downlink");
    Serial.println(s_data);

      }
}

      
      
    }
    else if (lux_status == 1 && lux_previous==0){
      Serial.println("Acendeu");
      Serial.println(lux);   
      Serial.println(lux_status);   
      lux_previous = lux_status;

      if (!client.connect(host, port)) {
 
        Serial.println("Connection to host failed");
 
        delay(1000);

         while(!client.connect(host, port))
        {
           Serial.println("Connection to still host failed");
            delay(1000);
        }
    } 
    
       
        
      client.print(String("GET ") + url + " HTTP/1.1\r\n" +
                 "Host: " + host + "\r\n" +
                 "Connection: close\r\n\r\n");

          Serial.println("Verificando downlink... ");
    //Serial.print("Intervalo antes de ler: "); Serial.println(intervalo);
    while (client.connected() || client.available())
{
    if (client.available())
      {
    s_data = client.readStringUntil('\n');
    //Serial.print("Intervalo depois de ler: "); Serial.println(intervalo);
   // Serial.println("Leu se existe downlink");
    Serial.println(s_data);

      }
}
    }  

   
    if (millis() - MillisAnterior >= intervalo) {
    
    MillisAnterior = millis();
   
        
    
    
    if (!client.connect(host, port)) {
 
        Serial.println("Connection to host failed");
 
        delay(1000);
        //return;
          while(!client.connect(host, port))
        {
           Serial.println("Connection to host still failed");
            delay(1000);
        }
    }

    
//////////////////////////////////////////////////////////////////////////////
    temp = ReadTemp();
    
    /*luxHIGH = ShiftingBytesH(lux);
    luxLOW = ShiftingBytesL(lux);
    tempHIGH = ShiftingBytesH(temp);
    tempLOW = ShiftingBytesL(temp);

    


    // Alocando dos dados no vetor de dados a ser enviado
    mydata[0] = tempHIGH;
    mydata[1] = tempLOW;
    mydata[2] = luxHIGH;
    mydata[3] = luxLOW;
    Serial.println("DADOS LIDOS");
    Serial.println(mydata[0],HEX);
    Serial.println(mydata[1],HEX);
    Serial.println(mydata[2],HEX);
    Serial.println(mydata[3],HEX);*/

    char http_lux[4];
    char http_temp[4];

    itoa(temp, http_temp, 10);
    itoa(lux, http_lux, 10);

     
    Serial.print("Temperatura: "); Serial.println(http_temp);
    Serial.println("Lux: "); Serial.println(http_lux);
    Serial.println("Connected to server successful!");

    url = "";
    url = "/upWifi?";
    url += "temp=";
    url += http_temp;
    url += "&&lux=";
    url += http_lux;

    // This will send the request to the server
    client.print(String("GET ") + url + " HTTP/1.1\r\n" +
                 "Host: " + host + "\r\n" +
                 "Connection: close\r\n\r\n");
    
    
    Serial.println("Verificando downlink... ");
    //Serial.print("Intervalo antes de ler: "); Serial.println(intervalo);
    while (client.connected() || client.available())
{
    if (client.available())
      {
    s_data = client.readStringUntil('\n');
    //Serial.print("Intervalo depois de ler: "); Serial.println(intervalo);
   // Serial.println("Leu se existe downlink");
    Serial.println(s_data);

      }
}
    //Serial.println(s_data); 
    char json[15];
    s_data.toCharArray(json, 15);
    deserializeJson(jsonDocument,json);
    int freq = jsonDocument["freq"];


    Serial.print("Valor de freq lido: "); Serial.println(freq);
    //downlink = strtol(s_data.c_str(), NULL, 16);
    //Serial.println(downlink, DEC);
    if (freq > 0)
    {
      intervalo = freq * 60000 - 1500;
      tone (BUZZER, 1500);
      Serial.println("Recebeu Downlink!!");
      delay(500);
      noTone(BUZZER);
      s_data = "";
    }else{
      
      Serial.println("Não recebeu Downlink.");
      }
    
    
    Serial.print("Intervalo final do loop: "); Serial.println(intervalo);
    Serial.println();
    Serial.println("Disconnecting...");
    client.stop();
    if(intervalo == 1000){
    Serial.println("MUDOU O VALOR DO INTERVALO");
    intervalo = aux_intervalo;
    }
}
else{
  return;
}
}



uint16_t ReadTemp() {
  digitalWrite(Select, HIGH);
  
  uint16_t temp = 0;
  int rawValue = 0;
  int outputValue = 0;
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
  int rawValue = 0;
  float voltage = 0;
  float resistance = 0;
  float divisao = 0;
  uint16_t lux = 0;
  int outputValue = 0;

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
