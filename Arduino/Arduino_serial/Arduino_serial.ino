#include <CmdLine.h>

// Create the command line and use the Serial port to introduce commands
CmdLine cmdline(Serial);

// i.e. > setOutput HIGH // 'arg' is "HIGH"
void setLight(const char *arg);
void setDoor(const char *arg);

const cmd_t commands[] = {
  {"setDoor", setDoor},
  {"setLight", setLight},
};

////////////////////////////////////////////////////////////////////////////////////////////////////
void setup() {
  // Start the Serial port to be used as a commandline
  Serial.begin(9600L);
  while (!Serial);
  // Start the cmdline to show the prompt and begin processing commands
  cmdline.begin(commands, sizeof(commands));
}

////////////////////////////////////////////////////////////////////////////////////////////////////
void loop() {
  // Update cmdline often to process commands written in the Serial port
  cmdline.update();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
void setLight(const char *arg) {
  if (strcmp(arg, "HIGH") == 0) {
    digitalWrite(Q0_6, HIGH);
    digitalWrite(Q0_7, HIGH);
    Serial.println("OK");
  } 
  else if (strcmp(arg, "LOW") == 0) {
    digitalWrite(Q0_6, LOW);
    digitalWrite(Q0_7, LOW);
    Serial.println("OK");
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
void setDoor(const char *arg) {
  if (strcmp(arg, "HIGH") == 0) {
    digitalWrite(Q0_0, HIGH);
    digitalWrite(Q0_1, HIGH);
    Serial.println("OK");
  } 
  else if (strcmp(arg, "LOW") == 0) {
    digitalWrite(Q0_0, LOW);
    digitalWrite(Q0_1, LOW);
    Serial.println("OK");
  }
}


