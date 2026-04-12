import { useRef } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, Download, Eye, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface Document {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  views: number;
  downloads: number;
  featured?: boolean;
  fileType: string;
  allowDownload?: boolean;
}

interface DocumentRowProps {
  title: string;
  documents: Document[];
}

export default function DocumentRow({ title, documents }: DocumentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="flex-shrink-0 w-72"
          >
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full">
              <div className="relative h-40 overflow-hidden">
                <img
                  src={doc.thumbnail}
                  alt={doc.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {doc.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500 text-white text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {t('featuredDocs.featured')}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2 line-clamp-2">{doc.title}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {doc.views.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {doc.downloads.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/documents/${doc.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      {t('docs.preview')}
                    </Button>
                  </Link>
                  {doc.allowDownload !== false && (
                    <Button size="sm" className="flex-1 text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      {t('docs.download')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
