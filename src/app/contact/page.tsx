'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { useNotificationStore } from '@/lib/notification-store';
import { motion } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';

export default function ContactPage() {
  const { addNotification } = useNotificationStore();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = t('contact.validation.nameRequired');
    if (!formData.email) newErrors.email = t('contact.validation.emailRequired');
    if (!formData.subject) newErrors.subject = t('contact.validation.subjectRequired');
    if (!formData.message) newErrors.message = t('contact.validation.messageRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addNotification({
        type: 'success',
        message: t('contact.messages.success'),
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      addNotification({
        type: 'error',
        message: t('contact.messages.error'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: t('contact.methods.emailTitle'),
      value: 'hello@lootopia.com',
      link: 'mailto:hello@lootopia.com',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: t('contact.methods.phoneTitle'),
      value: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: t('contact.methods.addressTitle'),
      value: t('contact.methods.addressValue'),
      link: '#',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('contact.methods.hoursTitle'),
      value: t('contact.methods.hoursValue'),
      link: '#',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="bg-gradient text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">{t('contact.title')}</h1>
          <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center mx-auto text-white">
                    {method.icon}
                  </div>
                  <h3 className="font-bold text-dark text-lg">{method.title}</h3>
                  <a href={method.link} className="text-primary hover:underline text-sm font-medium">
                    {method.value}
                  </a>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-4 bg-light">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="space-y-6 p-8">
              <div>
                <h2 className="text-3xl font-bold text-dark mb-2">{t('contact.title')}</h2>
                <p className="text-gray-600">{t('contact.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label={t('contact.form.name')}
                    type="text"
                    placeholder={t('contact.form.namePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                  />
                  <Input
                    label={t('contact.form.email')}
                    type="email"
                    placeholder={t('contact.form.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                  />
                </div>

                <Input
                  label={t('contact.form.subject')}
                  type="text"
                  placeholder={t('contact.form.subjectPlaceholder')}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  error={errors.subject}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.message')}</label>
                  <textarea
                    placeholder={t('contact.form.messagePlaceholder')}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className={`w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary transition-colors resize-none ${
                      errors.message ? 'border-danger' : ''
                    }`}
                  />
                  {errors.message && <p className="text-danger text-sm mt-1">{errors.message}</p>}
                </div>

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  {t('contact.form.send')}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-dark text-center mb-12">{t('contact.faq.title')}</h2>

          <div className="space-y-4">
            {[
              {
                q: t('contact.faq.q1'),
                a: t('contact.faq.a1'),
              },
              {
                q: t('contact.faq.q2'),
                a: t('contact.faq.a2'),
              },
              {
                q: t('contact.faq.q3'),
                a: t('contact.faq.a3'),
              },
              {
                q: t('contact.faq.q4'),
                a: t('contact.faq.a4'),
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="space-y-2">
                  <h3 className="font-bold text-dark text-lg flex items-center gap-2">
                    <span className="text-primary">{t('contact.faq.questionLabel')}</span> {faq.q}
                  </h3>
                  <p className="text-gray-600 ml-6">
                    <span className="text-primary font-bold">{t('contact.faq.answerLabel')}</span> {faq.a}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
