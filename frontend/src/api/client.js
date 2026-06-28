import axios from 'axios'

const client = axios.create({
  baseURL: 'https://library-management-system-1-0h4b.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default client
