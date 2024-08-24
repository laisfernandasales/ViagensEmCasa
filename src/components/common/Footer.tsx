'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <footer className="footer h-16 p-4 w-full bg-base-200 text-base-content shadow-lg flex justify-between items-center">
      <p className="self-center m-0">{t('copyright')}</p>
      <div className="flex items-center gap-5">
        <Image src="/images/ipb_logo.png" alt={t('ipbLogoAlt')} width={180} height={50} />
      </div>
    </footer>
  );
};

export default Footer;
