// components/Header.jsx
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { 
  FiSun, 
  FiMoon, 
  FiMenu, 
  FiX, 
  FiHome,
  FiUsers,
  FiCalendar,
  FiAlertCircle,
  FiBarChart2
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Candidates', href: '/candidates', icon: FiUsers },
    { name: 'Interviews', href: '/interviews', icon: FiCalendar },
    { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
    { name: 'Errors', href: '/errors', icon: FiAlertCircle },
  ];

  const isActive = (href) => router.pathname === href;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-lg bg-spooled-white/80 dark:bg-astral-ink/80 border-b border-sakura/20 dark:border-cold-current/20"
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-ballad to-sakura shadow-sakura"
              >
                <span className="text-spooled-white font-bold text-xl">AI</span>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-display font-bold bg-gradient-to-r from-pink-ballad to-cold-current bg-clip-text text-transparent">
                  Candidate Screening
                </h1>
                <p className="text-xs text-astral-ink/60 dark:text-spooled-white/60">
                  AI-Powered Recruitment
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-sakura/20 text-pink-ballad dark:bg-pink-ballad/20 dark:text-sakura'
                    : 'text-astral-ink/70 dark:text-spooled-white/70 hover:bg-sakura/10 dark:hover:bg-cold-current/20'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {mounted && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-sakura/10 dark:bg-cold-current/20 text-astral-ink dark:text-spooled-white hover:bg-sakura/20 dark:hover:bg-cold-current/30 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </motion.button>
            )}

            {/* User Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-ballad to-sakura flex items-center justify-center text-spooled-white font-medium cursor-pointer"
            >
              HR
            </motion.div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-astral-ink dark:text-spooled-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all',
                  isActive(item.href)
                    ? 'bg-sakura/20 text-pink-ballad dark:bg-pink-ballad/20 dark:text-sakura'
                    : 'text-astral-ink/70 dark:text-spooled-white/70'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </nav>
    </motion.header>
  );
};

export default Header;