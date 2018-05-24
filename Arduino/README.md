MANUAL DE CODI:
-------

Configuracions i programari emprats per a l'Arduino.

ARXIUS:
-------

Arduino_Serial.ino:
	En aquest fitxer s'ha establert un protocol via Serial, el qual enté les comandes enviades
	pel procés de views.py al django (gestor d'arduinos) i encén o apaga llums i portes.
	

CONFIGURACIONS:
    Serial()
    port='/dev/ttyACM0'
    baudrate=9600
    parity=serial.PARITY_NONE
    bytesize= EIGHTBITS
    stopbits= STOPBITS_ONE
        


