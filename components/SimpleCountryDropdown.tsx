import React from 'react';

interface SimpleCountryDropdownProps {
  value: string;
  onChange: (countryCode: string, phoneCode: string) => void;
  className?: string;
}

const countries = [
  { code: 'TH', phone: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: 'US', phone: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', phone: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'SG', phone: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', phone: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', phone: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', phone: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', phone: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'LA', phone: '+856', name: 'Laos', flag: '🇱🇦' },
  { code: 'KH', phone: '+855', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'MM', phone: '+95', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'BN', phone: '+673', name: 'Brunei', flag: '🇧🇳' },
  { code: 'CN', phone: '+86', name: 'China', flag: '🇨🇳' },
  { code: 'HK', phone: '+852', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'MO', phone: '+853', name: 'Macau', flag: '🇲🇴' },
  { code: 'TW', phone: '+886', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'JP', phone: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', phone: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IN', phone: '+91', name: 'India', flag: '🇮🇳' },
  { code: 'AU', phone: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', phone: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'DE', phone: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', phone: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'IT', phone: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', phone: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', phone: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CH', phone: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SE', phone: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', phone: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', phone: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', phone: '+358', name: 'Finland', flag: '🇫🇮' },
  { code: 'CA', phone: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: 'BR', phone: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', phone: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', phone: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', phone: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', phone: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', phone: '+51', name: 'Peru', flag: '🇵🇪' },
  { code: 'ZA', phone: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', phone: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: 'NG', phone: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', phone: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: 'AE', phone: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', phone: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IL', phone: '+972', name: 'Israel', flag: '🇮🇱' },
  { code: 'TR', phone: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: 'RU', phone: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: 'UA', phone: '+380', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'PL', phone: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', phone: '+420', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', phone: '+36', name: 'Hungary', flag: '🇭🇺' },
  { code: 'AT', phone: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', phone: '+32', name: 'Belgium', flag: '🇧🇪' },
  { code: 'PT', phone: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', phone: '+30', name: 'Greece', flag: '🇬🇷' },
  { code: 'IE', phone: '+353', name: 'Ireland', flag: '🇮🇪' },
];

const SimpleCountryDropdown: React.FC<SimpleCountryDropdownProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = countries.find(country => country.code === e.target.value);
    if (selectedCountry) {
      onChange(selectedCountry.code, selectedCountry.phone);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`bg-surface border border-border rounded-md px-3 py-2 text-text-primary focus:ring-primary focus:border-primary ${className}`}
    >
      {countries.map((country) => (
        <option key={country.code} value={country.code}>
          {country.flag} {country.name} ({country.phone})
        </option>
      ))}
    </select>
  );
};

export default SimpleCountryDropdown;
