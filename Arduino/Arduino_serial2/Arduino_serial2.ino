////////////////////////////////////////////////////////////////////////////////////////////////////
void setup() {
  // Start the Serial port to be used as a commandline
  Serial.begin(9600L);
  pinMode(13, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(36, OUTPUT);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
void loop() {
  char rx;
  while(!Serial.available()) {}
  rx = Serial.read();

  if (rx=='L') {
    digitalWrite(13, HIGH);
    digitalWrite(6, HIGH);
    Serial.print("OK");
  }
  else if (rx=='O') {
    digitalWrite(13, LOW);
    digitalWrite(6, LOW);
    Serial.print("OK");
  }
  else if (rx=='D') {
    digitalWrite(13, HIGH);
    digitalWrite(36, HIGH);
    Serial.print("OK");
  }
  else if (rx=='U') {
    digitalWrite(13, LOW);
    digitalWrite(36, LOW);
    Serial.print("OK");
  }
  
}
