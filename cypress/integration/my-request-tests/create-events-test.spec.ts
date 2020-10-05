/// <reference types="cypress" />

describe("First test", () => {
  let username = "";
  let password = "";
  let numberOfEvents = 100;

  it("Create 100 events after logging in", () => {
    cy.login(username, password);
    cy.wait(5000); // must wait to navigate to events successfully
    for (let i = 0; i < numberOfEvents; i++) {
      cy.navigateToEvents();
      let eventName = "event " + i.toString();
      cy.createEvent(eventName);
      cy.wait(3000); // must wait to navigate to events successfully
    }
    cy.navigateToEvents();
  });
});
