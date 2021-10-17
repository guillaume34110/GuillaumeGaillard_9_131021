
import { screen, fireEvent } from '@testing-library/dom';
import { localStorageMock } from '../__mocks__/localStorage.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import Firestore from '../app/Firestore';
import { bills } from '../fixtures/bills.js';
import firebase from '../__mocks__/firebase.js';
import BillsUI from '../views/BillsUI.js';

jest.mock('../app/Firestore');//initialise firestore
// LocalStorage - Employee
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
window.localStorage.setItem(
  'user',
  JSON.stringify({
    type: 'Employee',
  })
);


// Init onNavigate
const onNavigate = (pathname) => {
  document.body.innerHTML = pathname
};


function MockFile() { };

MockFile.prototype.create = function (name, size, mimeType) { //creattion de fichier from https://gist.github.com/josephhanson/372b44f93472f9c5a2d025d40e7bb4cc
  name = name || "mock.txt";
  size = size || 1024;
  mimeType = mimeType || 'plain/txt';

  function range(count) {
    var output = "";
    for (var i = 0; i < count; i++) {
      output += "a";
    }
    return output;
  }

  var blob = new Blob([range(size)], { type: mimeType });
  blob.lastModifiedDate = new Date();
  blob.name = name;

  return blob;
};
/// autre utilisation possible que la fonction ci dessus
//file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

describe("Given I am connected as an employee", () => {
  describe("When I do not fill fields and I click on envoyer button", () => {
    test("Then It should renders newBill page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const expenseName = screen.getByTestId("expense-name")
      expect(expenseName.value).toBe("")
      const datepicker = screen.getByTestId("datepicker")
      expect(datepicker.value).toBe("")
      const amount = screen.getByTestId("amount")
      expect(amount.value).toBe("")
      const vat = screen.getByTestId("vat")
      expect(vat.value).toBe("")
      const pct = screen.getByTestId("pct")
      expect(pct.value).toBe("")
      const commentary = screen.getByTestId("commentary")
      expect(commentary.value).toBe("")
      const file = screen.getByTestId("file")
      expect(file.value).toBe("")

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(e => e.preventDefault())
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()

    })
  })
  describe('When I submit the form with an image (jpg, jpeg, png)', () => {
    test('Then it should create a new bill', () => {

      // Build user interface
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Init newBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      // mock of handleSubmit
      const handleSubmit = jest.fn(newBill.handleSubmit);

      // EventListener to submit the form
      const submitBtn = screen.getByTestId('form-new-bill');
      submitBtn.addEventListener('submit', handleSubmit);
      fireEvent.submit(submitBtn);

      // handleSubmit function must be called
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
  describe('When I choose an image to upload', () => {
    test('Then the file input should get the file name', async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      // Init newBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      const size = 1024 * 1024 * 2//create  jpg
      const mock = new MockFile()
      const file = mock.create("pic.jpg", size, "image/jpeg")
      expect(file.name).toBe('pic.jpg')
      expect(file.size).toBe(size);
      expect(file.type).toBe('image/jpeg')
      // Mock function handleChangeFile
      const inputFile = screen.getByTestId("file");
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      inputFile.addEventListener('change', handleChangeFile);

      // Launch event

      fireEvent.change(inputFile, { target: { files: [file] } })

      //handleChangeFile function must be called
      expect(handleChangeFile).toBeCalled();
      // The name of the file should be 'pic.jpg'
      expect(inputFile.files[0].name).toBe('pic.jpg');
     // expect(screen.getByText('.jpg')).toBeTruthy();
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();

    });
  });
  describe('When I choose an wrong file to upload', () => {
    test('Then the file input should get "aucun fichier"', async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      // Init newBill
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      const size = 1024 * 1024 * 2//create  txt
      const mock = new MockFile()
      const file = mock.create("txt.txt", size, "text")
      expect(file.name).toBe("txt.txt")
      expect(file.size).toBe(size);
      expect(file.type).toBe( "text")
      // Mock function handleChangeFile
      const inputFile = screen.getByTestId("file");
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)

      inputFile.addEventListener('change', handleChangeFile);

      // Launch event

      fireEvent.change(inputFile, { target: { files: [file] } })

      //handleChangeFile function must be called
      expect(handleChangeFile).toBeCalled();
      // The name of the file should be ""
      expect(inputFile.value).toBe('');
     // expect(screen.getByText('Aucun fichier choisi')).toBeTruthy();

    });
  });
  describe('When I submit the form with an image (jpg, jpeg, png)', () => {// post de newbill
    test('Then it should create a new bill', () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const bill = new NewBill({
        document,
        onNavigate,
        firestore: Firestore,
        localStorage: window.localStorage,
      });

      const expenseName = screen.getByTestId("expense-name")
      fireEvent.change(expenseName, { target: { value: "expense" } })
      expect(expenseName.value).toBe("expense")
      const datepicker = screen.getByTestId("datepicker")
      fireEvent.change(datepicker, { target: { value: "2022-02-02" } })
      expect(datepicker.value).toBe("2022-02-02")
      const amount = screen.getByTestId("amount")
      fireEvent.change(amount, { target: { value: "123" } })
      expect(amount.value).toBe("123")
      const vat = screen.getByTestId("vat")
      fireEvent.change(vat, { target: { value: "36" } })
      expect(vat.value).toBe("36")
      const pct = screen.getByTestId("pct")
      fireEvent.change(pct, { target: { value: "8" } })
      expect(pct.value).toBe("8")
      const commentary = screen.getByTestId("commentary")
      fireEvent.change(commentary, { target: { value: "commentary" } })
      expect(commentary.value).toBe("commentary")
      // 
      bill.createBill = (bill) => bill;
      bill.fileUrl = bills[0].fileUrl;
      bill.fileName = bills[0].fileName;
      // mock of handleSubmit
      const handleSubmit = jest.fn(bill.handleSubmit);

      // EventListener to submit the form
      const submitBtn = screen.getByTestId('form-new-bill');
      submitBtn.addEventListener('submit', handleSubmit);
      fireEvent.submit(submitBtn);

      // handleSubmit function must be called
      expect(handleSubmit).toHaveBeenCalled();
      expect(document.body.innerHTML).toBe('#employee/bills');
    });
  });

})


describe("Given I am a user connected as Employee", () => {///post test hard !!!!!!
  describe("When I navigate to newBill", () => {
    test("post newBill for mock API Post", async () => {
      const getSpy = jest.spyOn(firebase, 'post')//change to post and add post to mock !!!!!
      const bill = await firebase.post(bills[0])
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bill.data.length).toBe(5)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })// check on BillsUI not newBillUI
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })// check on BillsUI not newBillUI
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

