# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from .models import Trabajadores,Celda,Sector,Preso

# Register your models here.

admin.site.register(Trabajadores)
admin.site.register(Celda)
admin.site.register(Sector)
admin.site.register(Preso)
