
import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom';
import useRole from '../hooks/useRole';
import LoadingSpinner from '../components/Shared/LoadingSpinner';

const HostRoute = ({children}) => {
    const [role, isLoading]=useRole()
    if(isLoading) return <LoadingSpinner/>

    if(role === 'host') return children

    return <Navigate to={'/dashboard'}/>
};

export default HostRoute;

HostRoute.propTypes = {
  children: PropTypes.node,
}
