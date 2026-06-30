import axios from 'axios'

const BASE = 'http://localhost:3000/api/settings'

export const settingsApi = {
  get:    ()     => axios.get(BASE),
  update: (data) => axios.post(BASE, data),
}
