import './admin.css';

export const metadata = {
  title: "Admin | FreshMart",
  description: "Shop owner management dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
