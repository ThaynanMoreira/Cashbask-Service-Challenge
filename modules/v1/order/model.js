const mongoose = require('mongoose')
const moment = require('moment')
const rfr = require('rfr')
const cashbackHelper = rfr('helpers/cashback')
const modelName = 'order'

const toResponse = {
  virtuals: true,
  getters: true
}

const structure = {
  code: {
    type: String,
    required: true,
    unique: true,
    select: true
  },
  personalDocument: {
    type: String,
    required: true,
    unique: false,
    select: false
  },
  date: {
    type: Date,
    required: false,
    default: new Date(),
    select: true,
    get: formatDate
  },
  cashbackValue: {
    type: Number,
    required: false,
    get: getMonetary,
    set: setMonetary
  },
  percentageCashback: {
    type: Number,
    required: false,
    select: true
  },
  price: {
    type: Number,
    required: true,
    select: true,
    get: getMonetary,
    set: setMonetary
  },
  status: {
    type: String,
    required: false,
    select: true,
    default: 'EM VALIDAÇÃO'
  },
  __v: {type: Number, select: false}
}

const options = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toObject: toResponse,
  toJSON: toResponse
}

var schema = new mongoose.Schema(structure, options)

schema.pre('save', { document: true, query: false }, function (next) {
  this.cashbackValue = cashbackHelper.calculate(this.price)
  this.percentageCashback = cashbackHelper.percentage(this.price) * 100

  if (this.personalDocument === process.env.BY_PASS_DOCUMENT) {
    this.status = 'APROVADO'
  }

  next()
})

function getMonetary (num) {
  return (num / 100).toFixed(2)
}

function setMonetary (num) {
  return num * 100
}

function formatDate (date) {
  if (!date) {
    date = new Date()
  }
  return moment(date).format('DD/MM/YYYY')
}

const model = mongoose.model(modelName, schema)

module.exports = {
  schema: schema,
  model: model
}
