#define pino A0

float temp = 0.0;
float ultimatemp = 0.0;

void setup() {
Serial.begin(9600);  // put your setup code here, to run once:

}

void loop() {
  temp = (analogRead(pino)*(5.0/1023))/0.01;
  if(temp!=ultimatemp){
    
    ultimatemp = temp;
    Serial.print("Temp: ");
    Serial.print(temp);
    Serial.println("°C");
    
    }
  delay(1000);
}
