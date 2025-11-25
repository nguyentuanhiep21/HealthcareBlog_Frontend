import type { User, Post, Comment, Notification, Report } from "./types"

export const mockUsers: Record<string, User> = {
  user1: {
    id: "user1",
    name: "Tuấn Hiệp",
    avatar: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop",
    bio: "Chuyên gia sức khỏe, yêu thích yoga và dinh dưỡng",
    followers: 1250,
    following: 342,
    isFollowing: false,
  },
  user2: {
    id: "user2",
    name: "Linh Vy",
    avatar: "/avatar-woman-wellness.jpg",
    bio: "Huấn luyện viên fitness, tư vấn lối sống lành mạnh",
    followers: 2340,
    following: 156,
    isFollowing: false,
  },
  user3: {
    id: "user3",
    name: "Thanh Sơn",
    avatar: "/avatar-man-doctor.jpg",
    bio: "Bác sĩ tim mạch, chia sẻ kiến thức y tế",
    followers: 3120,
    following: 98,
    isFollowing: false,
  },
  user4: {
    id: "user4",
    name: "Minh Anh",
    avatar: "/avatar-woman-nutrition.jpg",
    bio: "Dinh dưỡng sĩ, hỗ trợ chế độ ăn uống khoa học",
    followers: 1890,
    following: 234,
    isFollowing: false,
  },
  currentUser: {
    id: "current",
    name: "Bạn",
    avatar: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    bio: "Yêu sức khỏe, yêu cuộc sống",
    followers: 450,
    following: 328,
  },
}

export const mockPosts: Post[] = [
  {
    id: "post1",
    author: mockUsers.user1,
    caption:
      "5 bài tập yoga tuyệt vời mà bạn có thể làm buổi sáng để bắt đầu ngày mới. Yoga không chỉ giúp tăng tính linh hoạt mà còn giảm stress và cải thiện tinh thần. Hãy thử ngay hôm nay! 🧘‍♀️",
    image: "/yoga-morning-exercises.jpg",
    likes: 1234,
    comments: 89,
    isSaved: false,
    isLiked: false,
    createdAt: "2 giờ trước",
  },
  {
    id: "post2",
    author: mockUsers.user2,
    caption:
      "Hiểu đúng về giảm cân: Không phải là đói, mà là ăn thông minh! Bằng cách chọn thực phẩm giàu protein, ít tinh bột, bạn sẽ cảm thấy no lâu hơn và không bị mệt mỏi.",
    image: "/healthy-food-nutrition.jpg",
    likes: 2156,
    comments: 234,
    isSaved: false,
    isLiked: false,
    createdAt: "5 giờ trước",
  },
  {
    id: "post3",
    author: mockUsers.user3,
    caption:
      'Huyết áp cao là "kẻ thù lặng lẽ" nếu không được kiểm soát. Tôi muốn chia sẻ 7 cách đơn giản để kiểm soát huyết áp tự nhiên mà không cần dùng quá nhiều thuốc.',
    likes: 1876,
    comments: 145,
    isSaved: false,
    isLiked: false,
    createdAt: "8 giờ trước",
  },
  {
    id: "post4",
    author: mockUsers.user4,
    caption:
      "Cơm trưa hôm nay của bạn quá nhiều muối? Muối thừa không chỉ làm tăng cân mà còn gây viêm nhiễm. Dưới đây là menu 7 ngày ăn uống cân bằng, ít muối nhưng vẫn rất ngon!",
    image: "/balanced-meal-prep.jpg",
    likes: 945,
    comments: 67,
    isSaved: false,
    isLiked: false,
    createdAt: "1 ngày trước",
  },
  {
    id: "post5",
    author: mockUsers.user1,
    caption:
      "Bạn có biết rằng thiền định có thể giúp cải thiện hiệu suất lao động lên tới 30%? Tôi đã thực hành thiền 10 phút mỗi sáng trong 30 ngày và cảm thấy thay đổi tích cực.",
    likes: 2345,
    comments: 189,
    isSaved: false,
    isLiked: false,
    createdAt: "1 ngày trước",
  },
]

