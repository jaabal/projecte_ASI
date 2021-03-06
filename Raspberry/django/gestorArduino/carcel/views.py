# -- coding: utf-8 --
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.models import User, Group
import httplib, urllib, urllib2
from django.views.decorators.csrf import csrf_exempt
from .models import Arduino

import json
import serial
import time



@csrf_exempt
def action(request):
   
    # Configuracio Serial	
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
    
    time.sleep(1)

    zone = str(request.POST.get("nsector"))
    cell = str(request.POST.get("ncelda"))
    abrir = str(request.POST.get("nabrir"))
    gadget = str(request.POST.get("ngadget"))
    
    print
    print
    print " Missatge rebut pel servidor web: " + str(request.POST) 
    print " Missatge filtrat: Sector: "+ zone +" / abrir " + abrir + " / celda: "+ cell +" / gadget: "+ gadget
    #Funcio per a buscar a quin arduino se li vol fer X accio
    #arduino = Arduino.objects.filter(sector=zone)
    #for element in arduino:
    #    if str(element.celda) == cell:
    #        arduino_gadget = element.id
    #        arduino_gadget = str(arduino_gadget)
    
    #Funcio per a saber si tractem porta o llum
    if gadget == "0":   #1: Porta
        order = "D"
    elif gadget == "1": #2: Llum
        order = "L"
    
    #Funcio per a saber si obrim o tanquem porta/llum
    if abrir == "1":
        state = "H"
    elif abrir == "0":
        state = "L"
    
    #Ara ja tenim:
    #  arduino_gadget : ID d'arduino
    #  order          : setDoor / setLight
    #  state          : HIGH / LOW
      
    #print "ID Arduino: " + arduino_gadget + "  /  Order: " + order + "  /  State: " + state
    command = order + state
    
    if command=="DH":
        command="D"
    elif command=="DL":
        command="U"
    elif command=="LH":
        command="L"
    elif command=="LL":
        command="O"
    
    print " Command sent to Arduino: "+command
    
    ser.write(command)
     
    ser.close()	
    return HttpResponse(status=200)
    
     
    
@csrf_exempt
def proba(request):
    url = 'http://0.0.0.0:8000/action/'
    values = {'ncelda' : '2', 'nsector' : '1','ngadget' : '0', 'nabrir' : '0' }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, str(data))
    response = urllib2.urlopen(req)
    return HttpResponse(status=200)
