import { motion } from 'motion/react';
import { Mail, Send, Linkedin, Github } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { publicContentService } from '@/features/public/services/public-content.service';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { translations } from '@/app/lib/translations';

export function ContactSection() {
  const { language } = useLanguage();
  const text = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [contactEmail, setContactEmail] = useState('contact@example.com');
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);

  useEffect(() => {
    void loadPublicContactInfo();
  }, []);

  const loadPublicContactInfo = async () => {
    try {
      const profile = await publicContentService.getPublishedProfile();
      if (!profile) return;

      setContactEmail(profile.email);
      setLinkedinUrl(profile.linkedin_url);
      setGithubUrl(profile.github_url);
    } catch (error) {
      console.error('Failed to load contact info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success(text.contact.sentSuccess);
    setFormData({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{text.contact.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {text.contact.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{text.contact.email}</h3>
                  <p className="text-muted-foreground">{contactEmail}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{text.contact.social}</h3>
                <div className="flex items-center gap-3">
                  {linkedinUrl && (
                    <Button size="icon" variant="outline" asChild>
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  {githubUrl && (
                    <Button size="icon" variant="outline" asChild>
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  {text.contact.nameLabel}
                </label>
                <Input
                  id="name"
                  placeholder={text.contact.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {text.contact.emailLabel}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={text.contact.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  {text.contact.messageLabel}
                </label>
                <Textarea
                  id="message"
                  placeholder={text.contact.messagePlaceholder}
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? text.contact.sending : text.contact.send}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
