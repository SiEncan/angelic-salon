import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

const ProtectedRoute = ({ element, allowedRoles, nestedRoute = false }) => {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let retryTimeout

    const checkUserRole = async (user) => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid)
          const userDocSnap = await getDoc(userDocRef)
          if (userDocSnap.exists()) {
            const role = userDocSnap.data().role
            if (allowedRoles.includes(role)) {
              setIsAuthorized(true)
            } else {
              navigate(nestedRoute ? '/admin-dashboard' : '/')
            }
          }
        } else {
          navigate('/login')
        }
        setLoading(false)
      } catch (error) {
        console.log(error)
        retryTimeout = setTimeout(() => checkUserRole(user), 5000)
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkUserRole(user)
    })

    return () => {
      unsubscribe()
      clearTimeout(retryTimeout)
    }
  }, [navigate, allowedRoles, nestedRoute])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-center h-screen bg-gradient-to-r from-purple-200 to-pink-300"
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 mb-4"/>
        </div>
      </motion.div>
    )
  }

  return isAuthorized ? element : null
}

export default ProtectedRoute
