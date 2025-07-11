// src/components/UI/MobileMenu.jsx
const MobileMenu = ({ 
  isMobileMenuOpen, 
  session, 
  setIsLoginModalOpen, 
  setIsAdminPanelOpen, 
  handleSignOut,
  setIsMobileMenuOpen 
}) => {
  return (
    <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
      <div className="pt-2 pb-3 space-y-1 px-4">
        {session ? (
          <>
            <button
              onClick={() => {
                setIsAdminPanelOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Admin Panel
            </button>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setIsLoginModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Admin Login
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;