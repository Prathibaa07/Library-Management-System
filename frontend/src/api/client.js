import axios from 'axios'

const client = axios.create({
  baseURL: 'https://library-backend-1-itou.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default client
