import React from 'react';
import css from './CalculatorForm.module.css';
import { useState } from 'react';
import backArrow from './backArrow.png';
import { useMediaQuery } from 'react-responsive';
import svg from './icons.svg';
import { useEffect } from 'react';
import { Loader } from 'components/Loader/Loader';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateProfile,
  fetchProfile,
} from '../../redux/profile/profileOperations';
import { fetchProductsByBloodType } from '../../redux/product/productOperation';
import { NavLink } from 'react-router-dom';
import {
  getProductNotRecommended,
  getProductLoading,
} from '../../redux/product/selector';

export const CalculatorForm = () => {
  const dispatch = useDispatch();
  const [bloodType, setBloodType] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [cWeight, setCWeight] = useState('');
  const [dWeight, setDWeight] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState();
  const isTablet = useMediaQuery({ query: '(min-width: 768px)' });
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

  const notRecommendedProducts = useSelector(getProductNotRecommended);
  const isLoading = useSelector(getProductLoading);
  const handleBloodTypeChange = event => {
    setBloodType(event.target.value);
    dispatch(fetchProductsByBloodType(Number(event.target.value)));
  };
  const handleHeightChange = event => {
    setHeight(event.target.value);
  };
  const handleAgeChange = event => {
    setAge(event.target.value);
  };
  const handleCurrentWeightChange = event => {
    setCWeight(event.target.value);
  };
  const handleDesiredWeight = event => {
    setDWeight(event.target.value);
  };

  const handleModalClose = event => {
    setModalOpen(false);
  };

  const handleSubmit = event => {
    event.preventDefault();

    const dailyCalorieIntake = Math.ceil(
      10 * cWeight + 6.25 * height - 5 * age - 161 - 10 * (cWeight - dWeight)
    );

    setResult(dailyCalorieIntake);
    setModalOpen(true);

    // Prepare the object to be sent to the updateProfile action
    const profileData = {
      height: Number(height),
      dWeight: Number(dWeight),
      age: Number(age),
      bloodType: Number(bloodType),
      cWeight: Number(cWeight),
      dailyCalories: dailyCalorieIntake,
    };

    // Dispatch the updateProfile action
    dispatch(updateProfile(profileData))
      .unwrap()
      .then(() => {
        dispatch(fetchProfile());
      })
      .catch(error => {
        console.error('Failed to update profile:', error);
      });
  };

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setModalOpen(false);
      }
    };

    if (isModalOpen === true) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className={css.overlayWrapper}>
        {isModalOpen === true && (
          <div className={css.overlay}>
            <button className={css.overlayBack} onClick={handleModalClose}>
              <img src={backArrow} width="12px" height="7px" alt="back" />
            </button>

            <div className={css.modal}>
              <button className={css.overlayClose} onClick={handleModalClose}>
                <svg width="11.67px" height="11.67px" className={css.modalIcon}>
                  <use href={`${svg}#icon-close`}></use>
                </svg>
              </button>
              <div className={css.modalContainer}>
                {isMobile && (
                  <div className={css.modalTitle}>
                    Your recommended daily calorie intake is
                  </div>
                )}
                {isTablet && (
                  <div className={css.modalTitle}>
                    <div>Your recommended daily</div>
                    <div>calorie intake is</div>
                  </div>
                )}
                <div className={css.modalValueWrapper}>
                  <span className={css.modalValue}>{result}</span>
                  <span className={css.modalValueUnit}>kcal</span>
                </div>
                <div className={css.foodsWrapper}>
                  <div className={css.modalHeading}>
                    Foods you should not eat
                  </div>
                  <ol className={css.modalList}>
                    {isLoading ? (
                      <li>
                        {' '}
                        <Loader />{' '}
                      </li>
                    ) : (
                      notRecommendedProducts?.data.map((badFood, index) => (
                        <li key={index}>
                          {index + 1}.{' '}
                          {badFood.charAt(0).toUpperCase() + badFood.slice(1)}
                        </li>
                      ))
                    )}
                  </ol>
                </div>
                <NavLink to="/diary">
                  <button className={css.modalSubmit}>
                    Start losing weight
                  </button>
                </NavLink>
              </div>
            </div>
          </div>
        )}
        <div className={css.pageContainer}>
          <div className={css.formWrapper}>
            <form className={css.form} onSubmit={handleSubmit}>
              <span className={css.formTitle}>
                <span className={css.formTitleSection}>
                  Calculate your daily calorie
                </span>
                <span className={css.formTitleSection}>intake right now</span>
              </span>
              <div className={css.formInputs}>
                <div className={css.formSection}>
                  <label className={css.label}>
                    {height === '' && (
                      <span className={css.labelText}>
                        Height<span className={css.labelTextSmall}> (cm)</span>{' '}
                        *
                      </span>
                    )}
                    <input
                      type="number"
                      name="height"
                      className={css.input}
                      title="Enter your height in Centimeters"
                      autoComplete="off"
                      required
                      onChange={handleHeightChange}
                    />
                  </label>
                  <label className={css.label}>
                    {age === '' && (
                      <span className={css.labelText}>
                        Age<span className={css.labelTextSmall}> (years)</span>{' '}
                        *
                      </span>
                    )}
                    <input
                      type="number"
                      name="age"
                      className={css.input}
                      title="Enter your age"
                      autoComplete="off"
                      required
                      onChange={handleAgeChange}
                    />
                  </label>
                  <label className={css.label}>
                    {cWeight === '' && (
                      <span className={css.labelText}>
                        Current Weight
                        <span className={css.labelTextSmall}> (kg)</span> *
                      </span>
                    )}
                    <input
                      type="number"
                      name="currentWeight"
                      className={css.input}
                      title="Enter your Current weight in Kilograms"
                      autoComplete="off"
                      required
                      onChange={handleCurrentWeightChange}
                    />
                  </label>
                </div>
                <div className={css.formSection}>
                  <label className={css.label}>
                    {dWeight === '' && (
                      <span className={css.labelText}>
                        Desired Weight
                        <span className={css.labelTextSmall}> (kg)</span> *
                      </span>
                    )}
                    <input
                      type="number"
                      name="desiredWeight"
                      className={css.input}
                      title="Enter your Desired weight in Kilograms"
                      autoComplete="off"
                      required
                      onChange={handleDesiredWeight}
                    />
                  </label>

                  <div className={css.radioWrapper}>
                    <div className={css.radioTitleLabel}>Blood Type *</div>
                    <div className={css.radioOptions}>
                      <div className={css.radioOptionsWrapper}>
                        <input
                          type="radio"
                          name="blood-type"
                          value="1"
                          className={`${css.radioArea} ${css.radioInput}`}
                          id="1"
                          onChange={handleBloodTypeChange}
                        />
                        <label className={css.radioLabelWrapper} htmlFor="1">
                          <span className={css.radioCircle}>
                            <span className={css.radioSelector}></span>
                          </span>
                          <span className={css.radioLabelText}>1(A)</span>
                        </label>
                      </div>
                      <div className={css.radioOptionsWrapper}>
                        <input
                          type="radio"
                          name="blood-type"
                          value="2"
                          className={`${css.radioArea} ${css.radioInput}`}
                          id="2"
                          onChange={handleBloodTypeChange}
                        />
                        <label className={css.radioLabelWrapper} htmlFor="2">
                          <span className={css.radioCircle}>
                            <span className={css.radioSelector}></span>
                          </span>
                          <span className={css.radioLabelText}>2(B)</span>
                        </label>
                      </div>
                      <div className={css.radioOptionsWrapper}>
                        <input
                          type="radio"
                          name="blood-type"
                          value="3"
                          className={`${css.radioArea} ${css.radioInput}`}
                          id="3"
                          onChange={handleBloodTypeChange}
                        />
                        <label className={css.radioLabelWrapper} htmlFor="3">
                          <span className={css.radioCircle}>
                            <span className={css.radioSelector}></span>
                          </span>
                          <span className={css.radioLabelText}>3(AB)</span>
                        </label>
                      </div>
                      <div className={css.radioOptionsWrapper}>
                        <input
                          type="radio"
                          name="blood-type"
                          value="4"
                          className={`${css.radioArea} ${css.radioInput}`}
                          id="4"
                          onChange={handleBloodTypeChange}
                        />
                        <label className={css.radioLabelWrapper} htmlFor="4">
                          <span className={css.radioCircle}>
                            <span className={css.radioSelector}></span>
                          </span>
                          <span className={css.radioLabelText}>4(O)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button className={css.button}>Start losing weight</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorForm;
