const quickLinks = [
  "سياسة الخصوصية",
  "شروط الاستخدام",
  "المنصة للأجهزة الذكية",
  "الدعم والمساعدة",
  "قنوات البث المباشر"
];

function Footer() {
  return (
    <footer className="bg-primary-dark/80 border-t border-primary-light/30 py-10 text-gray-300">
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-[2fr_1fr] lg:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-3 text-sm">
          <h3 className="text-accent text-lg font-semibold">منصة مصحف الهدى التعليمية</h3>
          <p>
            منصة تفاعلية تجمع بين التلاوة الموثوقة، الأذكار اليومية، حلقات التحفيظ المرئية، والمحتوى العلمي
            المتخصص، مع تجربة عرض ثابتة تلائم جميع الشاشات بما في ذلك الشاشات الكبيرة والبث الخارجي.
          </p>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} جميع الحقوق محفوظة - تطوير مستمر بإشراف نخبة من القراء والمعلمين.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <h4 className="text-accent font-semibold">روابط مهمة</h4>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link}>
                <a className="hover:text-white transition" href="#">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <h4 className="text-accent font-semibold">تواصل مباشر</h4>
          <p>دعم فني على مدار الساعة للتكامل مع شاشات المساجد والمنصات التعليمية.</p>
          <div className="space-y-1 text-xs text-gray-400">
            <p>البريد: support@alhuda.app</p>
            <p>الهاتف: 800-123-444</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
