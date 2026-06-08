import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    mobileNo: '',
    githubUsername: '',
    rollNo: '',
    accessCode: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await axios.post('http://localhost:5000/evaluation-service/register', formData)
      setMessage(`✅ ${response.data.message}`)
      setFormData({
        email: '',
        name: '',
        mobileNo: '',
        githubUsername: '',
        rollNo: '',
        accessCode: ''
      })
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Registration failed'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1>Campus Hiring Registration</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="ramkrishna@abc.edu"
            />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ram Krishna"
            />
          </div>

          <div className="form-group">
            <label>Mobile No</label>
            <input
              type="tel"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              required
              placeholder="9999999999"
            />
          </div>

          <div className="form-group">
            <label>GitHub Username</label>
            <input
              type="text"
              name="githubUsername"
              value={formData.githubUsername}
              onChange={handleChange}
              required
              placeholder="github"
            />
          </div>

          <div className="form-group">
            <label>Roll No</label>
            <input
              type="text"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              required
              placeholder="sa1bb"
            />
          </div>

          <div className="form-group">
            <label>Access Code</label>
            <input
              type="password"
              name="accessCode"
              value={formData.accessCode}
              onChange={handleChange}
              required
              placeholder="xgAsNC"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {message && <div className="message">{message}</div>}
      </div>
    </div>
  )
}

export default App
