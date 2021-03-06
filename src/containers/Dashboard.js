import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {

      let selectCondition

      // in jest environment
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      } else {
        // in prod environment
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          [...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
 
    <div data-set ="${bill.id}" class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div data-set ="${bill.id}" class='bill-card-name-container'>
        <div data-set ="${bill.id}" class='bill-card-name'> ${firstName} ${lastName} </div>
        <span data-set ="${bill.id}" class='bill-card-grey'> ... </span>
      </div>
      <div data-set ="${bill.id}" class='name-price-container'>
        <span data-set ="${bill.id}" > ${bill.name} </span>
        <span data-set ="${bill.id}" > ${bill.amount} € </span>
      </div>
      <div data-set ="${bill.id}" class='date-type-container'>
        <span data-set ="${bill.id}" > ${formatDate(bill.date)} </span>
        <span data-set ="${bill.id}" > ${bill.type} </span>
      </div>
      </div>
   
  `)
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, firestore, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    this.getBillsAllUsers()
    new Logout({ localStorage, onNavigate })
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'>
    <img width=${imgWidth} src=${billUrl} />
    </div>
    <a  href="${billUrl}" target="_blank" download class="btn btn-primary ">Télécharger le fichier</a>
    `) //ajout du bouton de telechargement
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  handleEditTicket(e, bill, bills) {
    // console.log(e.target.dataset.set, 'tickets ', bill, 'bill', bills)
    let targetData = null
    let protection = 0
    bills.forEach(b => {//pour toute les cards
      if (e.target.dataset.set === b.id) targetData = b //retrouver la carte et la mettre dans la variable
    })
   // if (targetData === null  ) targetData = bill
    const dataset = $(`#open-bill${targetData.id}`)[0].dataset//dataset de l'element
    if (dataset.counter === undefined) dataset.counter = 0

    if (this.id === undefined || this.id !== targetData.id) this.id = targetData.id
    if (dataset.counter % 2 === 0 && protection === 0) {//si pair
       protection = 1
      bills.forEach(b => {//pour toute les cards reset 
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })//background reset
        if ($(`#open-bill${b.id}`)[0]) $(`#open-bill${b.id}`)[0].dataset.counter = 0
        // on met le conteur dans le datset de l'element a 0
      })
      $(`#open-bill${targetData.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(targetData))
      $('.vertical-navbar').css({ height: '150vh' })
      dataset.counter++
     
    } else if (dataset.counter % 2 !== 0 && protection === 0) {
      $(`#open-bill${targetData.id}`).css({ background: '#0D5AE5' })
      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      dataset.counter++
      protection = 1
    }
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, targetData))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, targetData))
  }


  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleShowTickets(e, bills, index) {/// afichage des cartes suite à l'appui sur la fleche
    const dataset = $(`#arrow-icon${index}`)[0].dataset // recuperation des données du menu 
   // console.log(dataset)
    if (dataset.counterShow === undefined) dataset.counterShow = 0 //counter setting
    if (this.index === undefined || this.index !== index) this.index = index
    console.log(index, 'index', dataset.counterShow)
    if (dataset.counterShow % 2 === 0) { // si compteur pair on deploie le menu 
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)' })//rotation de la fleche
      let item = $(`#status-bills-container${this.index}`)// les cards
      item.html(cards(filteredBills(bills, getStatus(this.index))))//le remplissage des cards
      dataset.counterShow++
    } else { // on retracte le menu
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)' })//rotation de la fleche
      $(`#status-bills-container${this.index}`)//vidange du contenair
        .html("")
      dataset.counterShow++
    }
    bills.forEach(bill => {// les eventlisteners étaient ajouté a chaque fois il y avais du coup superposition des event

      const drawBill = (e) => { // fonction qui appelle celle qui affiche la nouvelle facture
        this.handleEditTicket(e, bill, bills)
      }
      let selectedBill = document.querySelector(`#open-bill${bill.id}`)
      if (selectedBill) { // clonage pour enlever les events
        let selectedBillClone = selectedBill.cloneNode(true)
        selectedBill.parentNode.replaceChild(selectedBillClone, selectedBill)
      }
      document.querySelector(`#open-bill${bill.id}`)?.addEventListener('click', drawBill)// eventlistener pour toutes les cards affichés
    })

    return bills

  }

  // not need to cover this function by tests
  getBillsAllUsers = () => {
    if (this.firestore) {
      return this.firestore
        .bills()
        .get()
        .then(snapshot => {
          const bills = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date,
              status: doc.data().status
            }))
          return bills
        })
        .catch(console.log)
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.firestore) {
      return this.firestore
        .bill(bill.id)
        .update(bill)
        .then(bill => bill)
        .catch(console.log)
    }
  }
}