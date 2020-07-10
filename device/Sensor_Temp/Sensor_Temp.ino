#define pino A3


void setup() {
Serial.begin(9600);  // put your setup code here, to run once:

}

void loop() {
  static uint8_t mydata[3] = "";
  float temp;
  float voltage;
  temp = ((analogRead(pino)*(5.0/1023))/0.01);

    mydata[0] = temp;
    mydata[1] = 100;
    Serial.print(mydata[0],HEX);
    Serial.print(" ");
     Serial.print(mydata[1],HEX);

 voltage =  analogRead(pino)* (5.0 / 1023) * 1000;
 Serial.print("Tensão temperatura:"); Serial.print(voltage);Serial.println("mV");
    Serial.print("Temp: ");
    Serial.print(temp);
    Serial.println("°C");
    
  
  delay(1000);
}
