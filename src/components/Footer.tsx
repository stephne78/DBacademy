import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Twitter, label: "X (Twitter)", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

const Footer = () => {
  return (
    <footer id="about" className="border-t border-border py-16 bg-background">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <p className="font-display font-bold text-xl text-primary uppercase tracking-tight">
              DB<span className="text-accent"> Academy</span>
            </p>
            <p className="font-body text-xs text-muted-foreground mt-1">par DB Consulting</p>
            <p className="font-body text-sm text-muted-foreground mt-3" style={{ lineHeight: "1.6" }}>
              La plateforme de référence pour la formation des contrôleurs techniques automobiles.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-accent transition-colors duration-200"
                >
                  <social.icon size={20} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Formations",
              links: ["Contrôle VL", "Diagnostic OBD", "Antipollution", "Gestion de Centre"],
            },
            {
              title: "Ressources",
              links: ["Documentation", "Réglementation", "FAQ", "Support"],
            },
            {
              title: "Contact",
              links: ["contact@dbconsulting.com", "DB Consulting"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-primary mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 DB Consulting. Tous droits réservés.
          </p>
          <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
            DB Academy — Formation d'excellence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
