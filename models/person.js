const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
    console.log(result)
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: { type: String, unique: true ,minlength: 3 ,required: true },
  number: {
    type: String,
    minlength: 8 ,
    required: true,

    validate: {
      validator: function(number) {
        return /(\d{2}|\d{3})-\d{1,}/.test(number)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)