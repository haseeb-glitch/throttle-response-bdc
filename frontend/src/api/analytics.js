import axios from 'axios'

const BASE = 'http://localhost:3000/api/analytics'

export const analyticsApi = {
  get: () => axios.get(BASE),
}
