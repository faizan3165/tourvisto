import React from "react";
import { useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/auth";

const PageLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <button onClick={handleLogout} className="cursor-pointer">
      <img src="/assets/icons/logout.svg" alt="logout" className="size-6" />
    </button>
  );
};

export default PageLayout;
