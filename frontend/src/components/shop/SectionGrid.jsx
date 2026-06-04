import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { SECTIONS } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SectionGrid() {
  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Everything you need, organized for you
          </p>
        </div>
        <Link
          to="/shops"
          className="text-sm text-primary font-medium hover:underline hidden sm:flex items-center gap-1"
        >
          View All <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4"
      >
        {SECTIONS.map((section) => (
          <motion.div key={section.id} variants={itemVariants}>
            <Link
              to={`/shops?category=${section.id}`}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${section.color}15` }}
              >
                <section.icon className="h-7 w-7" style={{ color: section.color }} />
              </div>
              <span className="text-xs font-medium text-center leading-tight">
                {section.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
