describe('Page inscription', () => {
  it("doit afficher la page d'inscription", () => {
    cy.visit('http://localhost:4200/register')
    cy.contains('Inscription').should('be.visible')
  })

  it("doit inscrire un utilisateur et le rediriger vers la page de connexion", () => {
    cy.intercept('POST', '**/api/register', (req) => {
      expect(req.body).to.deep.equal({
        firstName: 'Ada',
        lastName: 'Lovelace',
        login: 'ada',
        password: 'password123'
      })

      req.reply({
        statusCode: 200,
        body: {}
      })
    }).as('requeteInscription')

    cy.visit('http://localhost:4200/register')

    cy.get('input[formcontrolname="firstName"]').type('Ada')
    cy.get('input[formcontrolname="lastName"]').type('Lovelace')
    cy.get('input[formcontrolname="login"]').type('ada')
    cy.get('input[formcontrolname="password"]').type('password123')

    cy.contains('button', 'Créer le compte').click()

    cy.wait('@requeteInscription')
    cy.url().should('include', '/login')
    cy.contains('Connexion').should('be.visible')
  })
})
