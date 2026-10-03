import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

const ContainerChatWindow = (props: PropsWithChildren) => {
  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, x: '100vw' }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        opacity: { ease: 'easeIn' },
        layout: { duration: 0.6 },
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      {props.children}
    </motion.div>
  );
};

export default ContainerChatWindow;
