import React from 'react';

const Leadership = () => {
  return (
    <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
                <h2 className="text-5xl font-extrabold text-primary tracking-tighter mb-6">Our Leadership</h2>
                <p className="text-xl text-secondary">Guided by visionary academics and seasoned administrators
                    dedicated to the BKU legacy.</p>
            </div>
            <button
                className="px-8 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">View
                Full Board</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Leader 1 */}
            <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] mb-6">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt="professional portrait of a middle-aged male university dean in a navy suit with library bookshelves in the background"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHJvuh9jpIyQkwx__mKNFhEEnJlbMiJ7qdRlBDYtdyGgElru3ZXqinNt77YRXdzOzoB_ChT28ZlYLI8tS0da8Js6jTnVpAQwsjQy5DDCGo3RE2h2KHf01pAeYQ2Fyjoi67UF0PrexLP3pylbni6gSftRYzSK-Nu30JSo07AtYEW_EbVtaWMHw33RCAj_omhunBSLn7mMqJHkWpMx2gvp7PhDVNq1HrBBYuZbbT8tPttkBx9kgS59yk6SPF6Kvfoyt4fwxYtRDHfFO_" />
                    <div
                        className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-primary group-hover:text-primary-container transition-colors">Dr.
                    Arthur Sterling</h3>
                <p className="text-secondary font-medium tracking-wide uppercase text-sm">President &amp;
                    Vice-Chancellor</p>
            </div>
            {/* Leader 2 */}
            <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] mb-6">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt="professional portrait of a female university provost with glasses in a light grey blazer with modern architecture background"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB76ojQPdqB6ae8T-wnn0tazjnxygk-3EhcRukTW723syPZpIwBV9CXbPPYECUc72gb7OKd22z87ssxUu_Qk8yAUiuzfeoDdDLTmXpLNRjqZLKb6-SJEAq6pMiznUx_SDupSQVAId6wCaGtWPNTLTlDLsG09xb_h07WXeLlSa73zpb1potrOJXAfYKDLcPsf2JU5PZ6l-TMShh0Hy8UpAdEwfuVN8akzJ1UsXmmBtDo0CHTKdtFc38oS4x8ZMg7i4hX3wq84tmHnYj9" />
                    <div
                        className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-primary group-hover:text-primary-container transition-colors">Dr.
                    Elena Rodriguez</h3>
                <p className="text-secondary font-medium tracking-wide uppercase text-sm">Provost &amp; VP of Academic
                    Affairs</p>
            </div>
            {/* Leader 3 */}
            <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] mb-6">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt="professional portrait of a male university administrator with a friendly expression in a modern glass office setting"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoF-dXLMoLV-dobDfM8Bzs447An0roeMIq1qeas6HrAycdenYghrl5WVn_-N573815l0peG1beTJFMWKsxUxaMCynnYCXgE3Jf43zGWMVDLU-hxqLt2BiuMQJw40MMHNsr4kuUCOjJ5dAz5uaUbo_Xs81BCnjkgvtH39HcqQJRgezAIYmAwFG-ZzY8A6nGx8J6L9rb3UdILfThLuFT_dvr9tF09ojOgdu7Hm1tDjyLH4qgXPA0t2RoKJJ7HbgxncobAZk_Dh1gWsM7" />
                    <div
                        className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-primary group-hover:text-primary-container transition-colors">
                    Marcus Thorne</h3>
                <p className="text-secondary font-medium tracking-wide uppercase text-sm">Dean of Student Hub Operations
                </p>
            </div>
        </div>
    </section>
  );
};

export default Leadership;
