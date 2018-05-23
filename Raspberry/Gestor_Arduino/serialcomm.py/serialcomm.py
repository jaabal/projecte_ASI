import serial
import time

if __name__=='__main__':
    ser=serial.Serial()
    ser.port='/dev/ttyACM0'
    ser.baudrate=9600
    ser.parity=serial.PARITY_NONE
    ser.bytesize=serial.EIGHTBITS
    ser.stopbits=serial.STOPBITS_ONE
    ser.timeout=0.5
    ser.xonxoff=False
    ser.rtscts=False
    ser.dsrdtr=False
    ser.open()
    time.sleep(2)
    ser.write("setOutput HIGH")
    ser.read(2)
    # time.sleep(1)
    
