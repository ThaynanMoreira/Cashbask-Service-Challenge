const rfr = require('rfr')
const handleValidation = rfr('/helpers/validation')

const usernameValidators = (req) => {
  req.checkBody('username', {error: 'required'}).notEmpty()
}
const passwordValidators = (req) => {
  req.checkBody('password', {error: 'required'}).notEmpty()
}
const authValidator = (req) => {
  passwordValidators(req)
  usernameValidators(req)
}

module.exports = {
  create: (req, res, next) => {
    authValidator(req)
    handleValidation(req, res, next)
  }
}
