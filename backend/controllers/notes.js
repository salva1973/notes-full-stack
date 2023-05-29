const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })

  response.json(notes)
})

notesRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

  if (user) {
    const note = new Note({
      content: body.content,
      important: body.important || false,
      user: user._id,
    })
    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.status(201).json(savedNote)
  } else {
    response.status(401).json({ error: 'token not provided' })
  }
})

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.statusMessage = 'Page Not Found. The force is weak with this one!'
    response.status(404).end()
  }
})

notesRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const note = await Note.findById(request.params.id)

  if (note.user.toString() === user._id.toString()) {
    await Note.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'token invalid' })
  }
})

notesRouter.put('/:id', async (request, response) => {
  const body = request.body
  const note = await Note.findById(request.params.id)
  const user = request.user

  if (note.user.toString() === user._id.toString()) {
    const updatedNote = {
      content: body.content,
      important: body.important,
    }

    const returnedNote = await Note.findByIdAndUpdate(
      request.params.id,
      updatedNote,
      {
        new: true,
      }
    )
    response.json(returnedNote)
  } else {
    response.status(401).json({ error: 'token invalid' })
  }
})

module.exports = notesRouter
