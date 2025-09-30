import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { XIcon } from 'lucide-react';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ isOpen, onClose, role }) => {
  const { addRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client form state
  const [clientData, setClientData] = useState({
    prefix: 'Mr.',
    first_name: '',
    last_name: '',
    gender: 'Male',
    birthday: '',
    id_number: '',
    phone: '',
    country_code: 'TH'
  });

  // Organizer form state
  const [organizerData, setOrganizerData] = useState({
    organizer_name: '',
    company_name: '',
    business_type: '',
    tax_id: '',
    billing_address: '',
    contact_person: '',
    phone: '',
    invoice_email: '',
    country_code: 'TH'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = role === Role.CLIENT ? clientData : organizerData;
      const { error: addError } = await addRole(role, data);

      if (addError) {
        setError(addError.message);
      } else {
        // Success - close modal and reset form
        onClose();
        // Reset form data
        if (role === Role.CLIENT) {
          setClientData({
            prefix: 'Mr.',
            first_name: '',
            last_name: '',
            gender: 'Male',
            birthday: '',
            id_number: '',
            phone: '',
            country_code: 'TH'
          });
        } else {
          setOrganizerData({
            organizer_name: '',
            company_name: '',
            business_type: '',
            tax_id: '',
            billing_address: '',
            contact_person: '',
            phone: '',
            invoice_email: '',
            country_code: 'TH'
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเพิ่มบทบาท');
    } finally {
      setLoading(false);
    }
  };

  const renderClientForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            คำนำหน้า
          </label>
          <select
            value={clientData.prefix}
            onChange={(e) => setClientData({ ...clientData, prefix: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="Mr.">นาย</option>
            <option value="Mrs.">นาง</option>
            <option value="Ms.">นางสาว</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            เพศ
          </label>
          <select
            value={clientData.gender}
            onChange={(e) => setClientData({ ...clientData, gender: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="Male">ชาย</option>
            <option value="Female">หญิง</option>
            <option value="Other">อื่นๆ</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อ
          </label>
          <input
            type="text"
            value={clientData.first_name}
            onChange={(e) => setClientData({ ...clientData, first_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            นามสกุล
          </label>
          <input
            type="text"
            value={clientData.last_name}
            onChange={(e) => setClientData({ ...clientData, last_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          วันเกิด
        </label>
        <input
          type="date"
          value={clientData.birthday}
          onChange={(e) => setClientData({ ...clientData, birthday: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          เลขบัตรประชาชน
        </label>
        <input
          type="text"
          value={clientData.id_number}
          onChange={(e) => setClientData({ ...clientData, id_number: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={13}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          เบอร์โทรศัพท์
        </label>
        <div className="flex gap-2">
          <select
            value={clientData.country_code}
            onChange={(e) => setClientData({ ...clientData, country_code: e.target.value })}
            className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          >
            <option value="+66">🇹🇭 TH (+66)</option>
                        <option value="+1">🇺🇸 US (+1)</option>
                        <option value="+44">🇬🇧 UK (+44)</option>
                        <option value="+65">🇸🇬 SG (+65)</option>
                        <option value="+60">🇲🇾 MY (+60)</option>
                        <option value="+62">🇮🇩 ID (+62)</option>
                        <option value="+63">🇵🇭 PH (+63)</option>
                        <option value="+84">🇻🇳 VN (+84)</option>
                        <option value="+86">🇨🇳 CN (+86)</option>
                        <option value="+81">🇯🇵 JP (+81)</option>
                        <option value="+82">🇰🇷 KR (+82)</option>
                        <option value="+91">🇮🇳 IN (+91)</option>
                        <option value="+61">🇦🇺 AU (+61)</option>
                        <option value="+49">🇩🇪 DE (+49)</option>
                        <option value="+33">🇫🇷 FR (+33)</option>
          </select>
          <input
            type="tel"
            value={clientData.phone}
            onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="812345678"
            required
          />
        </div>
      </div>

    </div>
  );

  const renderOrganizerForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อผู้จัดงาน
        </label>
        <input
          type="text"
          value={organizerData.organizer_name}
          onChange={(e) => setOrganizerData({ ...organizerData, organizer_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อบริษัท
        </label>
        <input
          type="text"
          value={organizerData.company_name}
          onChange={(e) => setOrganizerData({ ...organizerData, company_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ประเภทธุรกิจ
        </label>
        <select
          value={organizerData.business_type}
          onChange={(e) => setOrganizerData({ ...organizerData, business_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">เลือกประเภทธุรกิจ</option>
          <option value="Company">บริษัท</option>
          <option value="Individual">บุคคลธรรมดา</option>
          <option value="Non-profit">องค์กรไม่แสวงหากำไร</option>
          <option value="Other">อื่นๆ</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          เลขประจำตัวผู้เสียภาษี
        </label>
        <input
          type="text"
          value={organizerData.tax_id}
          onChange={(e) => setOrganizerData({ ...organizerData, tax_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ที่อยู่สำหรับออกใบเสร็จ
        </label>
        <textarea
          value={organizerData.billing_address}
          onChange={(e) => setOrganizerData({ ...organizerData, billing_address: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อผู้ติดต่อ
        </label>
        <input
          type="text"
          value={organizerData.contact_person}
          onChange={(e) => setOrganizerData({ ...organizerData, contact_person: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          เบอร์โทรศัพท์
        </label>
        <div className="flex gap-2">
          <select
            value={organizerData.country_code}
            onChange={(e) => setOrganizerData({ ...organizerData, country_code: e.target.value })}
            className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          >
            <option value="+66">🇹🇭 TH (+66)</option>
                        <option value="+1">🇺🇸 US (+1)</option>
                        <option value="+44">🇬🇧 UK (+44)</option>
                        <option value="+65">🇸🇬 SG (+65)</option>
                        <option value="+60">🇲🇾 MY (+60)</option>
                        <option value="+62">🇮🇩 ID (+62)</option>
                        <option value="+63">🇵🇭 PH (+63)</option>
                        <option value="+84">🇻🇳 VN (+84)</option>
                        <option value="+86">🇨🇳 CN (+86)</option>
                        <option value="+81">🇯🇵 JP (+81)</option>
                        <option value="+82">🇰🇷 KR (+82)</option>
                        <option value="+91">🇮🇳 IN (+91)</option>
                        <option value="+61">🇦🇺 AU (+61)</option>
                        <option value="+49">🇩🇪 DE (+49)</option>
                        <option value="+33">🇫🇷 FR (+33)</option>
          </select>
          <input
            type="tel"
            value={organizerData.phone}
            onChange={(e) => setOrganizerData({ ...organizerData, phone: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="812345678"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          อีเมลสำหรับออกใบเสร็จ
        </label>
        <input
          type="email"
          value={organizerData.invoice_email}
          onChange={(e) => setOrganizerData({ ...organizerData, invoice_email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
    </div>
  );

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-lg my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition"
          >
            <XIcon className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            เพิ่มบทบาท{role === Role.CLIENT ? 'ลูกค้า' : 'ผู้จัดงาน'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === Role.CLIENT ? renderClientForm() : renderOrganizerForm()}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'กำลังเพิ่ม...' : 'เพิ่มบทบาท'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddRoleModal;
