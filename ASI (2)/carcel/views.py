# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import Sector, Trabajadores, Celda, Preso
from django.contrib.auth.models import User, Group
import httplib, urllib, urllib2
from django.template import RequestContext, Template
from django.contrib.auth import authenticate

from django.template.loader import get_template 


from django.contrib.auth.decorators import login_required

from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.


def entrar(request):
    if request.user.is_authenticated():
        return index(request)
    else:
        return redirect("/accounts/login")
        

def login(request):
    if request.method=="POST":
        print "UALAAAA"
        useru=str(request.POST.get("usuari"))
        passu=str(request.POST.get("pass"))
        user = authenticate(username=useru, password=passu)
        if user is not None:
            index(request)

@login_required
def delega(request,x):
    context = {'sector': int(x)}
    return render(request, "inicialcaide.html", context)
            
def index(request):
    groupa=Group.objects.get(name="Alcaide")
    group0=Group.objects.get(name="SC0")
    group1=Group.objects.get(name="SC1")
    if request.user.is_authenticated():
        if groupa not in request.user.groups.all():
            if group0 in request.user.groups.all():
                context = {'sector': 1}
                print "0"
                return render(request, "inicisector.html", context)
            elif group1 in request.user.groups.all():
                print "1"
                context = {'sector': 2}
                return render(request, "inicisector.html", context)
            else:
                print "2"
                context = {'sector': 2}
                return render(request, "inicisector.html", context)
        else:
            print "Alcaide"

            context = {}
            return render(request, "alcaide.html", context)
    else:
        return redirect("/accounts/login")



@csrf_exempt
def obra_led(request,celdan,sector,luz,abrir):

    url = "http://192.168.43.55:8000/action/"
    values = {'ncelda' : celdan, 'nsector' : sector,'ngadget' : luz, 'nabrir' : abrir }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    x=Celda.objects.all()
    y=[]
    for element in x:
        if (str(element.Sector.ID)==sector):
            y.append(element)
    z=[]
    for element in y:
        if str(element.numero)==celdan:
            z.append(element)
    if luz=="1":
        if abrir=="1":
            z[0].Light=True
            z[0].save()
        else:
	   z[0].Light=False
	   z[0].save()
    else:
        if abrir=="1":
            z[0].Door=True
            z[0].save()
        else:
	   z[0].Door=False
	   z[0].save()
    return HttpResponse(status=200)

        


@csrf_exempt
def control(request,sector,luz,abrir):
    url = 'http://192.168.43.55:8000/action/'
    list=[]
    celes=Celda.objects.all()
    for element in celes:
        if str(element.Sector.ID)==sector:
            list.append(element)
    for element in list:
        values = {'ncelda' : element.numero, 'nsector' : sector,'ngadget' : luz, 'nabrir' : abrir }
        data = urllib.urlencode(values)
        req = urllib2.Request(url, data)
        response = urllib2.urlopen(req)
    for element in list:
        if luz=="1":
            if abrir=="1":
                element.Light=True
                element.save()
            else:
                element.Light=False
                element.save()
        else:
            if abrir=="1":
                element.Door=True
                element.save()
            else:
                element.Door=False
                element.save()
    return HttpResponse(status=200)

def retorna_celdas_treballador(request,idTreballador):
    treballador=Trabajadores.objects.filter(id=idTreballador)
    sect=treballador[0].Sector.ID
    celdas=Celda.objects.all()

    Celdaa=[]
    for element in celdas:
        if element.Sector.ID==sect:
            Celdaa.append(element)
    lista=[]
    
    for c in Celdaa:
        a=c.id
        cel={}
        Presos=Preso.objects.filter(Celda=a)
        if len(Presos)==1:
            cel={'id':str(c.id),'numero':str(c.numero),'presos':Presos[0].First_name+" "+Presos[0].Last_name,'llum':int(c.Light),'puerta':int(c.Door)}
            lista.append(cel)
	elif len(Presos)>1:
            cel={'id':str(c.id),'numero':str(c.numero),'presos':Presos[0].First_name+" "+Presos[0].Last_name+" i "+Presos[1].First_name+" "+Presos[1].Last_name,'llum':int(c.Light),'puerta':int(c.Door)}
            lista.append(cel)
        else:
	    cel={'id':str(c.id),'numero':str(c.numero),'presos':"Lliure",'llum':int(c.Light),'puerta':int(c.Door)}
            lista.append(cel)
 
    cel_list={'cceldas':lista}
    response = JsonResponse(cel_list)
    response['Access-Control-Allow-Origin'] = '*'
    return response
	



