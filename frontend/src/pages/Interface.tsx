import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Outlet } from '@tanstack/react-router'

function Interface() {
  const navigate = useNavigate()
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate({ to: '/login' });
  }

  return (
    <>
      <Outlet />
    </>
  )
}

export default Interface
