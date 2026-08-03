import './AdminNav.css';

export function AdminNav() {
  return (
    <nav class="adminnav" aria-label="Admin sections">
      <a href="/admin">Overview</a>
      <a href="/admin/questions">Questions</a>
      <a href="/admin/settings">Settings</a>
      <form method="post" action="/admin/logout">
        <button class="adminnav-out" type="submit">
          Sign out
        </button>
      </form>
    </nav>
  );
}

export default AdminNav;
