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
      setError(err.message || 'Error adding role');
    } finally {
      setLoading(false);
    }
  };

  const renderClientForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prefix
          </label>
          <select
            value={clientData.prefix}
            onChange={(e) => setClientData({ ...clientData, prefix: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Ms.">Ms.</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            value={clientData.gender}
            onChange={(e) => setClientData({ ...clientData, gender: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
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
            Last Name
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
          Birthday
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
          ID Number
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
          Phone Number
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
          Organizer Name
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
          Company Name
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
          Business Type
        </label>
        <select
          value={organizerData.business_type}
          onChange={(e) => setOrganizerData({ ...organizerData, business_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">Select Business Type</option>
          <option value="Company">Company</option>
          <option value="Individual">Individual</option>
          <option value="Non-profit">Non-profit</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tax ID
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
          Billing Address
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
          Contact Person
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
          Phone Number
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
          Invoice Email
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
      className="fixed inset-0 bg-black bg-opacity-70 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 relative border-b border-gray-200 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition"
          >
            <XIcon className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-bold text-text-primary">
            Add {role === Role.CLIENT ? 'Client' : 'Organizer'} Role
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 sm:px-8 py-4 flex-1">
            {role === Role.CLIENT ? renderClientForm() : renderOrganizerForm()}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 border-t border-gray-200 flex gap-3 justify-end flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AddRoleModal;
