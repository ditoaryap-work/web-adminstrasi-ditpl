export const BULAN_INDO = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export const formatIndoDate = (isoDate: string): string => {
  if (!isoDate) return '-'
  try {
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return isoDate
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return isoDate }
}

export const formatIndoDateTime = (isoDate: string): string => {
  if (!isoDate) return '-'
  try {
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return isoDate
    
    const datePart = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
    
    return `${datePart} ${timePart}`
  } catch { return isoDate }
}

export const formatSmartDateRange = (startStr: string, endStr: string): string => {
  if (!startStr || !endStr) return `${formatIndoDate(startStr)} s/d ${formatIndoDate(endStr)}`
  
  try {
    const start = new Date(startStr)
    const end = new Date(endStr)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return `${startStr} s/d ${endStr}`

    const dStart = start.getDate()
    const mStart = start.getMonth()
    const yStart = start.getFullYear()
    const dEnd = end.getDate()
    const mEnd = end.getMonth()
    const yEnd = end.getFullYear()
    
    if (yStart === yEnd && mStart === mEnd) {
      if (dStart === dEnd) {
        return `${dStart} ${BULAN_INDO[mEnd]} ${yEnd}`
      }
      // Bulan dan tahun sama: "1 s/d 3 April 2026"
      return `${dStart} s/d ${dEnd} ${BULAN_INDO[mEnd]} ${yEnd}`
    } else if (yStart === yEnd) {
      // Beda bulan, tahun sama: "28 Maret s/d 3 April 2026"
      return `${dStart} ${BULAN_INDO[mStart]} s/d ${dEnd} ${BULAN_INDO[mEnd]} ${yEnd}`
    } else {
      // Beda tahun: "28 Desember 2025 s/d 3 Januari 2026"
      return `${dStart} ${BULAN_INDO[mStart]} ${yStart} s/d ${dEnd} ${BULAN_INDO[mEnd]} ${yEnd}`
    }
  } catch {
    return `${formatIndoDate(startStr)} s/d ${formatIndoDate(endStr)}`
  }
}
