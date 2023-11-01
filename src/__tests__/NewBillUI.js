/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen } from "@testing-library/dom";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

beforeAll(() => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "employee@test.tld",
      status: "connected",
    })
  );
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
});

describe("Given I am connected as an employee", () => {
  describe("When I am on New Bill Page", () => {
    test("Title should appear", () => {
      expect(screen.findByText("Envoyer une note de frais")).toBeTruthy();
    });

    test("Mail icon in vertical layout should be highlighted", () => {
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("All the inputs are displayed", () => {
      const form = document.querySelector("form");
      expect(form.length).toEqual(9);
    });
  });
});
