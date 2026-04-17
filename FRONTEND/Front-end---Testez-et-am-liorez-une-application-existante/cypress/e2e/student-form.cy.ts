describe("Page formulaire étudiant", () => {
  const ouvrirPage = (url: string) => {
    cy.visit(url, {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth_token", "fake-jwt-token");
      },
    });
  };

  it("doit créer un étudiant", () => {
    cy.intercept("GET", "**/api/students", {
      statusCode: 200,
      body: [{ id: 3, firstName: "Grace", lastName: "Hopper", age: 25 }],
    }).as("requeteListe");

    cy.intercept("POST", "**/api/students", (req) => {
      expect(req.body).to.deep.equal({
        firstName: "Grace",
        lastName: "Hopper",
        age: 25,
      });

      req.reply({
        statusCode: 200,
        body: {
          id: 3,
          firstName: "Grace",
          lastName: "Hopper",
          age: 25,
        },
      });
    }).as("requeteCreation");

    ouvrirPage("http://localhost:4200/students/new");

    cy.contains("Ajouter un étudiant").should("be.visible");
    cy.get('input[formcontrolname="firstName"]').type("Grace");
    cy.get('input[formcontrolname="lastName"]').type("Hopper");
    cy.get('input[formcontrolname="age"]').type("25");

    cy.contains("button", "Ajouter").click();

    cy.wait("@requeteCreation");
    cy.wait("@requeteListe");
    cy.url().should("include", "/students");
    cy.contains("Grace").should("be.visible");
  });

  it("doit charger puis modifier un étudiant", () => {
    cy.intercept("GET", "**/api/students/1", {
      statusCode: 200,
      body: {
        id: 1,
        firstName: "Ada",
        lastName: "Lovelace",
        age: 20,
      },
    }).as("requeteChargement");

    cy.intercept("GET", "**/api/students", {
      statusCode: 200,
      body: [{ id: 1, firstName: "Ada", lastName: "Byron", age: 21 }],
    }).as("requeteListe");

    cy.intercept("PUT", "**/api/students/1", (req) => {
      expect(req.body).to.deep.equal({
        firstName: "Ada",
        lastName: "Byron",
        age: 21,
      });

      req.reply({
        statusCode: 200,
        body: {
          id: 1,
          firstName: "Ada",
          lastName: "Byron",
          age: 21,
        },
      });
    }).as("requeteModification");

    ouvrirPage("http://localhost:4200/students/1/edit");

    cy.wait("@requeteChargement");
    cy.contains("Modifier un étudiant").should("be.visible");

    cy.get('input[formcontrolname="firstName"]').should("have.value", "Ada");
    cy.get('input[formcontrolname="lastName"]').clear().type("Byron");
    cy.get('input[formcontrolname="age"]').clear().type("21");

    cy.contains("button", "Enregistrer").click();

    cy.wait("@requeteModification");
    cy.wait("@requeteListe");
    cy.url().should("include", "/students");
    cy.contains("Byron").should("be.visible");
  });
});
