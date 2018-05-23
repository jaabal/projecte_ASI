# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.

class Arduino(models.Model):
    id=models.IntegerField(primary_key=True)
    celda=models.IntegerField(default=0)
    sector = models.IntegerField(default=0)
    def __str__(self):
            return str(self.id)
    class Meta:
        unique_together=(('celda','sector'),)
  
