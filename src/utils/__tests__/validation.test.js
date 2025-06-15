import { validateCalculatorForm } from '../validation';

describe('Validation Utils', () => {
  describe('validateCalculatorForm', () => {
    test('validates empty form data', () => {
      const formData = {
        height: '',
        age: '',
        currentWeight: '',
        desiredWeight: '',
        bloodType: ''
      };

      const result = validateCalculatorForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.height).toBe('Height is required');
      expect(result.errors.age).toBe('Age is required');
      expect(result.errors.currentWeight).toBe('Current weight is required');
      expect(result.errors.desiredWeight).toBe('Desired weight is required');
      expect(result.errors.bloodType).toBe('Blood type is required');
    });

    test('validates height range', () => {
      const formData = {
        height: '50',
        age: '30',
        currentWeight: '70',
        desiredWeight: '65',
        bloodType: '1'
      };

      const result = validateCalculatorForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.height).toBe('Height must be between 100 and 250 cm');
    });

    test('validates age range', () => {
      const formData = {
        height: '175',
        age: '15',
        currentWeight: '70',
        desiredWeight: '65',
        bloodType: '1'
      };

      const result = validateCalculatorForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.age).toBe('Age must be between 18 and 100 years');
    });

    test('validates weight ranges', () => {
      const formData = {
        height: '175',
        age: '30',
        currentWeight: '20',
        desiredWeight: '400',
        bloodType: '1'
      };

      const result = validateCalculatorForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.currentWeight).toBe('Current weight must be between 30 and 300 kg');
      expect(result.errors.desiredWeight).toBe('Desired weight must be between 30 and 300 kg');
    });

    test('validates blood type', () => {
      const formData = {
        height: '175',
        age: '30',
        currentWeight: '70',
        desiredWeight: '65',
        bloodType: '5'
      };

      const result = validateCalculatorForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.bloodType).toBe('Blood type must be 1, 2, 3, or 4');
    });

    test('validates correct form data', () => {
      const formData = {
        height: '175',
        age: '30',
        currentWeight: '70',
        desiredWeight: '65',
        bloodType: '1'
      };

      const result = validateCalculatorForm(formData);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('validates edge cases', () => {
      const formData = {
        height: '100',
        age: '18',
        currentWeight: '30',
        desiredWeight: '300',
        bloodType: '4'
      };

      const result = validateCalculatorForm(formData);

      expect(result.isValid).toBe(true);
    });
  });
});
