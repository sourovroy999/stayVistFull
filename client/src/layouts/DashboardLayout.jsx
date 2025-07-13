import { Outlet } from "react-router-dom";
import Sidebar from "../components/DashBoard/SideBar/SideBar";

const DashboardLayout = () => {
    return (
        <div className="relative min-h-screen md:flex">
            {/* side bar */}
            <div>
                <Sidebar/>
            </div>

            {/* Outlet-> dynamic content */}
            <div className="flex-1 md:ml-64">
                <div className="p-5">

            <Outlet/>
                </div>
            </div>

            
        </div>
    );
};

export default DashboardLayout;