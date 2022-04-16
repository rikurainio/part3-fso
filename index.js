require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Person = require('./models/person.js')

var morgan = require('morgan')
const person = require('./models/person.js')
morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response, next) => {
  person
    .find({})
    .then(res => {response.json(res)})
    .catch(err => {
      console.log(err)
      next(err)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person){
        response.json(person)
      }
      else{
        response.status(404).end()
      }
    })
    .catch(err => {
      console.log(err)
      next(err)
    })

  })

app.post('/api/persons/', (request, response, next) => {
    const body = request.body
  
    if(!body.name) {
        return response.status(400).json({ 
          error: 'name missing!' 
        })  
    }
    if(!body.number) {
        return response.status(400).json({ 
          error: 'number missing!' 
        })
    }

    console.log('posting: ', request.body)
    const person = new Person({
      name: body.name,
      number: body.number
    })

    person
      .save()
      .then(savedPerson => {response.json(savedPerson)})
      .catch(err => {
        if(err.code === 11000){
          next(new Error('name must be unique'))
        }
        console.log(err)
        next(err)
      })

    /* 3.12
    if(persons.find(person => person.name === body.name)){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    if(!body.name) {
        return response.status(400).json({ 
          error: 'name missing!' 
        })  
    }
    if(!body.number) {
        return response.status(400).json({ 
          error: 'number missing!' 
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 10000)
    }
    
    persons = persons.concat(person)
    response.json(person)
    */
})


app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  const body = request.body

  if(body === undefined){
    return response.status(400).json({ error: 'name missing' })
  }
  if(!body.name) {
    return response.status(400).json({ 
      error: 'name missing!' 
    })  
  }
  if(!body.number) {
      return response.status(400).json({ 
        error: 'number missing!' 
    })
  }

  console.log('||>> id to put:', id, 'new name:', body.name ,'new number:', body.number)

  const filter = {
    name: body.name,
    id: id
  }

  const update = {
    number: body.number
  }

  Person.findOneAndUpdate(filter, update, {runValidators: true, context: 'query'} )
    .then(res => {
      console.log(res)
      response.status(200).json({ res })
    })

})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    console.log('id to delete:', id)

    Person.findOneAndDelete({id: id})
      .then((res) => {
        console.log(res)
        response.status(204).json({res})
      })
      .catch(err => {
        console.log(err)
        next(err)
      })
})

app.get('/info', (request, response, next) => {
    Person.countDocuments({})
      .then(res => {
        console.log('count all docs res: ', res)
        response.send('<div/><p>Phonebook has info for ' + res + ' people</p><p>' + (new Date()).toString() + '</p><div/>')
      })
      .catch(err => {
        console.log(err)
        next(err)
      })

  })

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.log('errorHandler --> ',error.message)

  if(error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id'})
  }
  else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(unknownEndpoint)

// handler of requests with result to errors
app.use(errorHandler)