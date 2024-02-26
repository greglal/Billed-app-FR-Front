/**
 * @jest-environment jsdom
 */

import {
    fireEvent,
    screen,
    waitFor
} from "@testing-library/dom"
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import {
  ROUTES,
  ROUTES_PATH
} from "../constants/routes.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    // ********** test if new bill icon in vertical layout is highlighted
    test("Then newbill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
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
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");

      expect(mailIcon.classList.contains("active-icon")).toBeTruthy();
    });


    // ********** test if title of new bill form is shown
    test("Then the new bill form is shown", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    })

    // ********** test file format validation
    describe("When I upload a file", () => {
      test("Then add a file in correct format (jpeg, jpg, png)", () => {

      // render the component
      document.body.innerHTML = NewBillUI();

      // upload a file
      const uploader = screen.getByTestId("file");
      fireEvent.change(uploader, {
        target: {
          files: [new File(["image"], "image.png", { type: "image/png" })],
        },
      });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // create a new bill
      const newBills = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(() => newBills.handleChangeFile);

      uploader.addEventListener("change", handleChangeFile);
      fireEvent.change(uploader);

        // check if the file format is validated
        expect(uploader.files[0].name).toBe("image.png");
        expect(uploader.files[0].name).toMatch(/(jpeg|jpg|png)/);
        expect(handleChangeFile).toHaveBeenCalled();
    })
    })

    test("Then add a file in incorrect format", () => {
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
            })
        );

        // render the component
        document.body.innerHTML = NewBillUI();

        // upload a file
        const uploader = screen.getByTestId("file");
        fireEvent.change(uploader, {
            target: {
            files: [new File(["image"], "image.pdf", { type: "application/pdf" })],
            },
        });

        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
        };

        // create a new bill
        const newBills = new NewBill({
            document,
            onNavigate,
            store: mockStore,
            localStorage: window.localStorage,
        });

        const handleChangeFile = jest.fn(() => newBills.handleChangeFile);

        uploader.addEventListener("change", handleChangeFile);
        fireEvent.change(uploader);

        // check if the file format is validated
        expect(uploader.files[0].name).toBe("image.pdf");
        expect(uploader.files[0].name).not.toMatch(/(jpeg|jpg|png)/);
        expect(handleChangeFile).toHaveBeenCalled();
    })
  })

})

// test d'intégration POST
describe("When I'm on NewBill Page and I add a new bill", () => {
    // ********** test if the form is submitted or not
    test("Then it miss a required field", () => {
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
                email: "employee@company.tld",
            })
        );

        // Create a new bill with empty fields
        const emptyBill = {
            id: "BeKy5Mo4jkmdfPGYpTxZ",
            vat: "",
            amount: "",
            name: "test1",
            fileName: "",
            commentary: "plop",
            pct: "",
            type: "Transports",
            email: "a@a",
            fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
            date: "",
            status: "refused",
            commentAdmin: "en fait non"
        };

        // Render the component
        document.body.innerHTML = NewBillUI();

        const handleSubmit = jest.fn(emptyBill.handleSubmit); // Mock handleSubmit function

        const formNewBill = screen.getByTestId("form-new-bill");

        // Submit the form with empty fields
        fireEvent.submit(formNewBill);

        // Check if handleSubmit is not called
        expect(handleSubmit).not.toHaveBeenCalled();

        // Check if the form is still present in the DOM
        expect(document.body.contains(formNewBill)).toBe(true);
    });

    test("Then it should add a new bill",  () => {
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
                email: "employee@company.tld",
            })
        );

        // render the component
        document.body.innerHTML = NewBillUI();

        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
        };

        // create a new bill
        const newBills = new NewBill({
            document,
            onNavigate,
            store: mockStore,
            localStorage,
        });


        const formNewBill = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(newBills.handleSubmit);

        // submit the form
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);

        // check if the form is submitted
        expect(handleSubmit).toHaveBeenCalled();
        expect(formNewBill).toBeTruthy();
    })
})