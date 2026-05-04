import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";

function Interface() {
  const navigate = useNavigate()
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate({ to: '/login' });
  }

  return (
    <>
      <p className='text-pink-500'> INTERFACE </p>
      <button onClick={handleLogout} className="bg-red-500 rounded p-5"> Logout </button>
    </>
  )
}

export default Interface
