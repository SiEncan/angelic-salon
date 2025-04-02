import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';  
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ element }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let retryTimeout;

    const checkUserRole = async (user) => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const role = userDocSnap.data().role;
            if (role === 'admin' || role === 'employee') {
              setIsAdmin(true);
            } else {
              navigate('/');
            }
          }
        } else {
          navigate('/login');
        }
        setLoading(false);
      } catch (error) {
        console.log(error)
        console.log("Error fetching user data, retrying in 5s...");
        retryTimeout = setTimeout(() => checkUserRole(user), 5000);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkUserRole(user);
    });

    window.addEventListener("online", () => {
      if (loading) {
        onAuthStateChanged(auth, (user) => {
          checkUserRole(user);
        });
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(retryTimeout);
      window.removeEventListener("online", () => {});
    };
  }, [navigate, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500"></div>
      </div>
    );
  }

  return isAdmin ? element : null;
};

export default ProtectedRoute;