import React from 'react';

const Values = () => {
  return (
    <section className="bg-surface-container-low py-32">
        <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-20">
                <h2 className="text-headline text-5xl font-extrabold text-primary mb-4 tracking-tighter">Institutional
                    Values</h2>
                <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 bg-surface p-10 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="material-symbols-outlined text-4xl text-primary mb-6">account_balance</span>
                        <h3 className="text-2xl font-bold text-primary mb-4">Academic Integrity</h3>
                        <p className="text-secondary leading-relaxed">Upholding the highest standards of honesty and
                            transparency in every research endeavor and classroom interaction.</p>
                    </div>
                </div>
                <div className="bg-primary text-white p-10 rounded-xl flex flex-col justify-between">
                    <div>
                        <span className="material-symbols-outlined text-4xl text-blue-200 mb-6">diversity_3</span>
                        <h3 className="text-2xl font-bold mb-4">Inclusive Excellence</h3>
                        <p className="text-blue-100/80">Fostering a sense of belonging for every student, faculty
                            member, and staff within our global community.</p>
                    </div>
                </div>
                <div className="bg-surface p-10 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="material-symbols-outlined text-4xl text-primary mb-6">lightbulb</span>
                        <h3 className="text-2xl font-bold text-primary mb-4">Innovation</h3>
                        <p className="text-secondary">Pushing boundaries through experimental research and digital
                            transformation.</p>
                    </div>
                </div>
                <div className="bg-surface p-10 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="material-symbols-outlined text-4xl text-primary mb-6">public</span>
                        <h3 className="text-2xl font-bold text-primary mb-4">Social Impact</h3>
                        <p className="text-secondary">Dedicated to using our collective knowledge for the betterment of
                            society and the environment.</p>
                    </div>
                </div>
                <div
                    className="md:col-span-2 bg-secondary-container text-on-secondary-container p-10 rounded-xl flex flex-col justify-between">
                    <div>
                        <span className="material-symbols-outlined text-4xl mb-6">school</span>
                        <h3 className="text-2xl font-bold mb-4">Student Centricity</h3>
                        <p className="leading-relaxed">Every decision we make is guided by the academic success and
                            personal well-being of our students.</p>
                    </div>
                </div>
                <div className="bg-surface p-10 rounded-xl shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="material-symbols-outlined text-4xl text-primary mb-6">verified_user</span>
                        <h3 className="text-2xl font-bold text-primary mb-4">Accountability</h3>
                        <p className="text-secondary">Responsibility to our stakeholders and the public at large.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Values;
