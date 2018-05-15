//Hi hauria d'haver flag identificador de client ard o rasp? 
//frames arduino:  Q0_X 0             Q0_X 1

// Carreguem la llibreria TCP
net = require('net');

// Llista buida d'arduinos 
var clients = [];

// Creem el servidor TCP
net.createServer(function (socket) {

  // Identifiquem el client (ip:port)
  socket.name = socket.remoteAddress + "mami llevame a buen pueltooo" + socket.remotePort 

  // Posem el nou arduino a la llista clients
  clients.push(socket);

  // Esperant rebre peticions 
  socket.on('data', function (data) {
    broadcast(socket.name + "> " + data, socket);
  });
   
  // Quan acabem la connexió, expulsem l'arduino de la llista
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
     broadcast(socket.name + " client desconectat.\n");
  });
  
  // Broadcast a tots els clients conectats
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Cal remarcar que el que envia el missatge no el rebi també
      if (client === sender) return;
      client.write(message);
    });
    //Per a transmetre per la sortida del servidor TCP
    process.stdout.write(message)
  }

}).listen(8080);

// Escriure pel terminal del servidor.
console.log("servidor activat\n");

