import React from 'react';
import PropTypes from 'prop-types';
import styles from './DailyCalorieIntake.module.css';

/**
 * DailyCalorieIntake - Cerințele 20-21:
 * - Layout responsive pentru mobil, tabletă, desktop
 * - Ieșire dinamică a datelor calculului
 * - Lista produselor nerecommandate
 */
const DailyCalorieIntake = ({ result, onStartLosing }) => {
  const { dailyCalories, notRecommendedProducts = [], error } = result || {};

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h3>Calculation Error</h3>
          <p>{error}</p>
          <button
            type="button"
            onClick={onStartLosing}
            className={styles.button}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Calorie Result */}
      <div className={styles.calorieSection}>
        <h3 className={styles.sectionTitle}>
          Your recommended daily calorie intake is
        </h3>
        <div className={styles.calorieValue}>
          {dailyCalories} <span className={styles.unit}>kcal</span>
        </div>
      </div>

      {/* Not Recommended Foods */}
      <div className={styles.foodSection}>
        <h4 className={styles.foodTitle}>
          Foods you should not eat
        </h4>

        {notRecommendedProducts.length > 0 ? (
          <div className={styles.foodList}>
            {notRecommendedProducts.slice(0, 5).map((product, index) => (
              <span key={product._id || index} className={styles.foodItem}>
                {product.title || product.name}
                {index < Math.min(notRecommendedProducts.length, 5) - 1 && ', '}
              </span>
            ))}
            {notRecommendedProducts.length > 5 && (
              <span className={styles.moreItems}>
                and {notRecommendedProducts.length - 5} more...
              </span>
            )}
          </div>
        ) : (
          <p className={styles.noRestrictions}>
            Great! No specific food restrictions for your blood type.
          </p>
        )}
      </div>

      {/* Action Button */}
      <div className={styles.actionSection}>
        <button
          type="button"
          onClick={onStartLosing}
          className={styles.button}
        >
          Start losing weight
        </button>
      </div>
    </div>
  );
};

DailyCalorieIntake.propTypes = {
  result: PropTypes.shape({
    dailyCalories: PropTypes.number,
    notRecommendedProducts: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      name: PropTypes.string
    })),
    error: PropTypes.string
  }),
  onStartLosing: PropTypes.func.isRequired
};

export default DailyCalorieIntake;
