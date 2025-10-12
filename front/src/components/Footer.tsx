function Footer() {
  return (
    <footer className="bg-primary-dark/70 text-xs text-gray-300 py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} منصة مصحف الهدى التعليمية</p>
        <p>بإشراف علمي وروحي، مع دعم حلقات التحفيظ الرقمية</p>
      </div>
    </footer>
  );
}

export default Footer;
