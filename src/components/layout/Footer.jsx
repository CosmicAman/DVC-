export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>&copy; {new Date().getFullYear()} DVC Quarter Management System. All rights reserved.</p>
        <div className="footer-links">
          <p>Contact: support@dvc.com</p>
          <p>Phone: +1 234 567 8900</p>
        </div>
      </div>
    </footer>
  );
} 