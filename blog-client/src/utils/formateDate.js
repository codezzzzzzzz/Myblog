export function formateDate(date, hours = false) {
  if (date == null || date === '') return '-'
  const num = Number(date)
  const dateObj = (typeof date === 'number' || (String(date).trim() !== '' && !isNaN(num)))
    ? new Date(num)
    : new Date(date)
  if (isNaN(dateObj.getTime())) return '-'
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1 < 10 ? '0' + (dateObj.getMonth() + 1) : dateObj.getMonth() + 1
  const day = dateObj.getDate() < 10? '0' + dateObj.getDate() : dateObj.getDate()
  const hour = dateObj.getHours() < 10? '0' + dateObj.getHours() : dateObj.getHours()
  const minute = dateObj.getMinutes() < 10? '0' + dateObj.getMinutes() : dateObj.getMinutes()
  return hours ? `${year}-${month}-${day} ${hour}:${minute}` : `${year}-${month}-${day}`
}