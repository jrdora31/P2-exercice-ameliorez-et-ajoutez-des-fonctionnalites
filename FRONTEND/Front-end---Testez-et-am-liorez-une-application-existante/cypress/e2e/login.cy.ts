describe('Page connexion', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('doit afficher la page de connexion', () => {
    cy.visit('http://localhost:4200/login')
    cy.contains('Connexion').should('be.visible')
  })

  it("doit connecter un utilisateur et le rediriger vers la liste des étudiants", () => {
    cy.intercept('POST', '**/api/login', (req) => {
      expect(req.body).to.deep.equal({
        login: 'ada',
        password: 'password123'
      })

      req.reply({
        statusCode: 200,
        body: 'fake-jwt-token'
      })
    }).as('requeteConnexion')

    cy.intercept('GET', '**/api/students', {
      statusCode: 200,
      body: []
    }).as('requeteListe')

    cy.visit('http://localhost:4200/login')

    cy.get('input[formcontrolname="login"]').type('ada')
    cy.get('input[formcontrolname="password"]').type('password123')

    cy.contains('button', 'Se connecter').click()

    cy.wait('@requeteConnexion')
    cy.wait('@requeteListe')
    cy.url().should('include', '/students')
    cy.contains('Étudiants').should('be.visible')
  })
})
