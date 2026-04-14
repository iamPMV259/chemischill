import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  vi: {
    // Navigation
    'nav.home': 'Trang Chủ',
    'nav.documents': 'Tài Liệu',
    'nav.quizzes': 'Quiz',
    'nav.community': 'Cộng Đồng',
    'nav.leaderboard': 'Xếp Hạng',
    'nav.profile': 'Hồ Sơ',
    'nav.login': 'Đăng Nhập',
    'nav.about': 'Về Chúng Tôi',
    'nav.appName': 'ChemisChill',
    'nav.appSubtitle': 'Cộng Đồng Hóa Học',
    'nav.userView': 'Giao Diện Người Dùng',
    'nav.adminView': 'Giao Diện Admin',

    // HomePage Hero
    'hero.title': 'Làm Chủ Hóa Học',
    'hero.subtitle': 'Cùng Cộng Đồng',
    'hero.description': 'Truy cập tài liệu học tập chuyên sâu, tham gia quiz cạnh tranh và nhận hỗ trợ từ cộng đồng chuyên gia.',
    'hero.exploreDocuments': 'Khám Phá Tài Liệu',
    'hero.takeQuizzes': 'Tham Gia Quiz',
    'hero.searchPlaceholder': 'Tìm kiếm chủ đề hóa học, tài liệu hoặc câu hỏi...',

    // Popular Tags
    'popularTags.title': 'Chủ Đề Phổ Biến',

    // Featured Documents
    'featuredDocs.title': 'Tài Liệu Nổi Bật',
    'featuredDocs.subtitle': 'Tài liệu chất lượng cao được tuyển chọn',
    'featuredDocs.viewAll': 'Xem Tất Cả',
    'featuredDocs.featured': 'Featured',
    'featuredDocs.views': 'lượt xem',
    'featuredDocs.downloads': 'tải xuống',

    // Trending Quizzes
    'quizzes.title': 'Quiz Thịnh Hành',
    'quizzes.subtitle': 'Thử thách bản thân và cạnh tranh với người khác',
    'quizzes.reward': 'Reward',
    'quizzes.questions': 'câu hỏi',
    'quizzes.minutes': 'phút',
    'quizzes.participants': 'người tham gia',
    'quizzes.joinNow': 'Tham Gia Ngay',

    // Teaching Team
    'team.title': 'Đội Ngũ Giảng Dạy',
    'team.subtitle': 'Những chuyên gia hóa học giàu kinh nghiệm',
    'team.viewProfile': 'Xem Hồ Sơ',
    'team.yearsExp': 'năm kinh nghiệm',
    'team.students': 'học viên',

    // Leaderboard
    'leaderboard.title': 'Học Viên Xuất Sắc',
    'leaderboard.subtitle': 'Xem ai đang dẫn đầu trong việc chinh phục hóa học',
    'leaderboard.viewFull': 'Bảng Xếp Hạng Đầy Đủ',
    'leaderboard.points': 'pts',
    'leaderboard.quiz': 'Quiz',
    'leaderboard.questions': 'Câu hỏi',

    // Community CTA
    'community.title': 'Cần Trợ Giúp Về Hóa Học?',
    'community.description': 'Cộng đồng chuyên gia và học viên sẵn sàng giúp bạn giải quyết các bài tập khó',
    'community.askQuestion': 'Đặt Câu Hỏi',

    // Game
    'game.title': 'Giải Trí Cùng Capybara',
    'game.subtitle': 'Thư giãn với trò chơi vui nhộn',
    'game.start': 'Bắt Đầu Chơi',
    'game.gameOver': 'Trò chơi kết thúc',
    'game.score': 'Điểm',
    'game.restart': 'Chơi Lại',
    'game.pressSpace': 'Nhấn SPACE để nhảy',

    // Document Library
    'docs.libraryTitle': 'Thư Viện Tài Liệu',
    'docs.librarySubtitle': 'Khám phá tài liệu học hóa từ cơ bản đến nâng cao',
    'docs.searchPlaceholder': 'Tìm kiếm tài liệu theo tiêu đề, chủ đề hoặc từ khóa...',
    'docs.filterByTag': 'Lọc Theo Thẻ',
    'docs.filterTreeTitle': 'Cây Chủ Đề',
    'docs.clearAll': 'Xóa Tất Cả',
    'docs.generalChemistry': 'Hóa phổ thông',
    'docs.advancedChemistry': 'Hóa chuyên',
    'docs.midtermExams': 'Đề Thi Giữa Kỳ',
    'docs.finalExams': 'Đề Thi Cuối Kỳ',
    'docs.thptExams': 'Đề Thi THPT',
    'docs.organicChemistry': 'Hóa Hữu Cơ',
    'docs.inorganicChemistry': 'Hóa Vô Cơ',
    'docs.physicalChemistry': 'Hóa Lý',
    'docs.analyticalChemistry': 'Hóa Phân Tích',
    'docs.grade6': 'Lớp 6',
    'docs.grade7': 'Lớp 7',
    'docs.grade8': 'Lớp 8',
    'docs.grade9': 'Lớp 9',
    'docs.grade10': 'Lớp 10',
    'docs.grade11': 'Lớp 11',
    'docs.grade12': 'Lớp 12',
    'docs.viewMore': 'Xem Thêm',
    'docs.preview': 'Xem Trước',
    'docs.download': 'Tải Xuống',
    'docs.found': 'Tìm thấy',
    'docs.documents': 'tài liệu',
    'docs.noDocumentsFound': 'Không tìm thấy tài liệu',
    'docs.tryAdjustFilters': 'Thử điều chỉnh tìm kiếm hoặc bộ lọc',
    'docs.previous': 'Trước',
    'docs.next': 'Tiếp',
    'docs.page': 'Trang',
    'docs.downloadFailed': 'Không thể tải tài liệu',
    'docs.backToLibrary': 'Quay Lại Thư Viện',
    'docs.documentNotFound': 'Không tìm thấy tài liệu',
    'docs.uploadedOn': 'Tải lên',
    'docs.viewsLabel': 'lượt xem',
    'docs.downloadsLabel': 'lượt tải',
    'docs.previewOnly': 'Chỉ Xem Trước',
    'docs.save': 'Lưu',
    'docs.previewTitle': 'Xem Trước Tài Liệu',
    'docs.openPreview': 'Mở Bản Xem Trước',
    'docs.officePreviewHint': 'File Word được nhúng qua Office Web Viewer. Nếu preview lỗi, hãy mở ở tab mới hoặc tải xuống.',
    'docs.previewUnavailable': 'Định dạng này hiện chưa hỗ trợ xem trước trực tiếp.',
    'docs.previewUnavailableHint': 'Bạn có thể mở file ở tab mới hoặc tải xuống để xem đầy đủ.',
    'docs.openFile': 'Mở File',
    'docs.infoTitle': 'Thông Tin Tài Liệu',
    'docs.fileType': 'Loại File',
    'docs.status': 'Trạng Thái',
    'docs.uploadDate': 'Ngày Tải Lên',
    'docs.totalViews': 'Tổng Lượt Xem',
    'docs.public': 'Công khai',
    'docs.private': 'Riêng tư',
    'docs.draft': 'Nháp',
    'docs.loginToSave': 'Bạn cần đăng nhập để lưu tài liệu',
    'docs.savedSuccess': 'Đã lưu tài liệu',
    'docs.saveFailed': 'Không thể lưu tài liệu',

    // Admin
    'admin.dashboard': 'Tổng Quan',
    'admin.documents': 'Tài Liệu',
    'admin.quizzes': 'Quiz',
    'admin.questionApproval': 'Duyệt Câu Hỏi',
    'admin.tags': 'Thẻ',
    'admin.categories': 'Thể Loại',
    'admin.users': 'Người Dùng',
    'admin.leaderboard': 'Bảng Xếp Hạng',
    'admin.adminPanel': 'Quản Trị Viên',
    'admin.backToSite': 'Về Trang Chủ',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.documents': 'Documents',
    'nav.quizzes': 'Quizzes',
    'nav.community': 'Community',
    'nav.leaderboard': 'Leaderboard',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.about': 'About Us',
    'nav.appName': 'ChemisChill',
    'nav.appSubtitle': 'Chemistry Community',
    'nav.userView': 'User View',
    'nav.adminView': 'Admin View',

    // HomePage Hero
    'hero.title': 'Master Chemistry',
    'hero.subtitle': 'With Community',
    'hero.description': 'Access in-depth learning materials, participate in competitive quizzes, and get support from expert community.',
    'hero.exploreDocuments': 'Explore Documents',
    'hero.takeQuizzes': 'Take Quizzes',
    'hero.searchPlaceholder': 'Search chemistry topics, documents or questions...',

    // Popular Tags
    'popularTags.title': 'Popular Topics',

    // Featured Documents
    'featuredDocs.title': 'Featured Documents',
    'featuredDocs.subtitle': 'High-quality curated materials',
    'featuredDocs.viewAll': 'View All',
    'featuredDocs.featured': 'Featured',
    'featuredDocs.views': 'views',
    'featuredDocs.downloads': 'downloads',

    // Trending Quizzes
    'quizzes.title': 'Trending Quizzes',
    'quizzes.subtitle': 'Challenge yourself and compete with others',
    'quizzes.reward': 'Reward',
    'quizzes.questions': 'questions',
    'quizzes.minutes': 'minutes',
    'quizzes.participants': 'participants',
    'quizzes.joinNow': 'Join Now',

    // Teaching Team
    'team.title': 'Teaching Team',
    'team.subtitle': 'Experienced chemistry experts',
    'team.viewProfile': 'View Profile',
    'team.yearsExp': 'years experience',
    'team.students': 'students',

    // Leaderboard
    'leaderboard.title': 'Top Learners',
    'leaderboard.subtitle': 'See who is leading the chemistry conquest',
    'leaderboard.viewFull': 'Full Leaderboard',
    'leaderboard.points': 'pts',
    'leaderboard.quiz': 'Quiz',
    'leaderboard.questions': 'Questions',

    // Community CTA
    'community.title': 'Need Help With Chemistry?',
    'community.description': 'Expert community and learners are ready to help you solve difficult problems',
    'community.askQuestion': 'Ask Question',

    // Game
    'game.title': 'Fun with Capybara',
    'game.subtitle': 'Relax with a fun game',
    'game.start': 'Start Game',
    'game.gameOver': 'Game Over',
    'game.score': 'Score',
    'game.restart': 'Restart',
    'game.pressSpace': 'Press SPACE to jump',

    // Document Library
    'docs.libraryTitle': 'Document Library',
    'docs.librarySubtitle': 'Explore chemistry materials from basic to advanced',
    'docs.searchPlaceholder': 'Search documents by title, topic or keywords...',
    'docs.filterByTag': 'Filter By Tag',
    'docs.filterTreeTitle': 'Topic Tree',
    'docs.clearAll': 'Clear All',
    'docs.generalChemistry': 'General Chemistry',
    'docs.advancedChemistry': 'Advanced Chemistry',
    'docs.midtermExams': 'Midterm Exams',
    'docs.finalExams': 'Final Exams',
    'docs.thptExams': 'High School Exams',
    'docs.organicChemistry': 'Organic Chemistry',
    'docs.inorganicChemistry': 'Inorganic Chemistry',
    'docs.physicalChemistry': 'Physical Chemistry',
    'docs.analyticalChemistry': 'Analytical Chemistry',
    'docs.grade6': 'Grade 6',
    'docs.grade7': 'Grade 7',
    'docs.grade8': 'Grade 8',
    'docs.grade9': 'Grade 9',
    'docs.grade10': 'Grade 10',
    'docs.grade11': 'Grade 11',
    'docs.grade12': 'Grade 12',
    'docs.viewMore': 'View More',
    'docs.preview': 'Preview',
    'docs.download': 'Download',
    'docs.found': 'Found',
    'docs.documents': 'documents',
    'docs.noDocumentsFound': 'No documents found',
    'docs.tryAdjustFilters': 'Try adjusting your search or filters',
    'docs.previous': 'Previous',
    'docs.next': 'Next',
    'docs.page': 'Page',
    'docs.downloadFailed': 'Unable to download document',
    'docs.backToLibrary': 'Back to Library',
    'docs.documentNotFound': 'Document not found',
    'docs.uploadedOn': 'Uploaded on',
    'docs.viewsLabel': 'views',
    'docs.downloadsLabel': 'downloads',
    'docs.previewOnly': 'Preview Only',
    'docs.save': 'Save',
    'docs.previewTitle': 'Document Preview',
    'docs.openPreview': 'Open Preview',
    'docs.officePreviewHint': 'Word files are embedded via Office Web Viewer. If the preview fails, open it in a new tab or download it.',
    'docs.previewUnavailable': 'This format is not supported for inline preview yet.',
    'docs.previewUnavailableHint': 'You can open the file in a new tab or download it to view the full content.',
    'docs.openFile': 'Open File',
    'docs.infoTitle': 'Document Information',
    'docs.fileType': 'File Type',
    'docs.status': 'Status',
    'docs.uploadDate': 'Upload Date',
    'docs.totalViews': 'Total Views',
    'docs.public': 'Public',
    'docs.private': 'Private',
    'docs.draft': 'Draft',
    'docs.loginToSave': 'You need to sign in to save this document',
    'docs.savedSuccess': 'Document saved',
    'docs.saveFailed': 'Unable to save document',

    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.documents': 'Documents',
    'admin.quizzes': 'Quizzes',
    'admin.questionApproval': 'Question Approval',
    'admin.tags': 'Tags',
    'admin.categories': 'Categories',
    'admin.users': 'Users',
    'admin.leaderboard': 'Leaderboard',
    'admin.adminPanel': 'Admin Panel',
    'admin.backToSite': 'Back to Site',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.vi] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
