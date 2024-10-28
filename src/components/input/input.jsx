import { useFormContext } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { MdError } from 'react-icons/md';

import { findInputError, isFormInvalid } from '~/utils';
import classNames from 'classnames/bind';
import style from './input.module.scss';

const cx = classNames.bind(style);

export const Input = ({ name, label, type, id, placeholder, validation, multiline, onKeyDown }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const inputErrors = findInputError(errors, name);
  const isInvalid = isFormInvalid(inputErrors);

  return (
    <div className={cx('input-item')} onKeyDown={onKeyDown}>
      <div className={cx('input-header')}>
        <label htmlFor={id} className={cx('label')}>
          {label}
        </label>
        <AnimatePresence mode="wait" initial={false}>
          {isInvalid && <InputError message={inputErrors.error.message} key={inputErrors.error.message} />}
        </AnimatePresence>
      </div>
      {multiline ? (
        <textarea id={id} type={type} placeholder={placeholder} {...register(name, validation)}></textarea>
      ) : (
        <input
          id={id}
          type={type}
          className={cx('customInput')}
          placeholder={placeholder}
          {...register(name, validation)}
        />
      )}
    </div>
  );
};

const InputError = ({ message }) => {
  return (
    <motion.p className={cx('input-error')} {...framer_error}>
      <MdError />
      {message}
    </motion.p>
  );
};

const framer_error = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
};
