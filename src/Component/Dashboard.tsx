// components/Dashboard.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard_Compony from './Compony_components/Dashboard_Compony';
import Dasboard_Super from './SuperAdmin/Dasboard_Super';
export const Dashboard: React.FC = () => {
    const { state } = useAuth();
    console.log("state", state)

    if (state.isLoading || !state.user) {
        return <div>Loading...</div>;
    }

    return (
        <>


            {state.user.domain_type === 'company' && (
               

                    <Dashboard_Compony />
                  
               
            )}

            {state.user.domain_type === 'superadmin' && (
                
                    <Dasboard_Super />
                   
             
            )}

          
        </>
    );
};