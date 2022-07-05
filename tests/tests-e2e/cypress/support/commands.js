// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add("login", (username, password) => {
  cy.visit("http://localhost:3000/users/login");
  cy.get("#username").type(username);
  cy.get("#password").type(password);
  cy.get("#loginButton").click();
});
