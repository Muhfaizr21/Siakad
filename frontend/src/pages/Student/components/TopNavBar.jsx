import React from 'react';

const TopNavBar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold text-blue-900 font-headline">BKU Student Hub</span>
        <div className="hidden md:flex items-center bg-slate-100/50 px-4 py-2 rounded-full w-96">
          <span className="material-symbols-outlined text-slate-500 mr-2">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-slate-500 outline-none" 
            placeholder="Search courses, resources, or help..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-blue-50 transition-colors active:scale-95 duration-150">
          <span className="material-symbols-outlined text-blue-900">notifications</span>
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-blue-900/10">
          <img 
            alt="Student profile picture" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOs8wmC2iFJlQZfk46LasdPOMKvljxwCGf4UE8ha3BHumxx4qoTYzg2ZPqcVY9p-s8saBdF1plVPhAyL83fH8eppV4YK-t-4Awz1ZUaZf0VBJLQouV0EcVNrJJhu7vRreCt2mmN4mCsLaZcuRjVOC_huVDoU7PZNgew8Z52d76IRto74x2JXEfMIkI6AKqmGN7nl-96v0kZEMktEIod-sdd-YvsR-nuDd19uS6sLqHykh3WSUSNaaftijzXyIdt4pkcei3fOnoaUOk" 
          />
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
