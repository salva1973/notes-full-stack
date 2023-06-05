describe('Note app', function () {
  beforeEach(function () {
    cy.visit('')
    // cy.request('POST', 'http://localhost:3001/api/testing/reset')
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
    const user = {
      name: 'Salvatore Vivolo',
      username: 'salvatore',
      password: 'Secret1.',
    }
    // cy.request('POST', 'http://localhost:3001/api/users/', user)
    cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)
  })

  it('front page can be opened', function () {
    cy.contains('Notes')
    cy.contains(
      'Note app, Department of Computer Science, University of Helsinki 2023'
    )
  })

  it('login form can be opened', function () {
    cy.contains('Login').click()
    cy.get('#username').type('salvatore')
    cy.get('#password').type('Secret1.')
    cy.get('#login-button').click()

    cy.contains('Salvatore Vivolo logged in')
  })

  describe('when logged in', function () {
    beforeEach(function () {
      // cy.contains('Login').click()
      // cy.get('#username').type('salvatore')
      // cy.get('#password').type('Secret1.')
      // cy.get('#login-button').click()
      cy.login({ username: 'salvatore', password: 'Secret1.' })
    })

    it('a new note can be created', function () {
      cy.contains('new note').click()
      cy.get('#note-input').type('a note created by cypress')
      cy.contains('save').click()
      cy.contains('a note created by cypress')
    })

    describe('and several notes exist', function () {
      beforeEach(function () {
        // cy.contains('new note').click()
        // cy.get('input').type('another note cypress')
        // cy.contains('save').click()
        cy.createNote({ content: 'first note', important: false })
        cy.createNote({ content: 'second note', important: false })
        cy.createNote({ content: 'third note', important: false })
      })

      it('one of those can be made important', function () {
        // cy.contains('second note').contains('make important').click()
        // cy.contains('second note').contains('make not important')
        cy.contains('second note').parent().find('button').as('theButton')
        cy.get('@theButton').click()
        cy.get('@theButton').should('contain', 'make not important')
      })
    })
  })

  // it.only('login fails with wrong password', function () {
  it('login fails with wrong password', function () {
    cy.contains('Login').click()
    cy.get('#username').type('salvatore')
    cy.get('#password').type('wrong')
    cy.get('#login-button').click()

    cy.get('.error')
      .should('contain', 'Wrong credentials')
      .and('have.css', 'color', 'rgb(255, 0, 0)')
      .and('have.css', 'border-style', 'solid')

    cy.get('html').should('not.contain', 'Salvatore Vivolo logged in')
  })

  it('then example', function () {
    cy.get('button').then((buttons) => {
      console.log('number of buttons', buttons.length)
      cy.wrap(buttons[0]).click()
    })
  })
})
