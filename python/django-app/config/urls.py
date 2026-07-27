from django.urls import path
from payments.views import index

urlpatterns = [
    path("", index),
]
