import { motion } from "framer-motion";

const Header_bar = () => {
  return (
    <motion.div
      className="header_bar"
      initial={{ opacity: 0, y: "50vh", scale: 3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        opacity: { ease: "linear" },
        layout: { duration: 1 },
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <h1 className="display-6">🐱 gatoCh@t 🐈</h1>
    </motion.div>
  );
};

export default Header_bar;
