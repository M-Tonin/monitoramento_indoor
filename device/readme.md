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
* Arduino
* SX1276
* Sensores 
  * Temperatura LM35
  * Luminosidade Fotocélula 5mm
* Atuador
  * Buzzer
 
---------------------------------
### Comunicação
---------------------------------
* 1 dispositivo para cada tecnologia e vice e versa
  * LoRa;
  * WiFi;

---------------------------------
### Sensores
---------------------------------
* Foram testados todos os sensores LM35 dispiníveis no IBTI. Nenhum sensor mostrou estar
funcionando de forma satisfatória.
* Utilizou-se o LM35 do kit a parte do Rodrigo e nele a temperatura estava mais adequada.
* O Módulo NTC 10K (Módulo vermelho OK) não estava dando valores realísticos, apenas -38°C ou acima de 200°C.
Por isso, o seu uso foi descontinuado.
 
