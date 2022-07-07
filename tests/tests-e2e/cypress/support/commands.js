// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add("checkInit", () => {
  cy.request({
    url: `${Cypress.env("API_URL")}/users/status/initialization`,
    method: "GET",
  }).then((response) => {
    if (!response.body.initialized) {
      cy.visit(`${Cypress.env("WEB_URL")}/users/login`);
      cy.get("#username").type(Cypress.env("ADMIN_USERNAME"));
      cy.get("#password").type(Cypress.env("ADMIN_PASSWORD"));
      cy.get("#loginButton").click();
    }
  });
});

Cypress.Commands.add("login", () => {
  cy.visit(`${Cypress.env("WEB_URL")}/users/login`);
  cy.get("#username").type(Cypress.env("ADMIN_USERNAME"));
  cy.get("#password").type(Cypress.env("ADMIN_PASSWORD"));
  cy.get("#loginButton").click();
});

Cypress.Commands.add("addTask", (task) => {
  cy.get("#navigationTaskList").click();
  cy.get("#addTaskButton").click();
  cy.get("#taskName").type(task.name);
  cy.get("#taskScript").type(task.command);
  cy.get("#taskSchedule").type(task.schedule);
  cy.get("#taskTag").select(task.tag);
  cy.get("#saveTaskButton").click();
});
