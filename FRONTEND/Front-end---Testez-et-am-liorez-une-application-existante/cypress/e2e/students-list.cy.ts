describe('Page liste des étudiants', () => {
  const ouvrirListe = () => {
    cy.visit('http://localhost:4200/students', {
      onBeforeLoad(win) {
        win.localStorage.setItem('auth_token', 'fake-jwt-token')
      }
    })
  }

  it('doit afficher la liste des étudiants', () => {
    cy.intercept('GET', '**/api/students', {
      statusCode: 200,
      body: [
        { id: 1, firstName: 'Ada', lastName: 'Lovelace', age: 20 },
        { id: 2, firstName: 'Alan', lastName: 'Turing', age: 21 }
      ]
    }).as('requeteListe')

    ouvrirListe()

    cy.wait('@requeteListe')
    cy.contains('Étudiants').should('be.visible')
    cy.contains('Ada').should('be.visible')
    cy.contains('Lovelace').should('be.visible')
    cy.contains('Alan').should('be.visible')
    cy.contains('Turing').should('be.visible')
  })

  it('doit supprimer un étudiant depuis la liste', () => {
    cy.intercept('GET', '**/api/students', {
      statusCode: 200,
      body: [
        { id: 1, firstName: 'Ada', lastName: 'Lovelace', age: 20 },
        { id: 2, firstName: 'Alan', lastName: 'Turing', age: 21 }
      ]
    }).as('requeteListe')

    cy.intercept('DELETE', '**/api/students/1', {
      statusCode: 204,
      body: null
    }).as('requeteSuppression')

    cy.on('window:confirm', (message) => {
      expect(message).to.contain('Ada Lovelace')
      return true
    })

    ouvrirListe()

    cy.wait('@requeteListe')

    cy.contains('td', 'Ada').parent('tr').within(() => {
      cy.contains('button', 'Supprimer').click()
    })

    cy.wait('@requeteSuppression')
    cy.contains('Étudiant supprimé.').should('be.visible')
    cy.contains('td', 'Ada').should('not.exist')
  })
})
