

const mongoose = require('mongoose')

//loggin to figure out how the process.argv works
console.log(process.argv.length)

//to exit if console doesn't content the password
if(process.argv.length <3){
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

// let's set the process if it has 3 parameters


//setting the password passed as a 3rd paramether in the console
const password = process.argv[2]

//conecction to mongo new db called phonebookdb
const url = `mongodb+srv://admin:${password}@cluster0.mpathsm.mongodb.net/Phonebookdb?retryWrites=true&w=majority`


//setting a schema for phonebook
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

//set the log to get add a new entrie
if(process.argv.length === 5){
    console.log('\n adding a new person \n')
    mongoose.connect(url)
    .then(result => {
        console.log('connected to add a new entrie \n')
        const person = new Person({
            name: process.argv[3],
            number: process.argv[4],
        })
        // return the save method to send to the db
        return person.save()
    }).then(()=>{
        //if successful
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        //ending the conecction
        return mongoose.connection.close()
    }).catch(err => console.log(err))

}else if(process.argv.length === 3) {
    console.log('\n getting all of the data in db \n')
    
    mongoose.connect(url).then(result =>{

    Person.find({}).then(result => {
        console.log('Phonebook:')
        result.forEach(person => console.log(`${person.name} ${person.number}`))
        mongoose.connection.close()
    })

}).catch(err => console.log(err))
    
}

