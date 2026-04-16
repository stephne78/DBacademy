import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const CertificateDownload = ({
  userName,
  courseName,
  date,
  score,
  total,
}: {
  userName: string;
  courseName: string;
  date: string;
  score: number;
  total: number;
}) => {
  const generatePDF = () => {
    const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificat - ${courseName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f3f0e8; }
          .certificate {
            width: 900px; height: 636px;
            background: white;
            border: 3px solid #161616;
            padding: 60px;
            position: relative;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 10px; left: 10px; right: 10px; bottom: 10px;
            border: 1px solid #b9822c;
          }
          .header { font-family: 'Inter', sans-serif; font-size: 12px; letter-spacing: 6px; text-transform: uppercase; color: #b9822c; margin-bottom: 20px; }
          .title { font-family: 'Playfair Display', serif; font-size: 42px; color: #161616; margin-bottom: 16px; }
          .subtitle { font-family: 'Inter', sans-serif; font-size: 14px; color: #555; margin-bottom: 30px; }
          .name { font-family: 'Playfair Display', serif; font-size: 32px; color: #161616; border-bottom: 2px solid #b9822c; padding-bottom: 8px; margin-bottom: 20px; display: inline-block; }
          .course { font-family: 'Inter', sans-serif; font-size: 16px; color: #333; margin-bottom: 8px; }
          .course-name { font-family: 'Playfair Display', serif; font-size: 22px; color: #161616; margin-bottom: 24px; }
          .details { font-family: 'Inter', sans-serif; font-size: 12px; color: #666; }
          .details span { margin: 0 16px; }
          .seal { position: absolute; bottom: 40px; right: 60px; width: 80px; height: 80px; border: 2px solid #b9822c; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; font-size: 10px; color: #b9822c; text-align: center; line-height: 1.3; }
          @media print {
            body { background: white; }
            .certificate { border: 3px solid #161616; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">Certificat de réussite</div>
          <div class="title">CERTIFICAT</div>
          <div class="subtitle">Ce certificat est décerné à</div>
          <div class="name">${userName}</div>
          <div class="course">Pour avoir complété avec succès la formation</div>
          <div class="course-name">${courseName}</div>
          <div class="details">
            <span>Date : ${formattedDate}</span>
            <span>Score : ${score}/${total}</span>
          </div>
          <div class="seal">CERTIFIÉ ✓</div>
        </div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-card border border-border rounded-sm p-6 text-center space-y-4">
      <Award size={48} className="mx-auto text-accent" />
      <h3 className="font-display font-bold text-lg text-primary">Certificat disponible</h3>
      <p className="font-body text-sm text-muted-foreground">
        Félicitations ! Vous pouvez télécharger votre certificat de réussite.
      </p>
      <Button onClick={generatePDF} className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold">
        <Download size={16} className="mr-2" />
        Télécharger le certificat (PDF)
      </Button>
    </div>
  );
};

export default CertificateDownload;
