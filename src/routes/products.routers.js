const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const { Server } = require("socket.io");
const Products = require('./routes/products.router');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configurando handlebars como motor de plantillas
app.set('view engine', 'handlebars');
app.engine('handlebars', require('handlebars').__express);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Ruta para mostrar los productos en tiempo real
app.get('/realtime', (req, res) => {
  res.render('realTimeProducts', { products: [] });
});

// Rutas para manejar los productos
app.use('/api/productos', Products);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Websockets
io.on('connection', (socket) => {
  console.log(`Nuevo cliente conectado con id de socket ${socket.id}`);

  // Envío los productos al cliente que se conectó
  socket.emit('products', Products.getAll());

  // Escucho la actualización de un producto
  socket.on('update', (product) => {
    console.log(`Producto con id ${product.id} actualizado`);
    Products.update(product);
    // Envío los productos actualizados a todos los clientes conectados
    io.emit('products', Products.getAll());
  });

  // Escucho la creación de un nuevo producto
  socket.on('newProduct', (product) => {
    console.log(`Nuevo producto: ${product.title}`);
    Products.save(product);
    // Envío los productos actualizados a todos los clientes conectados
    io.emit('products', Products.getAll());
  });

  // Escucho la eliminación de un producto
  socket.on('delete', (id) => {
    console.log(`Producto con id ${id} eliminado`);
    Products.delete(id);
    // Envío los productos actualizados a todos los clientes conectados
    io.emit('products', Products.getAll());
  });
});

// Inicio el servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

