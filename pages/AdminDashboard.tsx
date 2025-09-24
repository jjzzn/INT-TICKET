import React, { useState, useEffect, useMemo } from 'react';
import { Event, User, Role, EventWithTickets } from '../types';
import { mockEvents, mockUsers } from '../data/mockData';
import { MOCK_API_DELAY } from '../constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminDashboard: React.FC = () => {
  // fix: Use EventWithTickets type to match updated mock data.
  const [events, setEvents] = useState<EventWithTickets[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setEvents(mockEvents);
      setUsers(mockUsers);
      setLoading(false);
    }, MOCK_API_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const totalRevenue = useMemo(() => {
      return events.reduce((total, event) => {
          // fix: Use ticket_types and sold_quantity properties.
          const eventRevenue = event.ticket_types.reduce((sum, tier) => sum + ((tier.sold_quantity || 0) * tier.price), 0);
          return total + eventRevenue;
      }, 0);
  }, [events]);

  const totalTicketsSold = useMemo(() => {
      return events.reduce((total, event) => {
          // fix: Use ticket_types and sold_quantity properties.
          const eventTickets = event.ticket_types.reduce((sum, tier) => sum + (tier.sold_quantity || 0), 0);
          return total + eventTickets;
      }, 0);
  }, [events]);

  const userRoleData = useMemo(() => {
      const roleCounts = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
      }, {} as Record<Role, number>);
      
      return Object.entries(roleCounts).map(([name, value]) => ({ name, value }));
  }, [users]);
  
  const COLORS = {
      [Role.CLIENT]: '#0088FE',
      [Role.ORGANIZER]: '#00C49F',
      // fix: Use correct enum member for Super Admin role.
      [Role.SUPER_ADMIN]: '#FFBB28',
  };
  
  if (loading) return <p>Loading platform data...</p>;

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-text-secondary">Platform Revenue</h3>
                <p className="text-3xl font-bold text-primary mt-1">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-text-secondary">Total Tickets Sold</h3>
                <p className="text-3xl font-bold text-primary mt-1">{totalTicketsSold.toLocaleString()}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-text-secondary">Total Events</h3>
                <p className="text-3xl font-bold text-primary mt-1">{events.length}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-text-secondary">Total Users</h3>
                <p className="text-3xl font-bold text-primary mt-1">{users.length}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-4 text-text-primary">User Role Distribution</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={userRoleData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {userRoleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as Role]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #e5e7eb' 
                            }} />
                            <Legend wrapperStyle={{color: "#111827"}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
                 <h3 className="text-lg font-semibold mb-4 text-text-primary">Recent Events</h3>
                 <ul className="divide-y divide-border">
                     {events.slice(0, 5).map(event => (
                         <li key={event.id} className="py-3">
                            {/* fix: Use event_name, organizer_name, and event_start_datetime properties. */}
                             <p className="font-medium text-text-primary">{event.event_name}</p>
                             <p className="text-sm text-text-secondary">by {event.organizer_name} on {new Date(event.event_start_datetime).toLocaleDateString()}</p>
                         </li>
                     ))}
                 </ul>
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;