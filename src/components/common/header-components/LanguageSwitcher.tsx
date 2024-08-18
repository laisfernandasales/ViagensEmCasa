import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-6 h-6 flex-shrink-0">
        <button onClick={() => handleLocaleChange('pt')} className="focus:outline-none">
          <Image src="/icons/pt.png" alt="Português" layout="fixed" width={24} height={24} />
        </button>
      </div>
      <div className="w-6 h-6 flex-shrink-0">
        <button onClick={() => handleLocaleChange('es')} className="focus:outline-none">
          <Image src="/icons/es.png" alt="Español" layout="fixed" width={24} height={24} />
        </button>
      </div>
      <div className="w-6 h-6 flex-shrink-0">
        <button onClick={() => handleLocaleChange('en')} className="focus:outline-none">
          <Image src="/icons/en.png" alt="English" layout="fixed" width={24} height={24} />
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
