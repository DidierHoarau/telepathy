describe("Task Functions", () => {
  before(() => {
    cy.login("admin", "admin");
  });

  it("Should list Tasks", () => {
    cy.get("#navigationTaskList").click();
  });

  it("Should add a Task", () => {
    cy.get("#navigationTaskList").click();
    cy.get("#addTaskButton").click();
    cy.get("#taskName").type("a task");
    cy.get("#taskScript").type("ls");
  });
});
