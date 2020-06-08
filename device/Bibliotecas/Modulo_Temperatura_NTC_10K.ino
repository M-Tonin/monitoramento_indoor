/* MÓDULO SENSOR TEMPERATURA com TERMISTOR NTC de 10K:
   Liga-se o pino Sinal do módulo em uma porta analógica do Arduino
   (como exemplo A0), o pino positivo no 5V e o pino negativo
   no GNG.
   O Módulo Sensor de Temperatura possui escalas de leitura de
   -55 a 125°C, com uma precisão de 1,5°C. Este Módulo utiliza 
   um termistor, que retorna a temperatura ambiente sob a forma
   de um valor de resistência, o qual é então usado para alterar
   a tensão Vcc (5V), onde essa alteração medida na tensão é 
   convertida através de um pino de entrada analógica do Arduino
   para a temperatura correspondente, com sensibilidade de 10mV
   a cada grau Celsius de temperatura. 
*/

///////////////////////////////////
// INICIALIZAÇÃO DAS BIBLIOTECAS //
///////////////////////////////////
#include <Thermistor.h>  //inicializa a biblioteca responsável por realizar 
                         //os cálculos de conversão da temperatura,
                         //considerando um termistor de 10K. Caso possua outro
                         //valor de termistor, será necessário abrir o arquivo 
                         //Thermistor.cpp da biblioteca e fazer as devidas 
                         //alterações no valor da variável


/////////////////////////////////
// INICIALIZAÇÃO DAS VARIÁVEIS //
/////////////////////////////////
Thermistor temp(0);  //cria variável do tipo Thermistor para ler o pino
                     //de entrada analógido (A0) do Arduino

float temperatura;  //variável para armazenar o valor da temperatura
                    //após a conversão do valor analógico lido

///////////
// SETUP //
///////////
void setup() 
{
  Serial.begin(9600);       //setando a comunicação via porta
                            //serial à uma velocidade de 
                            //9600bps(baud)
}

///////////
// LOOP  //
///////////
void loop() 
{
  temperatura = temp.getTemp();
  Serial.print("Temperatura = "); //imprime a palavra Temperatura =
  Serial.print(temperatura);      //imprime a temperatura na tela
  Serial.println("C");           //imprime "°C" e salta uma linha
  
  delay(1000);  //aguarda por 1s para a próxima leitura de temperatura.
}
