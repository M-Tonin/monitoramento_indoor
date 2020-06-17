/// Definições

#define TAMbytes 4
#define sensortemp A0
#define sensorluz A5
#define BUZZER 8
#define BOTAO 2
//Bibliotecas

#include <lmic.h>
#include <hal/hal.h>
#include <SPI.h>

/*
  ---------------------------------------------
           GND          |   Pino GND
        IRQ ou NC       |   Não Conectado
           MISO         |   Pino 12
           MOSI         |   Pino 11
           SCK          |   Pino 13
        SDA ou SS       |   Pino 10
  ----------------------------------------------
*/

// LoRaWAN NwkSKey, network session key
// This is the default Semtech key, which is used by the early prototype TTN
// network.
static const PROGMEM u1_t NWKSKEY[16] = {0xCF, 0x38, 0x67, 0x78, 0x2D, 0xA1, 0x11, 0x8E, 0xA7, 0x04, 0x24, 0x1E, 0x36, 0x63, 0x41, 0x0C };

// LoRaWAN AppSKey, application session key
// This is the default Semtech key, which is used by the early prototype TTN
// network.
static const u1_t PROGMEM APPSKEY[16] = {0xFD, 0x30, 0xF9, 0xC5, 0x38, 0x9C, 0xDD, 0xAF, 0xDD, 0xAA, 0x86, 0xEC, 0x0F, 0x5D, 0x9A, 0x91 };

// LoRaWAN end-device address (DevAddr)
static const u4_t DEVADDR = 0x26011BC0; // <-- Change this address for every node!

// These callbacks are only used in over-the-air activation, so they are
// left empty here (we cannot leave them out completely unless
// DISABLE_JOIN is set in config.h, otherwise the linker will complain).
void os_getArtEui (u1_t* buf) { }
void os_getDevEui (u1_t* buf) { }
void os_getDevKey (u1_t* buf) { }

static uint8_t mydata[TAMbytes];
static osjob_t sendjob;
// Variável que armazenará o downklink recebido;
unsigned long int downlink = 0 ;
bool FirstTX = false;

// Schedule TX every this many seconds (might become longer due to duty
// cycle limitations).
const unsigned TX_INTERVAL = 1;

