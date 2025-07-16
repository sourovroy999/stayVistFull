import { Children } from 'react';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import useRole from '../hooks/useRole';
import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom';

const AdminRoute = ({children}) => {
    const [role, isLoading]=useRole()
    if(isLoading) return <LoadingSpinner/>

    if(role === 'admin') return children

    return <Navigate to={'/dashboard'}/>
};

export default AdminRoute;

AdminRoute.prototype={
    children: PropTypes.element,
}