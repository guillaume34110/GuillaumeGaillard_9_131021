
import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {//probleme ici il faut un fichier existant pour que ca marche
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]//recuperation du fichier
    console.log(e.target.value, "file")
    const filePath = e.target.value.split(/\\/g)//decomposition du nom en array va chaque /
    let newFileName = filePath[filePath.length - 1]//extraction du nom via le dernier bout du array
    //newFileName.replace(/ /g, '')
    console.log(filePath, newFileName)
    this.firestore//appel à firestore
      .storage// appel au stockage
      .ref(`justificatifs/${newFileName}`)// emplacement
      .put(file) // ajout de l'element
      .then((snapshot) => snapshot.ref.getDownloadURL())// on consulte les urls a la reference ref
      .then((url) => {//dans les urls
        console.log(url, 'url')
        this.fileUrl = url// on a les nouveaux chemins dans l'objet
        this.fileName = newFileName// on a les nouveaux chemins dans l'objet
        console.log(this.fileUrl, this.fileName)
      })

  }
  handleSubmit = e => {
    e.preventDefault()
    if (this.fileName !== null && this.fileUrl !== null) {///si la reponse  de firestore pour les documents n'est pas arrivé pas de soumitions 
      console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      if (bill.fileName !== null && bill.fileUrl !== null){
      this.createBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    }else return false
    } else return false
}
    // not need to cover this function by tests
    createBill = (bill) => {
      console.log(bill)
      if (this.firestore) {
        this.firestore
          .bills()
          .add(bill)
          .then(() => {
            this.onNavigate(ROUTES_PATH['Bills'])
          })
          .catch(error => error)
      }
    }

  

}