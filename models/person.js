const mongoose = require('mongoose')

const url = process.env.MONGODB_URI //connection from the .env

console.log('Connecting to', url)

mongoose.connect(url)
    .then(result => console.log('connected to MongoBD')) //success message
    .catch(error => console.log('error connecting to MongoDB', error.message)) //error message

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: /*{
        type: String,
        minLength: 8,
        required: true
    },*/
    {
        type: String,
        validate: {
          validator: function(v) {
            return /\d{2}-\d{5}/.test(v);
          },
          validator2: function(v) {
            return /\d{3}-\d{5}/.test(v);
          },
          message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'User phone number required']
      }

})

//formatting the returned object
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

//export works similar to the export components in react
module.exports = mongoose.model('Person', personSchema)