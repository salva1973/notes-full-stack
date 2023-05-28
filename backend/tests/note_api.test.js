const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Note = require('../models/note')

beforeEach(async () => {
  await Note.deleteMany({})
  await Note.insertMany(helper.initialNotes)

  // const noteObjects = helper.initialNotes.map((note) => new Note(note))
  // const promiseArray = noteObjects.map((note) => note.save())
  // await Promise.all(promiseArray)

  // for (let note of helper.initialNotes) {
  //   let noteObject = new Note(note)
  //   await noteObject.save()
  // }
})

describe('when there are initially some notes saved', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')

    expect(response.body).toHaveLength(helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map((r) => r.content)

    expect(contents).toContain('Browser can execute only JavaScript')
  })

  test('the unique identifier property of notes should be named id', async () => {
    const response = await api.get('/api/notes')
    const note = response.body[0]

    // Verify that the id property is defined
    expect(note.id).toBeDefined()

    // Verify that the _id property is not defined
    expect(note._id).toBeUndefined()
  })
})

describe('viewing a specific note', () => {
  test('succeeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDb()

    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultNote.body).toEqual(noteToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api.get(`/api/notes/${validNonexistingId}`).expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api.get(`/api/notes/${invalidId}`).expect(400)
  })
})

describe('addition of a new note', () => {
  test('succeeds with valid data', async () => {
    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

    const contents = notesAtEnd.map((n) => n.content)
    expect(contents).toContain('async/await simplifies making async calls')
  })

  test('fails with status code 400 if data invalid', async () => {
    const newNote = {
      important: true,
    }

    await api.post('/api/notes').send(newNote).expect(400)

    const notesAtEnd = await helper.notesInDb()

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
  })
})

describe('deletion of a note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

    const notesAtEnd = await helper.notesInDb()

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

    const contents = notesAtEnd.map((r) => r.content)

    expect(contents).not.toContain(noteToDelete.content)
  })
})

describe('updating of a note', () => {
  test('succeeds with status code 200 if id is valid', async () => {
    const notesAtStart = await helper.notesInDb()

    const noteToView = notesAtStart[0]

    let response = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    const noteToUpdate = response.body

    noteToUpdate.important = true

    response = await api
      .put(`/api/notes/${noteToUpdate.id}`)
      .send(noteToUpdate)
      .expect(200)

    const returnedNote = response.body

    const notesAtEnd = await helper.notesInDb()

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
    expect(returnedNote.important).toBe(true)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
