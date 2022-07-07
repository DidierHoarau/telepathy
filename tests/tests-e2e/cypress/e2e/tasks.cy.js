describe("Task Functions", () => {
  beforeEach(() => {
    cy.checkInit();
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login();
  });

  it("Should list Tasks", () => {
    cy.get("#navigationTaskList").click();
  });

  it("Should add a Task", () => {
    cy.get("#navigationTaskList").click();
    cy.get("#addTaskButton").click();
    cy.get("#taskName").type("000_a_task");
    cy.get("#taskScript").type("ls");
    cy.get("#taskSchedule").type("0 0 * * *");
    cy.get("#taskTag").select("Any");
    cy.get("#saveTaskButton").click();
  });

  it("Should add a Task (cypress command)", () => {
    const task = {
      name: "test_0000",
      command: "ls",
      schedule: "0 0 * * *",
      tag: "Any",
    };
    cy.addTask(task);
  });

  it.only("Should delete a Task", () => {
    const task = {
      name: "test_0000",
      command: "ls",
      schedule: "0 0 * * *",
      tag: "Any",
    };
    cy.addTask(task);
    cy.get("#navigationTaskList").click();
    cy.get(".page_content_container > #taskList")
      .find(".taskCard")
      .each(($el, index, $list) => {
        cy.wrap($el)
          .find("#taskName")
          .then((taskName) => {
            if (taskName.text() === task.name) {
              cy.wrap($el).get("#editButton").click();
              cy.get("#deleteButton").click();
              cy.on("window:confirm", () => true);
            }
          });
      });
    // cy.addTask(task);
  });
});
