import React from 'react';
import AdminStatistics from '../Admin/AdminStatistics';
import useRole from '../../../hooks/useRole';
import HostStatistics from '../../../components/DashBoard/Statistics/HostStatistics';
import GuestStatistics from '../../../components/DashBoard/Statistics/GuestStatistics';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';

const Statistics = () => {
    const[role, isLoading]=useRole()
    if(isLoading) return <LoadingSpinner/>
    return (
        <div>
            
            {
                role === 'admin' &&    <AdminStatistics/>
            }

            {
                role === 'host' &&    <HostStatistics/>
            }

            {
                role === 'guest' &&    <GuestStatistics/>
            }
         
        </div>
    );
};

export default Statistics;