import React from 'react';
import Link from 'next/link';
import { Github, Twitter, MessageCircle, FileText } from 'lucide-react';

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'How it Works', href: '/#how-it-works' },
      { label: 'Features', href: '/#features' },
      { label: 'Docs', href: '/docs' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Whitepaper', href: '#' },
      { label: 'Audit Reports', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
  community: {
    title: 'Community',
    links: [
      { label: 'Discord', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'Telegram', href: '#' },
      { label: 'Forum', href: '#' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Risk Disclosure', href: '#' },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
  { icon: FileText, href: '#', label: 'Docs' },
];

export function Footer() {
  return (
    <footer className="bg-dark-surface/50 border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl gradient-text">
                Stratum Fi
              </span>
            </Link>
            <p className="text-sm text-text-muted mb-4">
              Self-repaying loans on Bitcoin. Powered by Mezo L2.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="p-2 rounded-lg bg-dark-background hover:bg-primary/10 transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links sections */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-text-primary mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-text-muted">
              © 2024 Stratum Fi. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>Built on</span>
              <Link
                href="https://mezo.org"
                className="hover:text-primary transition-colors"
              >
                Mezo L2
              </Link>
              <span>•</span>
              <Link href="#" className="hover:text-primary transition-colors">
                Contract Addresses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
