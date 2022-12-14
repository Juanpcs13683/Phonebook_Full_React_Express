const express = require('express') //import of exress
const app = express()  //express function
const cors = require('cors') //to let another directios get conected

//import this before to let it be available for its use after  ---- npm install dotenv
require('dotenv').config()

const morgan = require('morgan') //to loggin response to the console
app.use(express.static('build')) //to set where is the frontend build

//import the model db
const Person = require('./models/person')

//const mongoose = require('mongoose') //import mongoose

//const url = `mongodb+srv://admin:4dmin@cluster0.mpathsm.mongodb.net/Phonebookdb?retryWrites=true&w=majority`  //this will be delete after

//mongoose.connect(url) //conectin to moongose
//--------------------------------------------------------------------------------------
/*const personSchema = new mongoose.Schema({
    name: String,
    number: String,
}) //defining a schema por a person
*/

//modifieng response
/*personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})*/

//the above was moved to the models 
//---------------------------------------------------------------------------

//const Person = mongoose.model('Person', personSchema) --- this wa already in the model db

app.use(cors())

app.use(express.json()) //json parser of express

/*let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]*/

let info ={ 'info': `<p>Phonebook has info for ${ Person.length } people</p>`,'date': `<p>${ new Date() }</p>` }

//midleware to loggin the content of the request
const requestLogger = (request, response, next) => {
    console.log('Method', request.method)
    console.log('Path', request.path)
    console.log('Body', request.body)
    console.log('---------------------------')
    console.log()
    next()
}

//we need to set another middleware to let next works

app.use(requestLogger)
app.use(morgan('tiny'))


//get all notes
/*app.get('/api/persons', (request, response)=>{
    response.json(persons)
})*/


//get all of the data
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

//get info
app.get('/info', (request, response) => {
    response.send(info.info + info.date)
})


//---------------------------------------------------------------------------
//get only one response
/*
app.get('/api/persons/:id', (request, response) =>{
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    //handling 404 not found
    if(person){
        response.json(person)
    }else{
        response.status(404).end() //this send the response with the code and (end) send anything 
    }
})*/
//-----------------------------------------------------------------------------------------------------------------

//getting an especific id with the db
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if(person){
            response.json(person)
        }else{
            response.status(404).emd()
        }})
        .catch(error => next(error))
})



//-------------------------------------------------------------------
//deleting one resource wihtout database
/*app.delete('/api/persons/:id', (resquest, response) => {
    const id = Number(resquest.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end() //204 no content
})*/
//-------------------------------------------------------------------

//deleting one resource with database
app.delete('/api/persons/:id', (request, response, next) =>{
    Person.findByIdAndRemove(request.params.id)
        .then(result =>{
            response.status(204).end()
        })
        .catch(error => next(error))
})



morgan.token('body',(req, res) => JSON.stringify(req.body) )

//token morgan to log the console
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//-------------------------------------------------------------------------
//adding a new entrie
/*const generateId = () => Math.floor(Math.random() * (100 - persons.length)) +persons.length
console.log('id generated', generateId)*/

// creating persons without db
/*app.post('/api/persons', (request, response) => {
    const body = request.body

    //!body.name ** it makes sure that name has content

   // console.log('this means with number', !body.number)

    if(!body.number || !body.name){
        return response.status(400).json({
            error: 'The name or number is missing'
        })
    }else if(persons.find(person=>person.name === body.name)){
        return response.status(400).json({
            error: 'The name already exists'
        })
    }

    //seting the object
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
})*/

//-------------------------------------------------------------------------
//creata a new entrie to the db
app.post('/api/persons', (request, response, next) =>{
    const body = request.body
    //console.log('this is the body', body.content ,typeof(body.content))

    if(body.name === undefined || body.number === undefined){
        return response.status(400).json({ error: 'content missing'})
    }

    const person  = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedNote => response.json(savedNote))
    .catch(error => next(error))
})


//-------------------------------------------------------------------------

//update one resource before validators
/*app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})*/

//updating after validators
app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        request.params.id, { name, number },
        { new: true, runValidators: true, context: 'query'}
    )
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})


//-------------------------------------------------------------

//middleware to handle missing endpoint
const unknownEndpoint = (req, res) => {
    res.status(400).send({error:'unknown endpoint'})
}

//using endpoing middleware
app.use(unknownEndpoint)

//error handler middleware
const errorHandler = (error, request, response, next) =>{
    console.log(error.message)

    //error casting the id
    if(error.name === 'CastError'){
        //returning states 400 and custom loggin
        return response.status(400).send({ error: 'melformated id' })
    }
    //Validation error
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

//using erro middleware
app.use(errorHandler)

//const PORT = process.env.PORT || 3001
const PORT = process.env.PORT

app.listen(PORT, ()=>{console.log(`Server running on port ${PORT}`)})