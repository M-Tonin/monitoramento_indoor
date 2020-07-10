void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(D0,OUTPUT);
  pinMode(A0,INPUT);
}

void loop() {
  int rawValue;
  float voltage;
  float resistance;
  int outputValue =0;
  int temp = 0;
  // put your main code here, to run repeatedly:
    // Lendo o valor cru da entrada analógica
  
  // LENDO LUX
  rawValue = analogRead(A0);
  outputValue = map(rawValue, 0, 1023, 0, 255);
  // Convertendo o valor cru para um valor de tensão
  voltage = outputValue * (3.3 / 255) * 1000;
  //Medindo a resistência do sensor de luz
  resistance = 10000 * ( voltage / ( 3300.0 - voltage) );
  Serial.print(", Valor de Resistência Sensor CH0:"); Serial.print(resistance); Serial.println("Ohm");
 resistance = resistance/1000;
 float divisao = resistance/103.922;
 float lux = pow(divisao,-1.42);
 
 Serial.print("Lux value:"); Serial.print(lux); Serial.println("Lx");
  
  // LENDO TEMPERATURA
  digitalWrite(D0,HIGH);
  delay(1000);
  rawValue = analogRead(A0);
  outputValue = map(rawValue, 0, 1023, 0, 255);
  // Convertendo o valor cru para um valor de tensão
  voltage = outputValue * (3.3 / 255) * 1000;
  temp = ((outputValue * (3.3 / 255)) / 0.01) * 10;
  //Medindo a resistência do sensor de luz
  //resistance = 1000 * ( voltage / ( 3300.0 - voltage) );
  Serial.print("Valor de temperatura:"); Serial.print(temp);Serial.println("°C");
  digitalWrite(D0,LOW);
  delay(1000);
}
