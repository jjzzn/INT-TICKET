import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { ChevronDownIcon, UserIcon, BriefcaseIcon, PlusIcon } from 'lucide-react';
import AddRoleModal from './AddRoleModal';

const RoleSwitcher: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<Role | null>(null);

  if (!user) return null;

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.CLIENT:
        return <UserIcon className="w-4 h-4" />;
      case Role.ORGANIZER:
        return <BriefcaseIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.CLIENT:
        return 'Client';
      case Role.ORGANIZER:
        return 'Organizer';
      case Role.SUPER_ADMIN:
        return 'Super Admin';
      default:
        return role;
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.CLIENT:
        return 'text-blue-600 bg-blue-50';
      case Role.ORGANIZER:
        return 'text-purple-600 bg-purple-50';
      case Role.SUPER_ADMIN:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSwitchRole = async (newRole: Role) => {
    await switchRole(newRole);
    setIsOpen(false);
  };

  const handleAddRole = (role: Role) => {
    setRoleToAdd(role);
    setIsAddRoleModalOpen(true);
    setIsOpen(false);
  };

  const availableRolesToAdd = [Role.CLIENT, Role.ORGANIZER].filter(
    role => !user.profile.available_roles.includes(role)
  );

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${getRoleColor(user.current_role)} hover:opacity-80`}
        >
          {getRoleIcon(user.current_role)}
          <span>{getRoleLabel(user.current_role)}</span>
          <ChevronDownIcon className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
              <div className="py-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Current Role
                </div>
                {user.profile.available_roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleSwitchRole(role)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      role === user.current_role
                        ? 'bg-gray-50 text-gray-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded ${getRoleColor(role)}`}>
                      {getRoleIcon(role)}
                    </div>
                    <span>{getRoleLabel(role)}</span>
                    {role === user.current_role && (
                      <span className="ml-auto text-xs text-primary">✓</span>
                    )}
                  </button>
                ))}

                {availableRolesToAdd.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 my-1" />
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Add Role
                    </div>
                    {availableRolesToAdd.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleAddRole(role)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-1.5 rounded bg-gray-100 text-gray-600">
                          <PlusIcon className="w-4 h-4" />
                        </div>
                        <span>Add {getRoleLabel(role)}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {roleToAdd && (
        <AddRoleModal
          isOpen={isAddRoleModalOpen}
          onClose={() => {
            setIsAddRoleModalOpen(false);
            setRoleToAdd(null);
          }}
          role={roleToAdd}
        />
      )}
    </>
  );
};

export default RoleSwitcher;