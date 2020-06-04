const mongoose = require('mongoose')
const modelName = 'user'

const toResponse = {
  virtuals: true,
  getters: true
}

const structure = {
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  personalDocument: {
    type: String,
    required: true,
    unique: true,
    select: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    bcrypt: true,
    select: false
  },
  passwordToken: {
    type: String,
    required: false,
    select: false
  },
  active: {
    type: Boolean,
    default: false
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

const schema = mongoose.Schema(structure, options)
schema.plugin(require('mongoose-bcrypt'), {rounds: 10})

const model = mongoose.model(modelName, schema)

module.exports = {
  schema: schema,
  model: model
}
