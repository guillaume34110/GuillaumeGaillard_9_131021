import { screen } from "@testing-library/dom"
import { ROUTES } from "../constants/routes"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import LoadingPage from "../views/LoadingPage.js"
import ErrorPage from "../views/ErrorPage.js"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: [] })
      document.body.innerHTML = html
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then loading = true", () => {// test de l'affichage du loadding
      const html = BillsUI({ data: [], loading: true })
      document.body.innerHTML = html
      expect(LoadingPage())
    })
  })
  describe("When I am on Bills Page", () => {
    test("Then error = true", () => {
      const html = BillsUI({ data: [], error: true })
      document.body.innerHTML = html// test de l'affichage du message d'erreur
      expect(ErrorPage())
    })
  })
  describe("When I am on Bills Page", () => {
    test("then i click on icon eye a popup window apear", () => { // test affichage du popup qui contient le justificatif

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({// log en tant qu'employé
        type: 'Employee'
      }))
      const html = BillsUI({ data: [bills[0]] }) // mise en place de BillsUI dans une constante
      document.body.innerHTML = html // affichage de BillsUI
      const onNavigate = (pathname) => { // creation de la fonction de routage
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null //config du firestore
      const newBills = new Bills({ document, onNavigate, firestore, localStorage })// creation des bill
      $.fn.modal = jest.fn();//comportement du mock
      const eye = screen.getByTestId("icon-eye")// recuperation de l'iconne a cliqué
      const handleClickIconEye = jest.fn(() => newBills.handleClickIconEye(eye))// eye element inside handleclick
      eye.addEventListener('click', handleClickIconEye) // mise en place de l'evenment declencheur
      userEvent.click(eye)//click sur l'élement en question
      expect(handleClickIconEye).toHaveBeenCalled()//handleClick a t'il été bien appelé
      expect(screen.getByText('Justificatif')).toBeTruthy()// le justificatif est il bien affiché
    })
  })
  describe("When I am on Bills Page", () => { 
    test("then i click on NewBill button i must be redirect to NewBill", () => {// test de redirection vers newBill

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({// log en tant qu'employé
        type: 'Employee'
      }))
      const html = BillsUI({ data: [bills[0]] })// mise en place de BillsUI dans une constante
      document.body.innerHTML = html // affichage de BillsUI
      const onNavigate = (pathname) => {// creation de la fonction de routage
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null //config du firestore
      const newBills = new Bills({ document, onNavigate, firestore, localStorage })// creation des bill
      // $.fn.modal = jest.fn();//comportement du mock
      const btn = screen.getByTestId("btn-new-bill")// recupération du boutton
      const handleClickNewBill = jest.fn(() => newBills.handleClickNewBill)// btn element inside handleclick
      btn.addEventListener('click', handleClickNewBill)//mise en place de l'evenment click
      userEvent.click(btn) // click sur le bouuton
      expect(handleClickNewBill).toHaveBeenCalled() // la fonction est elle bien appelée ?
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy() // les élements affichés sont il les bons
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get") // recupération de létat du get (applé ou non)
       const bills = await firebase.get() //attente de la réponse de firebase
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4) //recupération de 4 bills attendu
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() => // mise en place du mock
        Promise.reject(new Error("Erreur 404"))
      )
      const html =  BillsUI({ error: "Erreur 404" }) // construction de la page avec une erreur
      document.body.innerHTML = html // creation de la page
      const message = await screen.getByText(/Erreur 404/) // attente du message d'erreur
      expect(message).toBeTruthy() //recupération du message d'erreur
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() => // mise en place du mock
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" }) // construction de la page avec une erreur
      document.body.innerHTML = html // creation de la page
      const message = await screen.getByText(/Erreur 500/)// attente du message d'erreur
      expect(message).toBeTruthy()//recupération du message d'erreur
    })
  })
})