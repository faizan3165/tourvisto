import { cn } from "lib/utils";
import { Link, NavLink, useLoaderData, useNavigate } from "react-router";

import { sidebarItems } from "~/constants";

import { logoutUser } from "~/appwrite/auth";

const NavItems = ({ onHandleClick }: { onHandleClick?: () => void }) => {
  const user = useLoaderData();
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
    <section className="nav-items">
      <Link to={"/"} className="link-logo">
        <img src="/assets/icons/logo.svg" alt="logo" className="size-[30px]" />

        <h1>Tourvisto</h1>
      </Link>

      <div className="container">
        <nav className="">
          {sidebarItems.map(({ id, href, icon, label }) => (
            <NavLink to={href} key={id}>
              {({ isActive }: { isActive: boolean }) => (
                <div
                  onClick={onHandleClick}
                  className={cn("group nav-item", {
                    "bg-primary-100 !text-white": isActive,
                  })}
                >
                  <img
                    src={icon}
                    alt="label"
                    className={`group-hover:brightness-0 size-5 group-hover:invert ${
                      isActive ? "brightness-0 invert" : "text-dark-200"
                    }`}
                  />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <footer className="nav-footer">
          <img
            src={user?.imageUrl || "/assets/image/david.webp"}
            alt={user?.name || "john doe"}
            referrerPolicy="no-referrer"
          />

          <article>
            <h2>{user?.name}</h2>

            <p>{user?.email}</p>
          </article>

          <button onClick={handleLogout} className="cursor-pointer">
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
              className="size-6"
            />
          </button>
        </footer>
      </div>
    </section>
  );
};

export default NavItems;
