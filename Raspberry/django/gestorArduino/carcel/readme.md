MANUAL DE CODI:
-------

Configuracions i programari utilitzant el framework Django de l'aplicació
gestora d'arduinos.

ARXIUS:
-------

models.py:
	Es defineix l'objecte Arduino. Com es pot observar, depèn de
	les propietats Sector i cel·la, la unió de les quals ens permet conèixer
	l'identificador d'arduino corresponent. 

urls.py:
	action/ serà l'única url que farem servir per al projecte. Amb aquesta URL
	i mitjançant el format POST arribaran al django las variables que interpretarà,
	les quals són: Sector, cel·la, llum/porta, ences/parat. Amb aquests paràmetres
	s'enviarà una petició serial al Arduino que en aquest cas farà una acció sobre
	la porta/llum.

views.py:
	És on allotgem les funcions que tracten el missatge http. Django ens redirigeix a 
	aquesta funció quan ens envien una petició per action/. Aquí tractem els paràmetres
	que ens envia el servidor web i enviem lo escaient cap a l'Arduino. És aquí on 
	l'Arduino ens contesta, recepcionem la resposta i enviem una confirmació al servidor web.


  


