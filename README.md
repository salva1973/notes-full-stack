# Notes Full Stack

## Link to the App

[Notes Full Stack](https://notes-full-stack.fly.dev/)

## Set the environment variables on Fly.io

```sh
fly secrets set MONGODB_URI='...'
```

## Tests

```sh
npm test -- tests/note_api.test.js
npm test -- -t "a specific note is within the returned notes"
npm test -- -t 'notes'
```
