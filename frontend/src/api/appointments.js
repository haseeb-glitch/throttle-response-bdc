import axios from 'axios'

const BASE = 'http://localhost:3000/api/appointments'

export const appointmentsApi = {
  getAll:  ()         => axios.get(BASE),
  create:  (data)     => axios.post(BASE, data),
  update:  (id, data) => axios.patch(`${BASE}/${id}`, data),
  remove:  (id)       => axios.delete(`${BASE}/${id}`),
}
