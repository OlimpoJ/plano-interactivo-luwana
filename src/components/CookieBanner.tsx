'use client';

import { useState, useEffect } from 'react';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const match = document.cookie.match(new RegExp('(^| )cookie_consent=([^;]+)'));
    const consent = match ? match[2] : null;

    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const setConsentCookie = (value: string) => {
    const isProduction = window.location.hostname.includes('patrimofy.com');
    const domain = isProduction ? 'domain=.patrimofy.com;' : '';
    document.cookie = `cookie_consent=${value}; path=/; max-age=31536000; ${domain} SameSite=Lax`;
  };

  const handleAccept = () => {
    setConsentCookie('accepted');
    setShowBanner(false);
    // Dispatch a custom event so that ClientScripts can react to it instantly
    window.dispatchEvent(new Event('cookie_consent_updated'));
  };

  const handleReject = () => {
    setConsentCookie('rejected');
    setShowBanner(false);
    window.dispatchEvent(new Event('cookie_consent_updated'));
  };

  if (!showBanner) return null;

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.content}>
        <h3 className={styles.title}>Aviso de Privacidad y Cookies</h3>
        <p className={styles.description}>
          Utilizamos cookies para personalizar el contenido, analizar nuestro tráfico y mejorar tu experiencia. Algunos datos pueden compartirse con nuestros aliados de publicidad como TikTok. Al hacer clic en 'Aceptar todas', consientes el uso de estas tecnologías de acuerdo con nuestra Política de Privacidad.
          <a href="https://patrimofy.com/es/politicas-de-privacidad" target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>
            Ver Política de Privacidad
          </a>
        </p>
      </div>
      <div className={styles.actions}>
        <button className={styles.btnReject} onClick={handleReject}>
          Rechazar no esenciales
        </button>
        <button className={styles.btnAccept} onClick={handleAccept}>
          Aceptar todas
        </button>
      </div>
    </div>
  );
}
