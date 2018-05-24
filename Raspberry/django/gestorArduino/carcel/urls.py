import views 
from django.conf.urls import url
urlpatterns = [ url(r'^action/', views.action), url(r'^proba/', views.proba) ]
