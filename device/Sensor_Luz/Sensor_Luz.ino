int sensorPin = A5; // Declaration of the input pin
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
 int rawValue = analogRead(sensorPin);
 float voltage = rawValue * (5.0/1023) * 1000;
 float resitance = 10000 * ( voltage / ( 5000.0 - voltage) );
 // and here it will be outputted via serial infterface
 Serial.print("Voltage value:"); Serial.print(voltage); Serial.print("mV");
 Serial.print(", Resistor value:"); Serial.print(resitance); Serial.println("Ohm");
 Serial.println("---------------------------------------");
 delay(1000);
}
