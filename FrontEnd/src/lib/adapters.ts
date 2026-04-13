// Adapt API snake_case → frontend camelCase fields

export function adaptDocument(d: any) {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    thumbnail: d.thumbnail_url || '',
    fileType: d.file_type,
    allowDownload: d.allow_download,
    featured: d.featured,
    status: d.status?.toLowerCase() ?? 'draft',
    views: d.views ?? 0,
    downloads: d.downloads ?? 0,
    uploadDate: d.created_at,
    tags: d.tags?.map((t: any) => t.name) ?? [],
    category: d.category ?? null,
    fileUrl: d.file_url ?? '',
    previewUrl: d.preview_url ?? '',
  };
}

export function adaptQuiz(q: any) {
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    topic: q.topic ?? '',
    // time_limit from API is in seconds
    timeLimit: q.time_limit,
    difficulty: q.difficulty?.toLowerCase() ?? 'medium',
    totalPoints: q.total_points ?? 100,
    attemptMode: q.attempt_mode ?? 'SINGLE',
    retryScoreMode: q.retry_score_mode ?? 'ZERO',
    retryPenaltyPercent: q.retry_penalty_percent ?? 50,
    countPointsOnce: q.count_points_once ?? true,
    availableFrom: q.available_from ?? null,
    availableUntil: q.available_until ?? null,
    reward: q.has_reward,
    rewardDescription: q.reward_description ?? '',
    participants: q.participants_count ?? 0,
    questionCount: q.questions?.length ?? q.question_count ?? 0,
    status: q.is_published ? 'published' : 'draft',
    tags: q.tags?.map((t: any) => t.name) ?? [],
    questions: q.questions ?? [],
    is_published: q.is_published,
  };
}

export function adaptLeaderboardEntry(e: any, index: number) {
  return {
    id: e.user_id,
    rank: e.rank ?? index + 1,
    name: e.full_name || e.username,
    avatar: e.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.username}`,
    points: e.total_score ?? 0,
    quizzesJoined: e.quizzes_completed ?? 0,
    questionsPosted: e.questions_posted ?? 0,
    joinDate: e.join_date ?? '',
    status: e.status ?? 'active',
    phone: e.phone ?? '',
  };
}

export function adaptCommunityQuestion(q: any) {
  return {
    id: q.id,
    title: q.title,
    description: q.content,
    status: q.status?.toLowerCase() ?? 'pending',
    userName: q.user?.username ?? '',
    userAvatar: q.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${q.user?.username}`,
    userId: q.user?.id ?? '',
    images: q.images?.map((img: any) => img.image_url) ?? [],
    tags: q.tags?.map((t: any) => t.name) ?? [],
    tagObjects: q.tags ?? [],
    answerCount: q.answer_count ?? 0,
    postedDate: q.created_at,
    adminNote: q.admin_note ?? '',
  };
}

export function adaptAnswer(a: any) {
  return {
    id: a.id,
    content: a.content,
    upvotes: a.upvotes ?? 0,
    isUpvoted: a.is_upvoted_by_me ?? a.user_upvoted ?? false,
    replyToAnswerId: a.reply_to_answer_id ?? null,
    userName: a.user?.username ?? '',
    userAvatar: a.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.user?.username}`,
    userId: a.user?.id ?? '',
    images: a.images?.map((img: any) => img.image_url) ?? [],
    postedDate: a.created_at,
    replies: a.replies?.map((reply: any) => adaptAnswer(reply)) ?? [],
  };
}

export function adaptUser(u: any) {
  return {
    id: u.id,
    username: u.username,
    email: u.email ?? '',
    fullName: u.full_name ?? '',
    avatarUrl: u.avatar_url ?? '',
    phone: u.phone ?? '',
    birthYear: u.birth_year ? String(u.birth_year) : '',
    school: u.school ?? '',
    role: u.role ?? 'USER',
    stats: u.stats ?? { rank: 0, points: 0, quizzes_completed: 0, questions_posted: 0 },
  };
}
