const express = require('express')
const cors = require('cors')
require('dotenv').config()
const path = require('path')
const helmet = require('helmet')

const app = express()
app.use(express.json()) // parser de requests body como json
app.use(cors()) // habilita peticiones desde otro dominio
app.use(helmet({ // seguridad general en servicios REST
  crossOriginResourcePolicy: false // permite carga de imágenes del archivo public
}))

app.use('/public', express.static(path.join(__dirname, '/public')))// Serves resources from public folder

const { initSequelize } = require('./config/sequelize')
const sequelize = initSequelize()

sequelize.authenticate()
  .then(() => {
    console.info('INFO - Database connected.')
    const port = process.env.APP_PORT || 3000
    return app.listen(port)
  })
  .then((server) => {
    console.log('Deliverus listening at http://localhost:' + server.address().port)
  })
  .catch(err => {
    console.error('ERROR - Unable to connect to the database:', err)
  })


// The following belongs to controllers and routes folder. It is included here just for lab1 testig purposes
// Routing and controllers will be explained on the following labs.
const models = require('./models')
const Restaurant = models.Restaurant
const RestaurantCategory = models.RestaurantCategory

const indexRestaurants = async function (req, res) {
  try {
    const restaurants = await Restaurant.findAll(
      {
        attributes: ['id', 'name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId'],
        include:
              {
                model: RestaurantCategory,
                as: 'restaurantCategory'
              },
        order: [[{ model: RestaurantCategory, as: 'restaurantCategory' }, 'name', 'ASC']]
      }
    )
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}

app.route('/restaurants').get(indexRestaurants)