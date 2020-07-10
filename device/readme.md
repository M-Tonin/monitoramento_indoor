## Device

#### Responsáveis:
  * Gabriel e Rodrigo
---------------------------------
### Overview
--------------------------------

* 2 dispositivos (um em cada lado da sala)
* Telemetria + comando (downlink)

---------------------------------
### Dispositivo
---------------------------------
* MCU
  * Arduino
  * ESP8266
* Módulo LoRa SX1276
* Sensores 
  * Temperatura
  * Luminosidade
* Atuador
  * Buzzer
*Multiplexador CD4051
 
---------------------------------
### Comunicação
---------------------------------
* 1 dispositivo para cada tecnologia e vice e versa
  * LoRa;
  * WiFi
 
---------------------------------
### Sensores
---------------------------------
* Foram testados todos os sensores LM35 dispiníveis no IBTI. Nenhum sensor mostrou estar
funcionando de forma satisfatória.
* Utilizou-se o LM35 do kit a parte do Rodrigo e nele a temperatura estava mais adequada.
* O Módulo NTC 10K (Módulo vermelho OK) não estava dando valores realísticos, apenas -38°C ou acima de 200°C.
Por isso, o seu uso foi descontinuado.
* Ao se montar o circuito, havia alguma falha não identificada. Muitos testes foram feitos e houve uma mudança de protoboard.
Havia 
* Usando o botão, o mesmo estava tendo alguma interferência ao utiliza-lo Normalmente Aberto. Indicando que o mesmo foi fechado, quando não havia acontecido.
Para resolver este problema, foi utilizado o próprio resistor de pullup do arduino em que de modo geral, inverte o funcionamento da entrada, sendo agora sensível
a níveis lógicos baixos.
 
---------------------------------
### Arquivos
---------------------------------
* Sensor_Luz.ino e Sensor_Temp.ino 
  * Testes individuais de cada sensor
* Teste_Mux.ino 
  * Teste para o uso do multiplexador para o dispositivo com Wi-Fi  
* ttn-abp-temp-luz-INT.ino 
  * Leitura e comunicação com o dispositivo LoRa
* wifi-temp-luz_INT_GET.ino 
  * Leitura e comunicação com o dispositvio WiFi usando o método GET do protocolo HTTP para comunicação com o servidor 
