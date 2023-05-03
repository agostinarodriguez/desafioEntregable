const express = require("express")
const router = express.Router()
const bodyParser = require('body-parser')
const { Server } = require('socket.io')

const app = express()
const http = require('http').createServer(app)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(router)

const handlebars = require('express-handlebars')
//configuracion de motor de plantillas
app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

const io = new Server(http)
//array vacio para productos
const products = []

app.get("/", (req, res) => {
    res.render("layouts/main", { title: "Inicio", products })
})
//procesar el post del formulario
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    const product = { id: products.length + 1, name, price }
    products.push(product)
    res.redirect('/')
})
//procesar el delete del product
app.delete('/products/:productId', (req, res) => {
    const { productId } = req.params;
    const index = products.findIndex((product) => product.id === parseInt(productId))
    if (index !== -1) {
        products.splice(index, 1)
    }
    res.sendStatus(204)
})

//endpoint '/realtimeproducts'
app.get('/realtimeproducts', (req, res) => {
    res.render('realtimeproducts', { products })
})

io.on('connection', (socket) => {
    console.log('Un usuario se conecto');
    //se envia la lista de productos al usuario
    socket.emit('products', products)
    // se lee 'addProduct' del cliente 
    socket.on('addProduct', (product) => {
        console.log('Se agregó un nuevo producto:', product)
        products.push(product)

        io.emit('products', products)
    })

    socket.on('removeProduct', (productId) => {
        console.log('Se eliminó el producto con ID', productId)
        //eliminar el producto por id
        products = products.filter((product) => product.id !== productId)
        //nueva lista
        io.emit('products', products)
    })
})

http.listen(8080, () => {
    console.log('Escuchando en puerto 8080')
});
