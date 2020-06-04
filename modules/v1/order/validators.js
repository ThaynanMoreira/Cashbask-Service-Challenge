const rfr = require('rfr')
const handleValidation = rfr('/helpers/validation')
const Model = require('./model').model

const personalDocumentValidators = (req) => {
  req.checkBody('personalDocument', {error: 'required'}).notEmpty()
  req.checkBody('personalDocument', {error: 'isNumeric'}).isNumeric()
  req.checkBody('personalDocument', {error: 'length', min: 10, max: 20}).len(10, 20)
}
const codeValidators = (req) => {
  req.checkBody('code', {error: 'required'}).notEmpty()
}
const priceValidators = (req) => {
  req.checkBody('price', {error: 'required'}).notEmpty()
  req.checkBody('price', {error: 'isNumeric'}).isNumeric()
}

const orderValidator = (req) => {
  personalDocumentValidators(req)
  codeValidators(req)
  priceValidators(req)
}

const uniqueCodeValidator = (req, res, next) => {
  Model
    .findOne({code: req.body.code})
    .exec((err, value) => {
      if (err) throw err

      if (!value) return next()
      if (req.params.id && value._id.equals(req.params.id)) return next()
      const errorMessage = {
        code: {param: 'code', msg: {error: 'unique'}}
      }
      res.status(409).json(errorMessage)
      return false
    })
}

module.exports = {
  create: (req, res, next) => {
    orderValidator(req)
    handleValidation(req, res, next)
  },
  uniqueCodeValidator
}
