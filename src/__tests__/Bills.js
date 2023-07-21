/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

beforeAll(() => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.Bills);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills page, I click on the icon eye", () => {
    test("A modal should appear and the image is rended", async () => {
      const dialog = await screen.findByRole("dialog", { hidden: true });
      $.fn.modal = jest.fn();

      const iconEye = screen.getAllByTestId("icon-eye")[0];
      userEvent.click(iconEye);

      expect(dialog).toBeInTheDocument();
      expect($.fn.modal).toHaveBeenCalledWith("show");
      expect(screen.getByAltText("Bill")).toBeInTheDocument();
    });
  });

  describe("When I am on Bills page, I click on the button New Bill", () => {
    test("Render the Add a New Bill Page", () => {
      userEvent.click(screen.getByTestId("btn-new-bill"));
      expect(screen.findByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Mail icon in vertical layout should be highlighted", () => {
      const iconMail = screen.getByTestId("icon-mail");
      expect(iconMail.classList.contains("active-icon")).toBe(true);
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as an employee", () => {
  describe("When I am on Bills page", () => {
    test("Fetches bills from mock API GET", async () => {
      window.onNavigate(ROUTES_PATH.Bills);

      const dataMocked = jest.spyOn(mockStore.bills(), "list");
      mockStore.bills().list();

      await waitFor(() => {
        expect(dataMocked).toHaveBeenCalledTimes(1);
        expect(document.querySelectorAll("tbody tr").length).toBe(4);
        expect(screen.findByText("Mes notes de frais")).toBeTruthy();
      });
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
      });

      test("Fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("Fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
