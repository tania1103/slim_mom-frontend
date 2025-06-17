import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchProductsByBloodType } from '../../redux/product/productOperation';
import { updateProfile } from '../../redux/profile/profileOperations';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../../components/Modal/Modal';
import DailyCalorieIntake from '../../components/DailyCalorieIntake/DailyCalorieIntake';
import styles from './MainPage.module.css';

// Yup validation schema
const validationSchema = Yup.object({
  height: Yup.number()
    .required('Height is required')
    .min(100, 'Height must be at least 100 cm')
    .max(250, 'Height must be at most 250 cm')
    .positive('Height must be a positive number')
    .test('is-valid-height', 'Please enter a realistic height', function(value) {
      return value >= 120 && value <= 220; // More realistic range
    }),
  
  age: Yup.number()
    .required('Age is required')
    .min(18, 'Age must be at least 18 years')
    .max(100, 'Age must be at most 100 years')
    .integer('Age must be a whole number'),
  
  currentWeight: Yup.number()
    .required('Current weight is required')
    .min(30, 'Current weight must be at least 30 kg')
    .max(300, 'Current weight must be at most 300 kg')
    .positive('Current weight must be a positive number')
    .test('is-valid-weight', 'Please enter a realistic weight', function(value) {
      return value >= 40 && value <= 200; // More realistic range
    }),
  
  desiredWeight: Yup.number()
    .required('Desired weight is required')
    .min(30, 'Desired weight must be at least 30 kg')
    .max(300, 'Desired weight must be at most 300 kg')
    .positive('Desired weight must be a positive number')
    .test('is-valid-desired-weight', 'Please enter a realistic desired weight', function(value) {
      return value >= 40 && value <= 200; // More realistic range
    })
    .test('is-reasonable-goal', 'Desired weight should be within a reasonable range of current weight', function(value) {
      const currentWeight = this.parent.currentWeight;
      if (!currentWeight || !value) return true;
      const difference = Math.abs(currentWeight - value);
      return difference <= currentWeight * 0.5; // Max 50% difference
    }),
  
  bloodType: Yup.string()
    .required('Blood type is required')
    .oneOf(['1', '2', '3', '4'], 'Blood type must be 1, 2, 3, or 4')
});

// Initial form values
const initialValues = {
  height: '',
  age: '',
  currentWeight: '',
  desiredWeight: '',
  bloodType: ''
};

export const MainPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Redux selectors with safe defaults
  const isLoading = useSelector(state => state.product?.isLoading || false);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

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

  // Handle form submission with Formik
  const handleSubmit = async (values) => {
    setIsCalculating(true);

    try {
      const result = await calculateDailyCalories(values);
      setCalculationResult(result);
      setIsModalOpen(true);

      // If user is logged in, update profile
      if (isLoggedIn) {
        const profileData = {
          height: parseFloat(values.height),
          age: parseInt(values.age),
          cWeight: parseFloat(values.currentWeight),
          dWeight: parseFloat(values.desiredWeight),
          bloodType: parseInt(values.bloodType),
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
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, errors, touched, isValid, dirty, setFieldTouched }) => (
            <Form className={styles.form}>
              <h1 className={styles.formTitle}>
                Calculate your daily calorie intake right now
              </h1>

              <div className={styles.formGrid}>
                {/* Height */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Height *</label>
                  <Field
                    type="number"
                    name="height"
                    placeholder="Height in cm"
                    className={`${styles.input} ${errors.height && touched.height ? styles.inputError : ''}`}
                    min="100"
                    max="250"
                  />
                  <ErrorMessage name="height" component="span" className={styles.error} />
                </div>

                {/* Age */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Age *</label>
                  <Field
                    type="number"
                    name="age"
                    placeholder="Age"
                    className={`${styles.input} ${errors.age && touched.age ? styles.inputError : ''}`}
                    min="18"
                    max="100"
                  />
                  <ErrorMessage name="age" component="span" className={styles.error} />
                </div>

                {/* Current Weight */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Current weight *</label>
                  <Field
                    type="number"
                    name="currentWeight"
                    placeholder="Weight in kg"
                    className={`${styles.input} ${errors.currentWeight && touched.currentWeight ? styles.inputError : ''}`}
                    min="30"
                    max="300"
                    step="0.1"
                  />
                  <ErrorMessage name="currentWeight" component="span" className={styles.error} />
                </div>

                {/* Desired Weight */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Desired weight *</label>
                  <Field
                    type="number"
                    name="desiredWeight"
                    placeholder="Weight in kg"
                    className={`${styles.input} ${errors.desiredWeight && touched.desiredWeight ? styles.inputError : ''}`}
                    min="30"
                    max="300"
                    step="0.1"
                  />
                  <ErrorMessage name="desiredWeight" component="span" className={styles.error} />
                </div>
              </div>

              {/* Blood Type */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Blood type *</label>
                <div className={styles.radioGroup}>
                  {['1', '2', '3', '4'].map((type) => (
                    <label key={type} className={styles.radioLabel}>
                      <Field
                        type="radio"
                        name="bloodType"
                        value={type}
                        className={styles.radioInput}
                      />
                      <span className={styles.radioCustom}>{type}</span>
                    </label>
                  ))}
                </div>
                <ErrorMessage name="bloodType" component="span" className={styles.error} />
              </div>

              {/* Submit Button */}
              <div className={styles.submitContainer}>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isCalculating || isLoading || !isValid || !dirty}
                >
                  {isCalculating ? 'Calculating...' : 'Start losing weight'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
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