export const mockComments: Record<string, Comment[]> = {
  post1: [
    {
      id: "comment1",
      author: mockUsers.user2,
      text: "Yoga thực sự rất tuyệt vời! Tôi đã bắt đầu 1 tháng trước và cảm thấy cơ thể linh hoạt hơn rất nhiều.",
      likes: 45,
      isLiked: false,
      createdAt: "1 giờ trước",
    },
    {
      id: "comment2",
      author: mockUsers.user3,
      text: "Bài viết rất hữu ích. Tôi sẽ giới thiệu cho bệnh nhân của mình về yoga.",
      likes: 32,
      isLiked: false,
      createdAt: "30 phút trước",
    },
  ],
  post2: [
    {
      id: "comment3",
      author: mockUsers.user1,
      text: "Đúng vậy! Protein là chìa khóa. Tôi ăn gà không da mỗi bữa trưa và cảm thấy rất no.",
      likes: 67,
      isLiked: false,
      createdAt: "2 giờ trước",
    },
  ],
}

export const mockFeaturedPosts: Post[] = [
  {
    id: "featured1",
    author: mockUsers.user3,
    caption: "Tất cả những gì bạn cần biết về chế độ ăn Địa Trung Hải",
    image: "/mediterranean-diet.jpg",
    likes: 5234,
    comments: 456,
    isSaved: false,
    isLiked: false,
    createdAt: "3 ngày trước",
  },
  {
    id: "featured2",
    author: mockUsers.user2,
    caption: "Cách tập luyện hiệu quả nhất trong 30 phút",
    image: "/workout-training.jpg",
    likes: 4567,
    comments: 345,
    isSaved: false,
    isLiked: false,
    createdAt: "5 ngày trước",
  },
  {
    id: "featured3",
    author: mockUsers.user4,
    caption: "Vitamin D: Tại sao nó quan trọng đối với sức khỏe của bạn",
    image: "/vitamin-d-sunshine.jpg",
    likes: 3891,
    comments: 267,
    isSaved: false,
    isLiked: false,
    createdAt: "1 tuần trước",
  },
]

export const mockSuggestedUsers: User[] = [mockUsers.user2, mockUsers.user3, mockUsers.user4]

export const mockNotifications: Notification[] = [
  {
    id: "notif1",
    type: "like",
    from: mockUsers.user2,
    content: 'đã thích bài viết của bạn: "5 bài tập yoga tuyệt vời..."',
    relatedPostId: "post1",
    isRead: false,
    createdAt: "5 phút trước",
  },
  {
    id: "notif2",
    type: "comment",
    from: mockUsers.user3,
    content: 'đã bình luận về bài viết của bạn: "Bài viết rất hữu ích..."',
    relatedPostId: "post1",
    isRead: false,
    createdAt: "30 phút trước",
  },
  {
    id: "notif3",
    type: "follow",
    from: mockUsers.user4,
    content: "đã bắt đầu theo dõi bạn",
    isRead: true,
    createdAt: "2 giờ trước",
  },
  {
    id: "notif4",
    type: "system",
    content: "Chào mừng bạn đến với Health! Hãy cập nhật hồ sơ để kết nối với mọi người.",
    isRead: true,
    createdAt: "1 ngày trước",
  },
]

export const mockReports: Report[] = [
  {
    id: "report1",
    type: "post",
    reportedBy: mockUsers.user3,
    targetId: "post2",
    targetContent: "Hiểu đúng về giảm cân: Không phải là đói, mà là ăn thông minh!...",
    targetAuthor: mockUsers.user2,
    reason: "Nội dung không chính xác về y học",
    status: "pending",
    createdAt: "1 giờ trước",
  },
  {
    id: "report2",
    type: "comment",
    reportedBy: mockUsers.user1,
    targetId: "comment3",
    targetContent: "Đúng vậy! Protein là chìa khóa...",
    targetAuthor: mockUsers.user1,
    reason: "Spam hoặc quảng cáo",
    status: "pending",
    createdAt: "3 giờ trước",
  },
  {
    id: "report3",
    type: "user",
    reportedBy: mockUsers.user4,
    targetId: "user2",
    targetContent: "Hồ sơ người dùng Linh Vy",
    targetAuthor: mockUsers.user2,
    reason: "Mạo danh chuyên gia",
    status: "resolved",
    createdAt: "1 ngày trước",
  },
  {
    id: "report4",
    type: "post",
    reportedBy: mockUsers.user2,
    targetId: "post3",
    targetContent: 'Huyết áp cao là "kẻ thù lặng lẽ"...',
    targetAuthor: mockUsers.user3,
    reason: "Nội dung vi phạm quy định cộng đồng",
    status: "rejected",
    createdAt: "2 ngày trước",
  },
]
