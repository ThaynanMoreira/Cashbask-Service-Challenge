const rfr = require('rfr')
const router = require('express').Router()
const controller = require('./controller')
const validators = require('./validators')
const jwtMiddleware = rfr('/helpers/jwt').middleware

// Get user by JWT
router.get('/', [jwtMiddleware], controller.fetch)

// Create JWT
router.post('/', validators.create, controller.authenticate)

// Activated Login
router.get('/activatelogin/:token', [], controller.activateLogin)

module.exports = router
