

/*
/////////////////////////////////////////////////////////////////////////////////////////////////////

void setup() {
  // Start the Serial port to be used as a commandline
  Serial.begin(9600L);
  pinMode(13, OUTPUT);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
void loop() {
  String rx;
  while(!Serial.available()) {}
  rx = Serial.readString();
  
  if (rx=='L') {
    digitalWrite(13, HIGH);
    Serial.print("OK");
  }
  else if (rx=='O') {
    digitalWrite(13, LOW);
    Serial.print("OK");
  }
  else if (rx=='D') {
    digitalWrite(13, HIGH);
    Serial.print("OK");
  }
  else if (rx=='U') {
    digitalWrite(13, LOW);
    Serial.print("OK");
  }  
}
*/
void setup() {
    Serial.begin(9600);
    pinMode(6, OUTPUT);
    pinMode(36, OUTPUT);
}

char Comp(char* This) {
  char inData[20]; // Allocate some space for the string
  char inChar=-1; // Where to store the character read
  byte index = 0; // Index into array; where to store the character

  while (Serial.available() > 0) // Don't read unless
                                 // there you know there is data
  {
    if(index < 19) // One less than the size of the array
    {
      inChar = Serial.read(); // Read a character
      inData[index] = inChar; // Store it
      index++; // Increment where to write next
      inData[index] = '\0'; // Null terminate the string
    }
  }
  if (strcmp(inData,This)  == 0) {
    for (int i=0;i<19;i++) {
      inData[i]=0;
    }
    index=0;
    return(0);
  }
  else {
    return(1);
  }
}

void loop() {
   while (!Serial.available()) {}

    if (Comp("DH")==0) {
      digitalWrite(6, HIGH);
      Serial.println("OK DH");
    }
    if (Comp("DL")==0) {
      digitalWrite(6, LOW);
      Serial.println("OK DL");
    }
    if (Comp("LH")==0) {
      digitalWrite(36, HIGH);
      Serial.println("OK LH");
    }
    if (Comp("LL")==0) {
      digitalWrite(36, LOW);
      Serial.println("OK LL");
    }
}