// Pin mapping
const lmic_pinmap lmic_pins = {
  .nss = 10,
  .rxtx = LMIC_UNUSED_PIN,
  .rst = 5,
  .dio = {4, 6, LMIC_UNUSED_PIN},
};
bool entregou = false;
void onEvent (ev_t ev) {
  Serial.print(os_getTime());
  Serial.print(": ");
  switch (ev) {
    case EV_SCAN_TIMEOUT:
      Serial.println(F("EV_SCAN_TIMEOUT"));
      break;
    case EV_BEACON_FOUND:
      Serial.println(F("EV_BEACON_FOUND"));
      break;
    case EV_BEACON_MISSED:
      Serial.println(F("EV_BEACON_MISSED"));
      break;
    case EV_BEACON_TRACKED:
      Serial.println(F("EV_BEACON_TRACKED"));
      break;
    case EV_JOINING:
      Serial.println(F("EV_JOINING"));
      break;
    case EV_JOINED:
      Serial.println(F("EV_JOINED"));
      break;
    case EV_RFU1:
      Serial.println(F("EV_RFU1"));
      break;
    case EV_JOIN_FAILED:
      Serial.println(F("EV_JOIN_FAILED"));
      break;
    case EV_REJOIN_FAILED:
      Serial.println(F("EV_REJOIN_FAILED"));
      break;
    case EV_TXCOMPLETE:
      Serial.println(F("EV_TXCOMPLETE (includes waiting for RX windows)"));
      entregou = true;
      if (LMIC.txrxFlags & TXRX_ACK)
        Serial.println(F("Received ack"));
      if (LMIC.dataLen) {
        Serial.println(F("Received "));
        Serial.println(LMIC.dataLen);

        //Imprimir a downlink recebido
        for (int i = 0; i < LMIC.dataLen; i++) {

          //if(LMIC.frame[LMIC.dataBeg+ i]< 0x10)
          //Serial.print(F("0"));

          Serial.print(LMIC.frame[LMIC.dataBeg + i], DEC);
          Serial.print(" ");
        }

        // Armazenar o valor de downlink da variável correspondente
        for (int i = 0; i < LMIC.dataLen; i++) {

          downlink = (downlink << 8) | LMIC.frame[LMIC.dataBeg + i];

        }
        Serial.println(downlink);
        Serial.print(" DOWNLINK RECEBIDO ");
        Serial.println(F(" bytes of payload"));
      }
      // Schedule next transmission
      os_setTimedCallback(&sendjob, os_getTime() + sec2osticks(TX_INTERVAL), do_send);
      break;
    case EV_LOST_TSYNC:
      Serial.println(F("EV_LOST_TSYNC"));
      break;
    case EV_RESET:
      Serial.println(F("EV_RESET"));
      break;
    case EV_RXCOMPLETE:
      // data received in ping slot
      Serial.println(F("EV_RXCOMPLETE"));
      break;
    case EV_LINK_DEAD:
      Serial.println(F("EV_LINK_DEAD"));
      break;
    case EV_LINK_ALIVE:
      Serial.println(F("EV_LINK_ALIVE"));
      break;
    default:
      Serial.println(F("Unknown event"));
      break;
  }
}
void do_send(osjob_t* j) {
  // Check if there is not a current TX/RX job running
  if (LMIC.opmode & OP_TXRXPEND) {
    Serial.println(F("OP_TXRXPEND, not sending"));
  } else {
    // Prepare upstream data transmission at the next possible time.
  if(FirstTX == true){
    LMIC_setTxData2(1, mydata, TAMbytes, 0);
    Serial.println(F("Packet queued"));
  }
  }
  // Next TX is scheduled after TX_COMPLETE event.
}
///////////////////////////////////////////////////////////////////////////////////
//
// Variável
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
unsigned long MillisAnterior = 0;
unsigned long MillisAtual = 0;


void setup ()
{

  Serial.begin(115200);
  Serial.println(F("Starting"));

  pinMode(10, OUTPUT);
  digitalWrite(10, HIGH);

  // LMIC init
  os_init();
  // Reset the MAC state. Session and pending data transfers will be discarded.
  LMIC_reset();
#ifdef PROGMEM
  // On AVR, these values are stored in flash and only copied to RAM
  // once. Copy them to a temporary buffer here, LMIC_setSession will
  // copy them into a buffer of its own again.
  uint8_t appskey[sizeof(APPSKEY)];
  uint8_t nwkskey[sizeof(NWKSKEY)];
  memcpy_P(appskey, APPSKEY, sizeof(APPSKEY));
  memcpy_P(nwkskey, NWKSKEY, sizeof(NWKSKEY));
  LMIC_setSession (0x1, DEVADDR, nwkskey, appskey);
#else
  // If not running an AVR with PROGMEM, just use the arrays directly
  LMIC_setSession (0x1, DEVADDR, NWKSKEY, APPSKEY);
#endif

#if defined(CFG_us915)
  // NA-US channels 0-71 are configured automatically
  // but only one group of 8 should (a subband) should be active
  // TTN recommends the second sub band, 1 in a zero based count.
  // https://github.com/TheThingsNetwork/gateway-conf/blob/master/US-global_conf.json
  LMIC_selectSubBand(1);

#endif

  // Disable ADR Mode
  LMIC_setAdrMode (0);
  // Disable link check validation
  LMIC_setLinkCheckMode(0);

  // TTN uses SF12 for its RX2 window.
  LMIC.dn2Dr = DR_SF12CR;

  // Set data rate and transmit power for uplink (note: txpow seems to be ignored by the library)
  LMIC_setDrTxpow(DR_SF7, 14);

  // Start job
  do_send(&sendjob);
  /////////////////////////////////////////////////////////////////////////////////////////////////

  SPI.begin ();                    // Inicializa comunicacao SPI
  pinMode (BUZZER, OUTPUT);      // Declara o pino do buzzer como saída
  pinMode(BOTAO, INPUT_PULLUP); // Declara o pino do botão como entrada utilizando um
  //Pullup resistor, invertendo seu comportamento.


  // Interrupção para quando o botão for aperta e o envio tenha que ser imediato
  attachInterrupt(digitalPinToInterrupt(BOTAO), mandatx, FALLING);
 
}



