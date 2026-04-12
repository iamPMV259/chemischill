import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { documents } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCategoriesByParent, getSubcategories } from '../../data/categoryData';
import DocumentRow from '../../components/DocumentRow';

export default function DocumentLibraryPage() {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [inorganicExpanded, setInorganicExpanded] = useState(true);
  const [organicExpanded, setOrganicExpanded] = useState(true);

  const generalChemistryCategories = getCategoriesByParent(undefined).filter(cat =>
    ['midterm', 'final', 'thpt'].includes(cat.id)
  );

  const getCategoryDocs = (categoryId: string) => {
    return documents.slice(0, 6);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">{t('docs.libraryTitle')}</h1>
          <p className="text-gray-600">{t('docs.librarySubtitle')}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={t('docs.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6"
            />
          </div>
        </div>

        {/* Tabs for General and Advanced Chemistry */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="general" className="text-lg">
              {t('docs.generalChemistry')}
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-lg">
              {t('docs.advancedChemistry')}
            </TabsTrigger>
          </TabsList>

          {/* General Chemistry Tab */}
          <TabsContent value="general" className="space-y-8">
            {generalChemistryCategories.map((category) => (
              <DocumentRow
                key={category.id}
                title={language === 'vi' ? category.nameVi : category.nameEn}
                documents={getCategoryDocs(category.id)}
              />
            ))}
          </TabsContent>

          {/* Advanced Chemistry Tab */}
          <TabsContent value="advanced" className="space-y-12">
            {/* Inorganic Chemistry Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="border-l-4 border-blue-600 pl-4 flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {language === 'vi' ? 'Hóa Vô Cơ' : 'Inorganic Chemistry'}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setInorganicExpanded(!inorganicExpanded)}
                  className="ml-4"
                >
                  {inorganicExpanded ? (
                    <>
                      <ChevronUp className="w-5 h-5 mr-2" />
                      {language === 'vi' ? 'Ẩn' : 'Hide'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5 mr-2" />
                      {language === 'vi' ? 'Hiện' : 'Show'}
                    </>
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {inorganicExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 overflow-hidden"
                  >
                    {getSubcategories('inorganic').map((subcategory) => (
                      <DocumentRow
                        key={subcategory.id}
                        title={language === 'vi' ? subcategory.nameVi : subcategory.nameEn}
                        documents={getCategoryDocs(subcategory.id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Organic Chemistry Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="border-l-4 border-purple-600 pl-4 flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {language === 'vi' ? 'Hóa Hữu Cơ' : 'Organic Chemistry'}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setOrganicExpanded(!organicExpanded)}
                  className="ml-4"
                >
                  {organicExpanded ? (
                    <>
                      <ChevronUp className="w-5 h-5 mr-2" />
                      {language === 'vi' ? 'Ẩn' : 'Hide'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5 mr-2" />
                      {language === 'vi' ? 'Hiện' : 'Show'}
                    </>
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {organicExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 overflow-hidden"
                  >
                    {getSubcategories('organic').map((subcategory) => (
                      <DocumentRow
                        key={subcategory.id}
                        title={language === 'vi' ? subcategory.nameVi : subcategory.nameEn}
                        documents={getCategoryDocs(subcategory.id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
