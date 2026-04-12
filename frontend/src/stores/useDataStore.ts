import { defineStore } from 'pinia'
import { SptData, SptjmData, PegawaiData, SbmData, SuratData } from '../types/api'

// Cache valid for 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000

export const useDataStore = defineStore('data', {
  state: () => ({
    sptData: [] as SptData[],
    sptjmData: [] as SptjmData[],
    pegawaiData: [] as PegawaiData[],
    sbmData: [] as SbmData[],
    suratData: [] as SuratData[],
    lastFetchTime: {
      spt: 0,
      sptjm: 0,
      pegawai: 0,
      sbm: 0,
      surat: 0
    }
  }),

  actions: {
    // Check if cache is still valid
    isCacheValid(type: 'spt' | 'sptjm' | 'pegawai' | 'sbm' | 'surat') {
      const now = Date.now()
      const hasData = {
        spt: this.sptData.length > 0,
        sptjm: this.sptjmData.length > 0,
        pegawai: this.pegawaiData.length > 0,
        sbm: this.sbmData.length > 0,
        surat: this.suratData.length > 0
      }[type]
      return (now - this.lastFetchTime[type]) < CACHE_TTL_MS && hasData
    },

    setSptData(data: SptData[]) {
      this.sptData = data
      this.lastFetchTime.spt = Date.now()
    },

    setSptjmData(data: SptjmData[]) {
      this.sptjmData = data
      this.lastFetchTime.sptjm = Date.now()
    },

    setPegawaiData(data: PegawaiData[]) {
      this.pegawaiData = data
      this.lastFetchTime.pegawai = Date.now()
    },

    setSbmData(data: SbmData[]) {
      this.sbmData = data
      this.lastFetchTime.sbm = Date.now()
    },

    setSuratData(data: SuratData[]) {
      this.suratData = data
      this.lastFetchTime.surat = Date.now()
    },

    invalidateCache(type: 'spt' | 'sptjm' | 'pegawai' | 'sbm' | 'surat' | 'all') {
      if (type === 'all') {
        this.lastFetchTime = { spt: 0, sptjm: 0, pegawai: 0, sbm: 0, surat: 0 }
      } else {
        this.lastFetchTime[type] = 0
      }
    }
  }
})
