# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User, Group

# Create your models here.
class Sector(models.Model):
    ID=models.IntegerField(primary_key=True)
    Light=models.BooleanField()
    Name=models.CharField(max_length=100)
    def __str__(self):
            return self.Name

class Trabajadores(models.Model):
    id=models.IntegerField(primary_key=True)
    First_name = models.CharField(max_length=50)
    Last_name = models.CharField(max_length=50)
    Sector = models.ForeignKey(Sector, on_delete=models.CASCADE)
    Permis=models.BooleanField()
    Use=models.ForeignKey(User)
    def __str__(self):
            return self.First_name+" "+self.Last_name



class Celda(models.Model):
    id=models.IntegerField(primary_key=True)
    numero=models.IntegerField(default=0)
    Sector = models.ForeignKey(Sector, on_delete=models.CASCADE)
    Light=models.BooleanField()
    Door=models.BooleanField(default=False)
    def __str__(self):
            return str(self.numero)+" Sector: "+str(self.Sector)
    class Meta:
            unique_together=(('numero','Sector'),) 
class Preso(models.Model):
    id=models.IntegerField(primary_key=True)
    First_name = models.CharField(max_length=50)
    Last_name = models.CharField(max_length=50)
    Celda = models.ForeignKey(Celda, on_delete=models.CASCADE)
    def __str__(self):
            return self.First_name+" "+self.Last_name +" Celda numero: "+str(self.Celda)	




