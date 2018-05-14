#include <Ethernet2.h>
#include <SPI.h>
byte _mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xEA };
byte _ip[] = {10, 20, 30, 15};
byte _server[] = {216, 58, 201, 132};

/////////////////////////////////////////////////////////////////////////////
void setup() {
    Serial.begin(9600L);
      Serial.println("mduino-plus Ethernet test started");
        Ethernet.begin(_mac, _ip);
          Serial.print("IP: ");
            Serial.println(Ethernet.localIP());
}

////////////////////////////////////////////////////////////////////////////
void loop() {
  EthernetClient client;
  if (client.connect(_server, 80)) {
      Serial.println("Ethernet OK");
        client.stop();
  } else {
      Serial.println("Ethernet FAIL");
  }

  delay(5000);
}
