import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styles from './Modal.module.css';

/**
 * Modal component cu cerințele 3-5:
 * - Layout responsive pentru mobil, tabletă, desktop
 * - Închidere la click în afara modalului
 * - Închidere cu tasta Escape
 * - Performance optimized cu useCallback
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  maxWidth = 'md',
  preventBodyScroll = true
}) => {
  // Cerința 5: Închidere cu Escape
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Cerința 4: Click în afara modalului
  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Close button handler
  const handleCloseClick = useCallback((event) => {
    event.stopPropagation();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);

      // Prevent body scroll pentru better UX
      if (preventBodyScroll) {
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        if (preventBodyScroll) {
          document.body.style.overflow = 'unset';
        }
      };
    }
  }, [isOpen, handleEscapeKey, preventBodyScroll]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby="modal-content"
    >
      <div className={`${styles.modal} ${styles[maxWidth]}`}>
        {/* Header cu titlu și buton închidere */}
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={handleCloseClick}
                className={styles.closeButton}
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div id="modal-content" className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  title: PropTypes.string,
  showCloseButton: PropTypes.bool,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  preventBodyScroll: PropTypes.bool
};

export default Modal;
