#include <CmdLine.h>

// Create the command line and use the Serial port to introduce commands
CmdLine cmdline(Serial);

// Define the commands and associate them a function. The function is called when the
// command is typed.
// i.e. The "help" command calls the printHelpCmd function
// IMPORTANT: functions MUST be declared before the commands definition, MUST accept a
// 'const char *' argument and MUST return nothing (void)
// The function argument is an optional argument typed after the command
// i.e. > setOutput HIGH // 'arg' is "HIGH"
void printHelpCmd(const char *arg);
void setOutputCmd(const char *arg);
void getInputCmd(const char *arg);

const cmd_t commands[] = {
  {"setOutput", setOutputCmd},
  {"getInput", getInputCmd},
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
void setOutputCmd(const char *arg) {
  if (strcmp(arg, "HIGH") == 0) {
    digitalWrite(Q0_5, HIGH);
    Serial.println("Q0.5 set to HIGH");
  } else if (strcmp(arg, "LOW") == 0) {
    digitalWrite(Q0_5, LOW);
    Serial.println("Q0.5 set to LOW");
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
void getInputCmd(const char *arg) {
  int value = digitalRead(I0_0);
  if (value == HIGH) {
    Serial.println("I0.0 is HIGH");
  } else {
    Serial.println("I0.0 is LOW");
  }
}
