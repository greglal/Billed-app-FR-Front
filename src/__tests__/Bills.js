/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";



describe("Given I am connected as an employee",
    () => {
        describe("When I am on Bills Page",
            () => {
            // ********** add test for title and new bill button
                test("Then, the title and the button should be render correctly", () => {
                    document.body.innerHTML = BillsUI({ data: [] });
                    expect(screen.getAllByText("Mes notes de frais")).toBeTruthy(); // is title?
                    expect(screen.getByTestId("btn-new-bill")).toBeTruthy(); // is button?
                });

                test("Then bill icon in vertical layout should be highlighted",
                    async () => {

                        Object.defineProperty(window,
                            'localStorage',
                            {value: localStorageMock})
                        window.localStorage.setItem('user',
                            JSON.stringify({
                                type: 'Employee'
                            }))
                        const root = document.createElement("div")
                        root.setAttribute("id", "root")
                        document.body.append(root)
                        router()
                        window.onNavigate(ROUTES_PATH.Bills)

                        await waitFor(() => screen.getByTestId('icon-window'))
                        const windowIcon = screen.getByTestId('icon-window')

                        //to-do write expect expression
                        expect(windowIcon.classList.contains("active-icon")).toBeTruthy();

                    })

                test("Then bills should be ordered from earliest to latest",
                    () => {
                        document.body.innerHTML = BillsUI({data: bills})

                        const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
                            .map(a => a.innerHTML)

                        const antiChrono = (a, b) => ((a < b) ? 1 : -1)
                        const datesSorted = [...dates].sort(antiChrono)
                        expect(dates).toEqual(datesSorted)
                    })


                // ********** add test for eye button
                describe("When I click the eye button", () =>{
                    //add test for modal opening
                    test("Then, it should open modal with bill justification",
                        async () => {
                            await waitFor(() => screen.getAllByTestId("icon-eye"));
                            const iconsEyes = screen.getAllByTestId("icon-eye");
                            const iconEye = iconsEyes[0];
                            const onNavigate = (pathname) => {
                                document.body.innerHTML =
                                    ROUTES({pathname});
                            };
                            const bill = new Bills({
                                document,
                                onNavigate,
                                store: null,
                                bills: bills,
                                localStorage: window.localStorage,
                            });

                            // create modal
                            const modale = document.getElementById("modaleFile");
                            $.fn.modal =
                                jest.fn(() => modale.classList.add("show"));

                            // create event listener
                            const handleClickIconEye = jest.fn(bill.handleClickIconEye(iconEye));

                            // add event listener to eye icon
                            iconEye.addEventListener("click", handleClickIconEye);
                            userEvent.click(iconEye);

                            //check if the function is called and the modal is shown
                            expect(handleClickIconEye).toHaveBeenCalled();
                            expect(modale).toBeTruthy();
                        })
                })

                // ********** add test for new bill button
                describe ("When I click on new bill button", () => {
                    test("Then should open new bill page",
                        () => {
                            const root = document.createElement("div");
                            root.setAttribute("id", "root");
                            document.body.append(root);
                            router();
                            window.onNavigate(ROUTES_PATH.Bills);
                            const bill = new Bills({
                                document,
                                onNavigate,
                                store: null,
                                bills: bills,
                                localStorage: window.localStorage,
                            });

                            // create event listener
                            const handleClickNewBill = jest.fn(bill.handleClickNewBill);

                            // add event listener to new bill button
                            const buttonNewBill = screen.getByTestId("btn-new-bill");
                            buttonNewBill.addEventListener("click", handleClickNewBill);
                            userEvent.click(buttonNewBill);

                            // check if the function is called and the new bill page is shown
                            expect(handleClickNewBill).toHaveBeenCalled();
                            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
                        })
                })
        })

        // ********** test loading page
        describe("When I am on Bills page but it's loading", () => {
            test('Then I should land on a loading page', () => {
                const html = BillsUI({
                    data: [],
                    loading: true
                });
                document.body.innerHTML = html;

                // screen should show Loading
                expect(screen.getAllByText('Loading...')).toBeTruthy();
            });
        });

        // ********** test error page
        describe("When I am on Bills page but it's loading", () => {
            test('Then I should land on an error page', () => {
                // build user interface
                const html = BillsUI({
                    data: [],
                    loading: false,
                    error: 'Error!',
                });
                document.body.innerHTML = html;


                // screen should show Erreur
                expect(screen.getAllByText('Error!')).toBeTruthy();
            });
        });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
    const mockStore = {
        bills: jest.fn(() => ({
            list: jest.fn(() => Promise.resolve([
                {
                    "id": "47qAXb6fIm2zOKkLzMro",
                    "vat": "80",
                    "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                    "status": "pending",
                    "type": "Hôtel et logement",
                    "commentary": "séminaire billed",
                    "name": "encore",
                    "fileName": "preview-facture-free-201801-pdf-1.jpg",
                    "date": "2004-04-04",
                    "amount": 400,
                    "commentAdmin": "ok",
                    "email": "a@a",
                    "pct": 20
                },
                {
                    "id": "BeKy5Mo4jkmdfPGYpTxZ",
                    "vat": "",
                    "amount": 100,
                    "name": "test1",
                    "fileName": "1592770761.jpeg",
                    "commentary": "plop",
                    "pct": 20,
                    "type": "Transports",
                    "email": "a@a",
                    "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
                    "date": "2001-01-01",
                    "status": "refused",
                    "commentAdmin": "en fait non"
                },
            ])),
        })),
    };

    beforeAll(() => {
        document.body.innerHTML =
            BillsUI({data: bills});
    });

    // ********** test if retrieve bills
    test('getBills successfully retrieves bills from the mock store', async () => {
        const billsComponent = new Bills({ document, onNavigate, store: mockStore });
        const getBillsPromise = billsComponent.getBills();

        await getBillsPromise;

        // Verify that the mock store was called to retrieve bills
        expect(mockStore.bills).toHaveBeenCalledTimes(1);

        // Access the bills directly from the mock store after the promise resolves
        const billsFromStore = await mockStore.bills().list();

        // Verify that the `getBills` method returned an array of bills
        expect(billsFromStore).toBeTruthy();
        expect(billsFromStore.length).toBe(2); // Adjust the length based on mocked data
    });

    // ********** test id there's an error
    test('getBills handles error in list method', async () => {
        const mockError = new Error('Simulated error in list method');

        // Mock the list method to return a rejected promise
        const mockStoreWithError = {
            bills: jest.fn(() => ({
                list: jest.fn(() => Promise.reject(mockError)),
            })),
        };

        const billsComponent = new Bills({
            document,
            onNavigate,
            store: mockStoreWithError
        });

        // Attempt to call the getBills method
        try {
            await billsComponent.getBills();
        } catch (error) {
            // Verify that the expected error is caught
            expect(error).toBe(mockError);
        }
    });

    // ********** test date format
    test('getBills returns a bill with an unformatted date when formatDate throws an error', async () => {
        // Mock the store
        const mockStore = {
            bills: jest.fn(() => ({
                list: jest.fn(() => Promise.resolve([
                    {
                        date: 'invalid-date-format',
                    },
                ])),
            })),
        };

        const billsComponent = new Bills({ document, onNavigate, store: mockStore });
        const bills = await billsComponent.getBills();

        // Check for unformatted date
        expect(bills[0].date).toBe('invalid-date-format');
    });

    test('getBills handles error when bills list returns 404', async () => {
        const mockError = new Error('Simulated error: Not Found (404)');

        // Mock the list method to return a rejected promise with 404 error
        const mockStoreWith404Error = {
            bills: jest.fn(() => ({
                list: jest.fn(() => Promise.reject(mockError)),
            })),
        };

        const billsComponent = new Bills({
            document,
            onNavigate,
            store: mockStoreWith404Error
        });

        // Attempt to call the getBills method
        try {
            await billsComponent.getBills();
        } catch (error) {
            // Verify that the expected error is caught
            expect(error).toBe(mockError);
        }
    });

// Similar structure can be used for testing 500 error
    test('getBills handles error when bills list returns 500', async () => {
        const mockError = new Error('Simulated error: Internal Server Error (500)');

        // Mock the list method to return a rejected promise with 500 error
        const mockStoreWith500Error = {
            bills: jest.fn(() => ({
                list: jest.fn(() => Promise.reject(mockError)),
            })),
        };

        const billsComponent = new Bills({
            document,
            onNavigate,
            store: mockStoreWith500Error
        });

        // Attempt to call the getBills method
        try {
            await billsComponent.getBills();
        } catch (error) {
            // Verify that the expected error is caught
            expect(error).toBe(mockError);
        }

    })

})
