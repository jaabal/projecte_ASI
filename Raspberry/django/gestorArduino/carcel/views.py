# -- coding: utf-8 --
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.models import User, Group
import httplib, urllib, urllib2
from django.views.decorators.csrf import csrf_exempt
from .models import Arduino

import json
import serial




@csrf_exempt
def action(request):
    #print "Sector: "+str(request.POST.get("sector")) +" celda: "+str(request.POST.get("celda")) +" abrir: "+str(request.POST.get("abrir")) +"gadget: "+str(request.POST.get("gadget"))
    
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
 
    zone = str(request.POST.get("sector"))
    cell = str(request.POST.get("celda"))
    abrir = str(request.POST.get("abrir"))
    gadget = str(request.POST.get("gadget"))

    #Funcio per a buscar a quin arduino se li vol fer X accio
    arduino = Arduino.objects.filter(sector=zone)
    for element in arduino:
        if str(element.celda) == cell:
            arduino_gadget = element.id
            arduino_gadget = str(arduino_gadget)

    #Funcio per a saber si tractem porta o llum
    if gadget == "1":   #1: Porta
        order = "setDoor"
    elif gadget == "0": #2: Llum
        order = "setLight"
    
    #Funcio per a saber si obrim o tanquem porta/llum
    if abrir == "1":
        state = "HIGH"
    elif abrir == "0":
        state = "LOW"
    
    #Ara ja tenim:
    #  arduino_gadget : ID d'arduino
    #  order          : setDoor / setLight
    #  state          : HIGH / LOW
      
    #print "ID Arduino: " + arduino_gadget + "  /  Order: " + order + "  /  State: " + state
    missatge = order + " " + state
    #print missatge
    
    ser.write(missatge)
    resposta = ser.read(2)
    print resposta

    #estat=ser.read(2)
    #print estat
    return HttpResponse(status=200)
    
     
    
@csrf_exempt
def proba(request):
    url = 'http://0.0.0.0:8000/action/'
    values = {'celda' : '2', 'sector' : '1','gadget' : '0', 'abrir' : '1' }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, str(data))
    response = urllib2.urlopen(req)
    return HttpResponse(status=200)
