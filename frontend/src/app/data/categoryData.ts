export interface Category {
  id: string;
  nameVi: string;
  nameEn: string;
  parentId?: string;
}

export const documentCategories: Category[] = [
  // General Chemistry Categories
  { id: 'midterm', nameVi: 'Đề Thi Giữa Kỳ', nameEn: 'Midterm Exams' },
  { id: 'final', nameVi: 'Đề Thi Cuối Kỳ', nameEn: 'Final Exams' },
  { id: 'thpt', nameVi: 'Đề Thi THPT', nameEn: 'High School Exams' },

  // Advanced Chemistry - Main Categories
  { id: 'inorganic', nameVi: 'Hóa Vô Cơ', nameEn: 'Inorganic Chemistry' },
  { id: 'organic', nameVi: 'Hóa Hữu Cơ', nameEn: 'Organic Chemistry' },

  // Inorganic Chemistry Subcategories
  { id: 'inorganic-reactions', nameVi: 'Phản Ứng Vô Cơ', nameEn: 'Inorganic Reactions', parentId: 'inorganic' },
  { id: 'inorganic-structure', nameVi: 'Cấu Trúc Phân Tử', nameEn: 'Molecular Structure', parentId: 'inorganic' },
  { id: 'inorganic-bonding', nameVi: 'Liên Kết Hóa Học', nameEn: 'Chemical Bonding', parentId: 'inorganic' },
  { id: 'inorganic-periodic', nameVi: 'Bảng Tuần Hoàn', nameEn: 'Periodic Table', parentId: 'inorganic' },
  { id: 'inorganic-coordination', nameVi: 'Hợp Chất Phối Trí', nameEn: 'Coordination Compounds', parentId: 'inorganic' },

  // Organic Chemistry Subcategories
  { id: 'organic-reactions', nameVi: 'Phản Ứng Hữu Cơ', nameEn: 'Organic Reactions', parentId: 'organic' },
  { id: 'organic-mechanisms', nameVi: 'Cơ Chế Phản Ứng', nameEn: 'Reaction Mechanisms', parentId: 'organic' },
  { id: 'organic-synthesis', nameVi: 'Tổng Hợp Hữu Cơ', nameEn: 'Organic Synthesis', parentId: 'organic' },
  { id: 'organic-functional', nameVi: 'Nhóm Chức', nameEn: 'Functional Groups', parentId: 'organic' },
  { id: 'organic-stereochemistry', nameVi: 'Hóa Lập Thể', nameEn: 'Stereochemistry', parentId: 'organic' },
];

export function getCategoriesByParent(parentId?: string): Category[] {
  return documentCategories.filter(cat => cat.parentId === parentId);
}

export function getMainCategories(): Category[] {
  return documentCategories.filter(cat => !cat.parentId);
}

export function getSubcategories(parentId: string): Category[] {
  return documentCategories.filter(cat => cat.parentId === parentId);
}
