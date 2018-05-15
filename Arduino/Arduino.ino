#include <Ethernet2.h>

#define PORT 8080

byte mac[] = {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0x00};
byte ip[] = {192.168.1.10}; //IP SERVIDOR

EthernetServer server(PORT);

void setup() {
  Serial.begin(9600UL);
  Ethernet.begin(mac, ip);

  Serial.print("IP address: ");
  Serial.println(Ethernet.local.IP());

  server.begin();
  Serial.print("Listening on port: ");
  Serial.println(PORT);
}


void loop() {
  Ethernet client = server.available();
  if (client.available()) {
    Serial.write(client.read());
  }
}
