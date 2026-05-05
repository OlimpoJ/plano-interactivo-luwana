import styles from './LegalFooter.module.css';
import Link from 'next/link';

export default function LegalFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.companyInfo}>
        <span>&copy; {new Date().getFullYear()} Patrimofy Inmobiliaria.</span>
        <span>Cartagena, Colombia.</span>
      </div>
      <div className={styles.links}>
        <a href="https://patrimofy.com/es/politicas-de-privacidad" target="_blank" rel="noopener noreferrer" className={styles.link}>
          Políticas de Privacidad
        </a>
        <a href="https://patrimofy.com/es/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" className={styles.link}>
          Términos y Condiciones
        </a>
      </div>
    </footer>
  );
}
