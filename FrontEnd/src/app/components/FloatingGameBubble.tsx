import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import CapybaraGame from './CapybaraGame';

export default function FloatingGameBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center cursor-pointer group hover:shadow-3xl transition-shadow"
          >
            <div className="relative">
              {/* Capybara emoji/icon */}
              <span className="text-3xl">🦫</span>

              {/* Pulse animation */}
              <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Game Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="sr-only">Capybara Game</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <CapybaraGame />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
