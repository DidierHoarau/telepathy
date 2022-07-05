describe("Login", () => {
  it("Should login and logout", () => {
    cy.visit("http://localhost:3000/users/login");
    cy.get("#username").type("admin");
    cy.get("#password").type("admin");
    cy.get("#loginButton").click();
    cy.get("#logoutButton").click();
    cy.login("admin", "admin");
  });
});
