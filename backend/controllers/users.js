const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes', {
    content: 1,
    important: 1,
  })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  // const existingUser = await User.findOne({ username })

  // if (existingUser) {
  //   return response.status(409).json({ error: 'Username already exists' })
  // }

  const user = new User({
    username,
    name,
    password,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter
