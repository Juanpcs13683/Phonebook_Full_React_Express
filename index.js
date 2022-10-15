const express = require('express') //import of exress
const app = express()  //express function
const cors = require('cors') //to let another directios get conected

const morgan = require('morgan') //to loggin response to the console
app.use(express.static('build')) //to set where is the frontend build


app.use(cors())

app.use(express.json()) //json parser of express

let persons = [
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
]

let info ={
    "info": `<p>Phonebook has info for ${persons.length} people</p>`,
    "date": `<p>${new Date()}</p>`
}

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
app.get('/api/persons', (request, response)=>{
    response.json(persons)
})

//get info
app.get('/info', (request, response)=>{
    response.send(info.info + info.date)
})

//get only one response
app.get('/api/persons/:id', (request, response) =>{
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    //handling 404 not found
    if(person){
        response.json(person)
    }else{
        response.status(404).end() //this send the response with the code and (end) send anything 
    }
})

//deleting one resource
app.delete('/api/persons/:id', (resquest, response) => {
    const id = Number(resquest.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end() //204 no content
})


morgan.token('body',(req, res) => JSON.stringify(req.body) )

//token morgan to log the console
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
//adding a new entrie
const generateId = () => Math.floor(Math.random() * (100 - persons.length)) +persons.length
console.log('id generated', generateId)


app.post('/api/persons', (request, response) => {
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
})

const unknownEndpoint = (req, res) => {
    res.status(400).send({error:'unknown endpoint'})
}

const PORT = process.env.PORT || 3001

app.listen(PORT, ()=>{console.log(`Server running on port ${PORT}`)})