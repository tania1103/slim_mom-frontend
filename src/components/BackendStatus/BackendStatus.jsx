import React, { useEffect, useState } from 'react';
import { isBackendAvailable } from '../../axiosSetup';
import { wakeUpBackend } from '../../utils/backendTester';
import styles from './BackendStatus.module.css';

/**
 * Component pentru afișarea statusului backend-ului
 * Afișează notificare când se folosește Mock API sau când se trezește serverul
 */
const BackendStatus = () => {
  const [showStatus, setShowStatus] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Check backend status every 30 seconds
    const checkStatus = () => {
      const available = isBackendAvailable();
      if (!available && !isWakingUp) {
        setShowStatus(true);
        setStatusMessage('Backend unavailable - Using mock data');
      } else if (available) {
        setShowStatus(false);
        setIsWakingUp(false);
        setStatusMessage('');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [isWakingUp]);

  const handleWakeUp = async () => {
    setIsWakingUp(true);
    setStatusMessage('Waking up server... Please wait...');

    try {
      const success = await wakeUpBackend();
      if (success) {
        setShowStatus(false);
        setStatusMessage('');
      } else {
        setStatusMessage('Failed to wake up server - Using mock data');
      }
    } catch (error) {
      setStatusMessage('Error waking up server - Using mock data');
    } finally {
      setIsWakingUp(false);
    }
  };

  if (!showStatus && !isWakingUp) return null;

  return (
    <div className={styles.container}>
      <div className={styles.notification}>
        <div className={styles.icon}>
          {isWakingUp ? '⏰' : '🔧'}
        </div>
        <div className={styles.content}>
          <strong>{isWakingUp ? 'Waking Up Server' : 'Development Mode'}</strong>
          <p>{statusMessage || 'Backend unavailable - using Mock API for testing'}</p>
        </div>
        <button
          className={styles.closeButton}
          onClick={isWakingUp ? undefined : handleWakeUp}
          disabled={isWakingUp}
          aria-label={isWakingUp ? 'Waking up...' : 'Wake up server'}
          title={isWakingUp ? 'Waking up server...' : 'Click to wake up server'}
        >
          {isWakingUp ? '⏳' : '🚀'}
        </button>
        <button
          className={styles.closeButton}
          onClick={() => setShowStatus(false)}
          aria-label="Close notification"
          style={{ marginLeft: '8px' }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default BackendStatus;
