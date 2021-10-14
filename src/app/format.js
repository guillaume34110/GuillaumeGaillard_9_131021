export const formatDate = (dateStr) => {
 
  if (typeof dateStr === 'string' && dateStr.length > 5){/// resoud le soucis dans le dashboard (validé ne se deploie pas)
     console.log(dateStr,'date')
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${month.substr(0,3)}-${parseInt(da)}-${ye.toString().substr(2,4)}`
  }
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}