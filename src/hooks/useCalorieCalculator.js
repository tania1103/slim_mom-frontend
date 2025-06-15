import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProductsByBloodType } from '../redux/product/productOperation';

/**
 * Custom hook pentru calcularea caloriilor zilnice
 * Centralizează logica de calcul din MainPage/CalculatorForm
 */
export const useCalorieCalculator = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const dispatch = useDispatch();

  const calculateDailyCalories = useCallback(async (formData) => {
    setIsCalculating(true);
    try {
      const { height, age, currentWeight, bloodType } = formData;
      
      // Formula Mifflin-St Jeor pentru femei
      const bmr = 447.593 + (9.247 * parseFloat(currentWeight)) + 
                  (3.098 * parseFloat(height)) - (4.330 * parseFloat(age));
      
      // Factor de activitate sedentară
      const dailyCalories = Math.round(bmr * 1.2);
      
      // Fetch produse nerecommandate pentru tipul de sânge
      let notRecommendedProducts = [];
      if (bloodType) {
        const resultAction = await dispatch(fetchProductsByBloodType(parseInt(bloodType)));
        
        if (fetchProductsByBloodType.fulfilled.match(resultAction)) {
          notRecommendedProducts = Array.isArray(resultAction.payload) ? resultAction.payload : [];
        }
      }
      
      const calculationResult = {
        dailyCalories: Math.max(1200, dailyCalories), // Minimum 1200 calories
        notRecommendedProducts,
        bmr: Math.round(bmr),
        activityFactor: 1.2
      };
      
      setResult(calculationResult);
      return calculationResult;
      
    } catch (error) {
      console.error('Error calculating daily intake:', error);
      const errorResult = {
        dailyCalories: 0,
        notRecommendedProducts: [],
        error: 'Unable to calculate. Please try again.'
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsCalculating(false);
    }
  }, [dispatch]);

  const resetCalculation = useCallback(() => {
    setResult(null);
    setIsCalculating(false);
  }, []);

  return {
    calculateDailyCalories,
    resetCalculation,
    isCalculating,
    result
  };
};