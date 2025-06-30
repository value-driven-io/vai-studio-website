// src/utils/timezone.js
const POLYNESIA_TZ = 'Pacific/Tahiti' // UTC-10

export const polynesianNow = () => {
  return new Date().toLocaleString("en-US", {timeZone: POLYNESIA_TZ})
}

export const toPolynesianISO = (date) => {
  return new Date(date).toLocaleString("en-US", {timeZone: POLYNESIA_TZ})
}

export const formatPolynesianDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    timeZone: POLYNESIA_TZ,
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit'
  })
}