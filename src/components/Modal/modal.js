import classNames from 'classnames/bind';
import styles from './modal.module.scss';

const cx = classNames.bind(styles);
function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;
  return (
    <div className={cx('modal')} onClick={onClose}>
      <div className={cx('content')} onClick={(e) => e.stopPropagation()}>
        <div className={cx('header')}>
          <h3 className={cx('title')}>{title}</h3>
          <button className={cx('closeBtn')} onClick={onClose}>
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
