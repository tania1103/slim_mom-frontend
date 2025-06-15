import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProductsByBloodType } from '../../redux/product/productOperation';
import { updateProfile } from '../../redux/profile/profileOperations';
import { useAuth } from '../../hooks/useAuth';
import { validateCalculatorForm } from '../../utils/validation';
import Modal from '../../components/Modal/Modal';
import DailyCalorieIntake from '../../components/DailyCalorieIntake/DailyCalorieIntake';
import styles from './MainPageClean.module.css';

export const MainPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Redux selectors with safe defaults
  const isLoading = useSelector(state => state.product?.isLoading || false);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [formData, setFormData] = useState({
    height: '',
    age: '',
    currentWeight: '',
    desiredWeight: '',
    bloodType: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Calculate daily calories
  const calculateDailyCalories = async (formData) => {
    const { height, age, currentWeight, bloodType } = formData;

    // Formula Mifflin-St Jeor pentru femei
    const bmr = 447.593 + (9.247 * parseFloat(currentWeight)) +
                (3.098 * parseFloat(height)) - (4.330 * parseFloat(age));

    // Factor de activitate sedentară
    const dailyCalories = Math.round(bmr * 1.2);

    // Fetch produse nerecommandate pentru tipul de sânge
    let notRecommendedProducts = [];
    if (bloodType) {
      try {
        const resultAction = await dispatch(fetchProductsByBloodType(parseInt(bloodType)));

        if (fetchProductsByBloodType.fulfilled.match(resultAction)) {
          notRecommendedProducts = Array.isArray(resultAction.payload) ? resultAction.payload : [];
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        notRecommendedProducts = [];
      }
    }

    return {
      dailyCalories: Math.max(1200, dailyCalories), // Minimum 1200 calories
      notRecommendedProducts,
      bmr: Math.round(bmr),
      activityFactor: 1.2
    };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateCalculatorForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsCalculating(true);
    setFormErrors({});

    try {
      const result = await calculateDailyCalories(formData);
      setCalculationResult(result);
      setIsModalOpen(true);      // If user is logged in, update profile
      if (isLoggedIn) {
        const profileData = {
          height: parseFloat(formData.height),
          age: parseInt(formData.age),
          cWeight: parseFloat(formData.currentWeight),
          dWeight: parseFloat(formData.desiredWeight),
          bloodType: parseInt(formData.bloodType),
          dailyCalories: result.dailyCalories
        };

        dispatch(updateProfile(profileData));
      }

    } catch (error) {
      console.error('Calculation error:', error);
      setCalculationResult({
        error: 'Unable to calculate. Please try again.',
        dailyCalories: 0,
        notRecommendedProducts: []
      });
      setIsModalOpen(true);
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle "Start losing weight" action
  const handleStartLosing = () => {
    setIsModalOpen(false);
    if (isLoggedIn) {
      navigate('/diary');
    } else {
      navigate('/register');
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCalculationResult(null);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.formTitle}>
            Calculate your daily calorie intake right now
          </h1>

          <div className={styles.formGrid}>
            {/* Height */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Height *</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                placeholder="Height in cm"
                className={`${styles.input} ${formErrors.height ? styles.inputError : ''}`}
                min="100"
                max="250"
              />
              {formErrors.height && <span className={styles.error}>{formErrors.height}</span>}
            </div>

            {/* Age */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Age"
                className={`${styles.input} ${formErrors.age ? styles.inputError : ''}`}
                min="18"
                max="100"
              />
              {formErrors.age && <span className={styles.error}>{formErrors.age}</span>}
            </div>

            {/* Current Weight */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Current weight *</label>
              <input
                type="number"
                name="currentWeight"
                value={formData.currentWeight}
                onChange={handleInputChange}
                placeholder="Weight in kg"
                className={`${styles.input} ${formErrors.currentWeight ? styles.inputError : ''}`}
                min="30"
                max="300"
                step="0.1"
              />
              {formErrors.currentWeight && <span className={styles.error}>{formErrors.currentWeight}</span>}
            </div>

            {/* Desired Weight */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Desired weight *</label>
              <input
                type="number"
                name="desiredWeight"
                value={formData.desiredWeight}
                onChange={handleInputChange}
                placeholder="Weight in kg"
                className={`${styles.input} ${formErrors.desiredWeight ? styles.inputError : ''}`}
                min="30"
                max="300"
                step="0.1"
              />
              {formErrors.desiredWeight && <span className={styles.error}>{formErrors.desiredWeight}</span>}
            </div>
          </div>

          {/* Blood Type */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Blood type *</label>
            <div className={styles.radioGroup}>
              {['1', '2', '3', '4'].map((type) => (
                <label key={type} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="bloodType"
                    value={type}
                    checked={formData.bloodType === type}
                    onChange={handleInputChange}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioCustom}>{type}</span>
                </label>
              ))}
            </div>
            {formErrors.bloodType && <span className={styles.error}>{formErrors.bloodType}</span>}
          </div>

          {/* Submit Button */}
          <div className={styles.submitContainer}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isCalculating || isLoading}
            >
              {isCalculating ? 'Calculating...' : 'Start losing weight'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Your Daily Calorie Intake"
        maxWidth="lg"
      >
        {calculationResult && (
          <DailyCalorieIntake
            result={calculationResult}
            onStartLosing={handleStartLosing}
          />
        )}
      </Modal>
    </div>
  );
};
