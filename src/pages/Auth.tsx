import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Shield } from "lucide-react";
import authBg from "@/assets/auth-bg.jpg";

const ADMIN_CODE = "DBADMIN2026";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"apprenant" | "exploitant">("apprenant");
  const [adminCode, setAdminCode] = useState("");
  const [showAdminField, setShowAdminField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        let finalRole: string = role;
        if (showAdminField && adminCode === ADMIN_CODE) {
          finalRole = "admin";
        } else if (showAdminField && adminCode !== ADMIN_CODE) {
          throw new Error("Code d'invitation admin invalide.");
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: finalRole },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Inscription réussie !",
          description: "Un email de confirmation vous a été envoyé, validez-le puis connectez-vous.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email requis",
        description: "Renseignez une adresse email pour recevoir le lien de réinitialisation.",
        variant: "destructive",
      });
      return;
    }
    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Lien envoyé",
        description: "Un e-mail de réinitialisation vient d'être envoyé à votre adresse.",
      });
      setResetMode(false);
    }
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <img src={authBg} alt="Centre de contrôle technique" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md mx-4 bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <a href="/" className="font-display font-bold text-2xl tracking-tight text-primary uppercase inline-block">
            DB<span className="text-accent"> Academy</span>
          </a>
          <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
            {isLogin ? "Connexion" : "Créer un compte"}
          </h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            {isLogin ? "Accédez à vos formations" : "Rejoignez DB Academy"}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            if (resetMode) {
              e.preventDefault();
              handleResetPassword();
              return;
            }
            handleAuthSubmit(e);
          }}
          className="space-y-4"
        >
          {resetMode ? (
            <>
              <p className="font-body text-sm text-muted-foreground">
                Renseignez l'adresse email associée à votre compte pour recevoir un lien de réinitialisation.
              </p>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-sm font-medium text-foreground">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="pl-10" required />
                </div>
              </div>
              <Button type="submit" disabled={resetLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold h-11">
                {resetLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </Button>
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full text-center font-body text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Retour à la connexion
              </button>
            </>
          ) : (
            <>
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-body text-sm font-medium text-foreground">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jean Dupont" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body text-sm font-medium text-foreground">Type de compte</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole("apprenant")}
                        className={`p-3 rounded-sm border text-sm font-body font-medium transition-colors ${role === "apprenant" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-primary"}`}
                      >
                        Apprenant
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("exploitant")}
                        className={`p-3 rounded-sm border text-sm font-body font-medium transition-colors ${role === "exploitant" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-primary"}`}
                      >
                        Exploitant
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdminField(!showAdminField)}
                    className="flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Shield className="h-3 w-3" />
                    {showAdminField ? "Masquer le code admin" : "J'ai un code d'invitation admin"}
                  </button>

                  {showAdminField && (
                    <div className="space-y-2">
                      <Label htmlFor="adminCode" className="font-body text-sm font-medium text-foreground">Code admin</Label>
                      <Input id="adminCode" type="text" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Code d'invitation" />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-sm font-medium text-foreground">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-body text-sm font-medium text-foreground">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" className="pl-10 pr-10" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold h-11">
                {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
              </Button>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  className="font-body text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </>
          )}
        </form>

        <div className="text-center">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setResetMode(false); }} className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
