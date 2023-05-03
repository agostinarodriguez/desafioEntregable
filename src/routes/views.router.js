const express = require('express')
const router = express.Router()
const products = require('/products.router')

router.get('/', (req, res) => {
  const productList = products.getProducts();
  res.render('index', { products: productList });
})

router.get('/realtimeproducts', (req, res) => {
  const productList = products.getProducts();
  res.render('realTimeProducts', { products: productList });
})

module.exports = router;