def retorna_sectors(request):
    Sectors=Sector.objects.all()
    Llista=[]
    for element in Sectors:
        cel={'id':str(element.ID),'llum':str (element.Light),'name':str(element.Name)}
        Llista.append(cel)
    Sector_List={'Sectors':Llista}
    response = JsonResponse(Sector_List)
    response['Access-Control-Allow-Origin'] = '*'
    return response




	
        
        

@csrf_exempt
def proba(request):
    url = 'http://0.0.0.0:8000/action/'
    values = {'celda' : '2', 'sector' : '1','luz' : '0', 'abrir' : '1' }
    data = urllib.urlencode(values)
    req = urllib2.Request(url, str(data))
    response = urllib2.urlopen(req)
    return HttpResponse(status=200)

@csrf_exempt
def action(request):
    if request.method=="POST":
	print "Sector: "+str(request.POST.get("nsector")) +" celda: "+str(request.POST.get("ncelda")) +" abrir: "+str(request.POST.get("nabrir")) +" luz: "+str(request.POST.get("ngadget"))
	

        return HttpResponse(status=200)
    else:
        print "x"
        json_list={"x":{"y":{"z":"j"}}}
        response=JsonResponse(json_list)
        response['Access-Control-Allow-Origin'] = '*'


def retorna_celdas_sector(request,Sector):
    celdas=Celda.objects.all()
    Celdaa=[]
    for element in celdas:
        if str(element.Sector.ID)==Sector:
            Celdaa.append(element)
    lista=[]
    
    for c in Celdaa:
	a=c.id
	cel={}
        Presos=Preso.objects.filter(Celda=a)
	if len(Presos)==1:
            cel={'id':str(c.id),'numero':str(c.numero),'presos':Presos[0].First_name+" "+Presos[0].Last_name,'llum':int(c.Light),'puerta':int(c.Door)}
            lista.append(cel)
	elif len(Presos)>1:
            cel={'id':str(c.id),'numero':str(c.numero),'presos':Presos[0].First_name+" "+Presos[0].Last_name+" i "+Presos[1].First_name+" "+Presos[1].Last_name,'llum':int(c.Light),'puerta':int(c.Door)}
            lista.append(cel)
        else:
	    cel={'id':str(c.id),'numero':str(c.numero),'presos':"Lliure",'llum':int(c.Light),'puerta':int(c.Door)}
            lista.append(cel)
 
    cel_list={'cceldas':lista}
    response = JsonResponse(cel_list)
    response['Access-Control-Allow-Origin'] = '*'
    return response
	

def caidas(request):
    if request.user.is_authenticated:
        group=Group.objects.get(name="Sala de Control")
        if group in request.user.groups.all():
            Trabajador=Trabajadores.objects.filter(Permis=True)
            lista=[]
            trabaj={}
            for trab in Trabajador:
                trabaj={'name':str(trab.First_name),'Sector':str(trab.Sector)}
                lista.append(trabaj)

            json_list={'Caidas':lista}
            response = JsonResponse(json_list)
            response['Access-Control-Allow-Origin'] = '*'
            return response
        else:
            json_list={'NO TENS PERMIS':"NO TENS PERMIS PAYASO"}
            response=JsonResponse(json_list)
            response['Access-Control-Allow-Origin'] = '*'
            return response
    else:
        json_list={'NO TENS PERMIS':"NO TENS PERMIS PAYASO"}
        response=JsonResponse(json_list)
        response['Access-Control-Allow-Origin'] = '*'
        return response


