int sensorPin1 = A5; // Declaration of the input pin
//int sensorPin2 = A0;
float media[10];
float mediatotal; 
int i = 0;
// Serial output in 9600 Baud
void setup()
{
 Serial.begin(9600);
}
// The program measures the current voltage at the sensor ,
// takes the value of the known resistor and calculates the current resistance of the sensor. // After that it show the result via serial output.
void loop()
{
 // Current voltage will be measured...
 int rawValue = analogRead(sensorPin1);
 float voltage = rawValue * (5.0/1023) * 1000;
 float resistance = 10000 * ( voltage / ( 5000.0 - voltage) );

 // and here it will be outputted via serial infterface
 Serial.print("Valor de tensão Sensor A5:"); Serial.print(voltage); Serial.print("mV");
 Serial.print(", Valor de Resistência Sensor A5:"); Serial.print(resistance); Serial.println("Ohm");
 
  // Lux = (resistência/103.922)^-1.42, sendo resistência dada em KOhm
  // Escritório ~ 500 lx
  resistance = resistance/1000;
 float divisao = resistance/103.922;
 float lux = pow(divisao,-1.42);
 
 Serial.print("Lux value:"); Serial.print(lux); Serial.println("Lx");
  
  media [i] = resistance;
  mediatotal+=media[i];
  if(i == 9){
    mediatotal = mediatotal/10;
    Serial.print("Media de 10 resistencias :"); Serial.print(mediatotal); Serial.println("Ohm");
    mediatotal = 0;
    i =-1;

  }
    
  i++;
 Serial.println("---------------------------------------");
/*
 /////////////////////////////////////////////////////////////////////////////
 rawValue = analogRead(sensorPin2);
 voltage = rawValue * (5.0/1023) * 1000;
 resistance = 10000 * ( voltage / ( 5000.0 - voltage) );
 
  // and here it will be outputted via serial infterface
 Serial.print("Valor de tensão Sensor A0:"); Serial.print(voltage); Serial.print("mV");
 Serial.print(", Valor de Resistência Sensor A0:"); Serial.print(resistance); Serial.println("Ohm");
 
  // Lux = (resistência/99.193)^-1.42, sendo resistência dada em KOhm
  // Escritório ~ 500 lx
 resistance = resistance/1000;
 divisao = resistance/99.193;
 lux = pow(divisao,-1.42);
 Serial.print("Lux value Sensor A0:"); Serial.print(lux); Serial.println("Lx");
 Serial.println("---------------------------------------");
 */
 delay(1000);
}
