import { NavLink } from "react-router-dom";
import {
  GraduationCap,
  Wallet,
  ShoppingBag,
  BriefcaseBusiness,
  Code2,
} from "lucide-react";

const menuItems = [
   {name: "My Portfolio",path: "/portfolio/index.html",icon: BriefcaseBusiness,external: true,},
  { name: "Student Management", path: "/students", icon: GraduationCap },
  { name: "Expense Tracker", path: "/expenses", icon: Wallet },
  { name: "E-Commerce", path: "/ecommerce", icon: ShoppingBag }
];

function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Code2 size={28} />
        <h2>Tasks</h2>
      </div>

      <p className="menu-heading">MAIN MENU</p>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const LinkComponent = item.external ? "a" : NavLink;
          const linkProps = item.external
            ? {
                href: item.path,
                target: "_blank",
                rel: "noopener noreferrer",
              }
            : { to: item.path, end: item.path === "/" };

          return (
            <LinkComponent
              key={item.path}
              {...linkProps}
              onClick={onNavigate}
              title={item.name}
              className={
                item.external
                  ? "menu-item"
                  : ({ isActive }) => (isActive ? "menu-item active" : "menu-item")
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </LinkComponent>
          );
        })}
      </nav>

    </aside>
  );
}

export default Sidebar;
