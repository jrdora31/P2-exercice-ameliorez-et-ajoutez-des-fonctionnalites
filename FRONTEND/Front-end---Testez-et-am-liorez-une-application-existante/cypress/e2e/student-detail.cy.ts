describe("Page détail étudiant", () => {
  const ouvrirPage = (url: string) => {
    cy.visit(url, {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth_token", "fake-jwt-token");
      },
    });
  };

  it("doit afficher le détail d'un étudiant", () => {
    cy.intercept("GET", "**/api/students/1", {
      statusCode: 200,
      body: {
        id: 1,
        firstName: "Ada",
        lastName: "Lovelace",
        age: 20,
      },
    }).as("requeteDetail");

    ouvrirPage("http://localhost:4200/students/1");

    cy.wait("@requeteDetail");
    cy.contains("Détail étudiant").should("be.visible");
    cy.contains("Ada Lovelace").should("be.visible");
    cy.contains("20").should("be.visible");
  });

  it("doit supprimer un étudiant depuis la page détail", () => {
    cy.intercept("GET", "**/api/students/1", {
      statusCode: 200,
      body: {
        id: 1,
        firstName: "Ada",
        lastName: "Lovelace",
        age: 20,
      },
    }).as("requeteDetail");

    cy.intercept("DELETE", "**/api/students/1", {
      statusCode: 204,
      body: null,
    }).as("requeteSuppression");

    cy.intercept("GET", "**/api/students", {
      statusCode: 200,
      body: [],
    }).as("requeteListe");

    cy.on("window:confirm", (message) => {
      expect(message).to.contain("Ada Lovelace");
      return true;
    });

    ouvrirPage("http://localhost:4200/students/1");

    cy.wait("@requeteDetail");
    cy.contains("button", "Supprimer").click();

    cy.wait("@requeteSuppression");
    cy.wait("@requeteListe");
    cy.url().should("include", "/students");
    cy.contains("Aucun étudiant à afficher.").should("be.visible");
  });
});
