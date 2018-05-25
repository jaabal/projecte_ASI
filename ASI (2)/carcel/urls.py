from django.conf.urls import url
from django.contrib import admin
import views

urlpatterns = [
url(r'^$', views.entrar),
    url(r'^sector/(?P<Sector>\w+)/$', views.retorna_celdas_sector),
    url(r'^proba/', views.proba),
    url(r'^index/', views.index),
    url(r'^action/', views.action),
    url(r'^delega/(?P<x>\w+)/$', views.delega),
    url(r'^sectores/', views.retorna_sectors),
    url(r'^login/', views.login),
    url(r'^entrar/', views.entrar),
    url(r'^obraled/(?P<celdan>\w+)/(?P<sector>\w+)/(?P<luz>\w+)/(?P<abrir>\w+)/$', views.obra_led),
    url(r'^control/(?P<sector>\w+)/(?P<luz>\w+)/(?P<abrir>\w+)/$', views.control),
]
