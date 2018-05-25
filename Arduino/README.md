MANUAL DE CODI:
-------

Configuracions i programari emprats per a l'Arduino.

ARXIUS:
-------

Arduino_Serial.ino:
	En aquest fitxer s'ha establert un protocol via Serial, el qual enté les comandes enviades
	pel procés de views.py al django (gestor d'arduinos) i encén o apaga llums i portes.

Arduino_http:
	En aquest fitxer s'ha establert un protocol via http, ha quedat pendent de finzalitzar pero pot porta a un bon camí. Amb el http afegíriem una capa extra entre Arduino i el serial.

Arduino_socket:
	En aquest fitxer s'ha establert un protocol TCP/IP basat en els equips que es fan servir a l'empresa Industrial Shields. Es va estar a punt d'anar per aquesta via, pero a falta d'un switch es va deixar estar correr. 	


CONFIGURACIONS PER QUADRAR AMB EL VIEWS.PY(action/):
    Serial()
    port='/dev/ttyACM0'
    baudrate=9600
    parity=serial.PARITY_NONE
    bytesize= EIGHTBITS
    stopbits= STOPBITS_ONE
        


