import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  calculateDailyCaloriesPublic,
  calculateDailyCaloriesPrivate
} from '../redux/calories/calorieOperations';
import { setManualCalculation } from '../redux/calories/calorieSlice';
import { selectIsLoggedIn } from '../redux/auth/selectors';

/**
 * Custom hook pentru calcularea caloriilor zilnice
 * Centralizează logica de calcul și poate folosi atât API-ul extern cât și calculul local
 */
export const useCalorieCalculator = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const calculateDailyCalories = useCallback(async (formData) => {
    setIsCalculating(true);
    try {
      // Convertește formatul de date de la UI la API
      const apiData = {
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.currentWeight),
        desiredWeight: Number(formData.desiredWeight),
        bloodType: Number(formData.bloodType || 1)
      };

      let calculationResult;

      // Dacă backend-ul este accesibil, folosim API-ul
      try {
        // Folosește endpoint-ul privat dacă utilizatorul e logat, altfel cel public
        const actionThunk = isLoggedIn
          ? calculateDailyCaloriesPrivate(apiData)
          : calculateDailyCaloriesPublic(apiData);

        const resultAction = await dispatch(actionThunk);

        if (!resultAction.error) {
          calculationResult = {
            dailyCalories: resultAction.payload.dailyRate,
            notRecommendedProducts: resultAction.payload.notAllowedProducts || [],
          };

          setResult(calculationResult);
          return calculationResult;
        }
      } catch (apiError) {
        console.warn('API calculation failed, falling back to local calculation', apiError);
      }

      // Fallback la calculul local dacă API-ul nu e disponibil
      const { height, age, currentWeight } = formData;

      // Formula Mifflin-St Jeor pentru femei
      const bmr = 447.593 + (9.247 * parseFloat(currentWeight)) +
                (3.098 * parseFloat(height)) - (4.330 * parseFloat(age));

      // Factor de activitate sedentară
      const dailyCalories = Math.round(bmr * 1.2);

      // Salvăm rezultatul calculat local în Redux
      calculationResult = {
        dailyCalories: Math.max(1200, dailyCalories), // Minimum 1200 calories
        notRecommendedProducts: [],
        bmr: Math.round(bmr),
        activityFactor: 1.2
      };

      dispatch(setManualCalculation(calculationResult));

      setResult(calculationResult);
      return calculationResult;
    } catch (error) {
      console.error('Error in calorie calculation:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [dispatch, isLoggedIn]);

  return {
    isCalculating,
    result,
    calculateDailyCalories,
  };
};