void loop ()
{
  
  //Caso algum downlink seja recebido
    if (downlink != 0)
    {
      intervalo = downlink * 1000;
      downlink = 0;
      tone (BUZZER, 1500);
      delay(500);
      noTone(BUZZER);
    }

    
    
  if (millis() - MillisAnterior >= intervalo) {

    Serial.println(millis());
    Serial.println(MillisAnterior);
    Serial.println(millis() - MillisAnterior);
    
    
    MillisAnterior = millis();
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


    
    Serial.println("---------------------------------------");
    Serial.print("\n");
    FirstTX = true;
    do_send(&sendjob);
    //Loop que atesta que a transmissão foi completada
    while (entregou != true) {
      os_runloop_once();
    }
    entregou = false;
    
    //Impressão dos valores lidos
    Serial.print("Valor de temperatura:"); Serial.print(temp); Serial.println("°C");
    Serial.print("Valor em lux:"); Serial.print(lux); Serial.println("Lx");

    //Impressão dos dados a serem enviados
    for (int i = 0; i < TAMbytes; i++) {
      Serial.print(mydata[i], HEX);
      Serial.print(" ");
    }
    Serial.println();

    //Loop que verifica se o botão foi apertado e se o tempo determinado foi cumprido;


    Serial.print("Terminou Loop\n");
  }
}
unsigned long last_interrupt_time = 0;
bool flag = true;
void mandatx() { 

 // If interrupts come faster than 200ms, assume it's a bounce and ignore
   
   if((millis() - last_interrupt_time > 200 )&& flag){
    flag = false;
    Serial.println(millis());
    Serial.println(last_interrupt_time);
    Serial.println(millis() - last_interrupt_time);

    
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

    Serial.println("--------------------INTERRUPÇÃO-------------------");
    Serial.print("\n");

    //Loop que atesta que a transmissão foi completada
    while (entregou != true) {
      os_runloop_once();
    }
    entregou = false;

    //Caso algum downlink seja recebido
    if (downlink != 0)
    {
      intervalo = downlink * 1000 - 1500;
      downlink = 0;
      tone (BUZZER, 1500);
      delay(500);
      noTone(BUZZER);
    }
    //Impressão dos valores lidos
    Serial.print("Valor de temperatura:"); Serial.print(temp); Serial.println("°C");
    Serial.print("Valor em lux:"); Serial.print(lux); Serial.println("Lx");

    //Impressão dos dados a serem enviados
    for (int i = 0; i < TAMbytes; i++) {
      Serial.print(mydata[i], HEX);
      Serial.print(" ");
    }
    Serial.println();

    Serial.print("Terminou Loop interrupção\n");

    MillisAnterior = millis();

   }
   else{
    
    Serial.println("Pulou");
    
    }
    last_interrupt_time = millis();
    flag = true;
    
 
}


uint16_t ReadTemp() {
  uint16_t temp;
  // Lendo o sensor de temperatura
  temp = ((analogRead(sensortemp) * (5.0 / 1023)) / 0.01) * 10;
  //Serial.print("Valor de temperatura:"); Serial.print(temp);Serial.println("°C");
  return temp;
}

uint16_t ReadLux() {

  // Conversão de unidades
  int rawValue;
  float voltage;
  float resistance;
  float divisao;
  uint16_t lux;

  // Lendo o valor cru da entrada analógica
  rawValue = analogRead(sensorluz);
  // Convertendo o valor cru para um valor de tensão
  voltage = rawValue * (5.0 / 1023) * 1000;
  //Medindo a resistência do sensor de luz
  resistance = 10000 * ( voltage / ( 5000.0 - voltage) );

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
