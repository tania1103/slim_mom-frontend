import React from 'react';
import { RightSideBar } from 'components/RightSideBar/RightSideBar';
import CalculatorForm from 'components/CalculatorForm/CalculatorForm.jsx';
import image from '../images/leave-tab.png';

export const CalculatorPage = () => {
  return (
    <>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex xl:flex-row flex-col xl:pt-[160px] md:pt-[100px] pt-[32px] px-[20px] md:px-[32px] xl:px-[32px] min-h-full">
          <div className="md:w-[65vw] w-full">
            <CalculatorForm />
          </div>
          <div className="w-[35vw] hidden xl:block">
            <RightSideBar />
          </div>
        </div>
      </div>
      {/* Tablet / Mobile */}
      <div
        className="w-full xl:hidden bg-[#f0f1f3] -z-10"
        style={{
          backgroundImage: `url(${image})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right bottom',
          backgroundSize: '300px',
        }}
      >
        <RightSideBar />
      </div>
    </>
  );
};
