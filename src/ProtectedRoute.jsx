import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';  // Sesuaikan dengan konfigurasi firebase Anda
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ element }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const role = userDocSnap.data().role;
          if (role === 'admin' || role === 'employee') {
            setIsAdmin(true);
          } else {
            navigate('/');  // Jika bukan admin, redirect ke halaman homepage
          }
        }
      } else {
        navigate('/login');  // Jika belum login, arahkan ke halaman login
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center bg-pink-400 items-center h-screen">
        <div className="w-12 h-12 border-4 border-purple-600 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }  

  return isAdmin ? element : null;
};

export default ProtectedRoute;