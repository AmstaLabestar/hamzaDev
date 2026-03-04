import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Github, Linkedin, Mail, Send, Shield } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';
import { publicContentService } from '@/features/public/services/public-content.service';

export function MobileContact() {
  const { language } = useLanguage();
  const text = translations[language];

  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [contactEmail, setContactEmail] = useState('contact@example.com');
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);

  useEffect(() => {
    void loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      const profile = await publicContentService.getPublishedProfile();
      if (!profile) return;

      setContactEmail(profile.email);
      setLinkedinUrl(profile.linkedin_url);
      setGithubUrl(profile.github_url);
    } catch (error) {
      console.error('Failed to load mobile contact profile:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    toast.success(text.contact.sentSuccess);
    setFormData({
      name: '',
      email: '',
      message: '',
    });
    setSending(false);
  };

  return (
    <section id="contact" className="scroll-mt-24 px-4 py-8 pb-28">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">{text.contact.title}</h2>
        <p className="text-sm text-muted-foreground">{text.contact.subtitle}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="mb-3 glass-card neon-border rounded-2xl p-4"
      >
        <div className="mb-3 flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-primary" />
          <span className="font-medium">{contactEmail}</span>
        </div>
        <div className="flex gap-2">
          {linkedinUrl ? (
            <Button variant="outline" className="h-11 flex-1" asChild>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
          {githubUrl ? (
            <Button variant="outline" className="h-11 flex-1" asChild>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
          <Button variant="outline" className="h-11 flex-1" asChild>
            <a href={`mailto:${contactEmail}`} aria-label="Email">
              <Mail className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: 0.06 }}
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-4"
      >
        <div className="space-y-3">
          <Input
            id="mobile-name"
            placeholder={text.contact.namePlaceholder}
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className="h-11"
            required
          />
          <Input
            id="mobile-email"
            type="email"
            placeholder={text.contact.emailPlaceholder}
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            className="h-11"
            required
          />
          <Textarea
            id="mobile-message"
            placeholder={text.contact.messagePlaceholder}
            rows={4}
            value={formData.message}
            onChange={(event) => setFormData({ ...formData, message: event.target.value })}
            required
          />
          <Button type="submit" className="h-12 w-full text-base" disabled={sending}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? text.contact.sending : text.contact.send}
          </Button>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: 0.1 }}
        className="mt-4 flex justify-center"
      >
        <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground">
          <Link to="/login" aria-label={language === 'fr' ? 'Acces administrateur' : 'Admin access'}>
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            {language === 'fr' ? 'Espace Admin' : 'Admin Access'}
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
