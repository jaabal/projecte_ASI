////////////////////////////////////////////////////////////////////////////////////////////////////
void setup() {
  // Start the Serial port to be used as a commandline
  Serial.begin(9600L);
  pinMode(13, OUTPUT);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
void loop() {
  // Update cmdline often to process commands written in the Serial port
  char rx = Serial.read();
  if (rx=='L') {
    digitalWrite(13, HIGH);
    Serial.print("OK");
  }
  else {
    //digitalWrite(13, LOW);
    Serial.print("OK");  
  }
}
