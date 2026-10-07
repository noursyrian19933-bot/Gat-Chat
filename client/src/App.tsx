import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  limit,
  limitToLast,
  startAfter,
  endBefore
} from 'firebase/firestore';

import { getDatabase, ref, child, get, set, update, onValue, onDisconnect, query as rtdbQuery, orderByChild as rtdbOrderByChild, equalTo as rtdbEqualTo } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBYMtDF5lcLhSc2vvNlvkH0VkYV-PaoL2I",
  authDomain: "gat-chat-b7187.firebaseapp.com",
  projectId: "gat-chat-b7187",
  storageBucket: "gat-chat-b7187.firebasestorage.app",
  messagingSenderId: "1062482533282",
  appId: "1:1062482533282:web:745104a6415898bac530fb",
  databaseURL: "https://gat-chat-b7187-default-rtdb.firebaseio.com",
  measurementId: "G-ZW607L85LT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rdb = getDatabase(app);

const ADMIN_EMAIL = "nour.syrian.19933@gmail.com";

const PROFILE_BG_COLORS = [
  { name: 'أبيض ناصع', value: '#ffffff' },
  { name: 'داكن أنيق', value: '#0b141a' },
  { name: 'كحلي ليلي', value: '#0f172a' },
  { name: 'رمادي فاتح', value: '#f8fafc' },
  { name: 'ذهبي خفيف', value: '#fefce8' },
  { name: 'أزرق سماوي', value: '#e0f2fe' },
  { name: 'وردي ناعم', value: '#fdf4ff' },
  { name: 'أخضر هادئ', value: '#dcfce7' },
  { name: 'بنفسجي ملكي', value: '#f3e8ff' },
  { name: 'برتقالي دافئ', value: '#ffedd5' },
  { name: 'رمادي غامق', value: '#1e293b' },
  { name: 'أحمر هادئ', value: '#fee2e2' }
];

const getCountryFlag = (country: string) => {
  switch (country) {
    case 'الأردن': return '🇯🇴';
    case 'سوريا': return '🟩⬜⬛ ⭐⭐⭐'; // العلم السوري الجديد (علم الاستقلال)
    case 'مصر': return '🇪🇬';
    case 'السودان': return '🇸🇩';
    case 'السعودية': return '🇸🇦';
    case 'العراق': return '🇮🇶';
    case 'الإمارات': return '🇦🇪';
    case 'الكويت': return '🇰🇼';
    case 'قطر': return '🇶🇦';
    case 'البحرين': return '🇧🇭';
    case 'عمان': return '🇴🇲';
    case 'فلسطين': return '🇵🇸';
    case 'لبنان': return '🇱🇧';
    case 'اليمن': return '🇾🇪';
    case 'ليبيا': return '🇱🇾';
    case 'تونس': return '🇹🇳';
    case 'الجزائر': return '🇩🇿';
    case 'المغرب': return '🇲🇦';
    case 'موريتانيا': return '🇲🇷';
    default: return '🌐';
  }
};

const COUNTRIES_LIST = [
  "عدم إظهار", "الأردن", "سوريا", "مصر", "السعودية", "العراق", "الإمارات", "الكويت", 
  "قطر", "البحرين", "عمان", "فلسطين", "لبنان", "اليمن", "السودان", "ليبيا", 
  "تونس", "الجزائر", "المغرب", "موريتانيا"
];

const EMOJIS_LIST = `😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🫡 🤭 🤫 🤥 😶 🫠 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🤑 🤠 😈 👿 👹 👺 🤡 💩 👻 💀 ☠️ 👽 👾 🤖 🎃 😺 😸 😹 😻 😼 😽 🙀 😿 😾 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 💫 💥 💦 💨 🕳️ 💯 💢 💬 🗨️ 🗯️ 💭 💤 👋 🤚 🖐️ ✋ 🖖 👌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ ✍️ 👏 🙌 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦿 🦵 🦶 👂 👃 🧠 🫀 🫁 🦷 🦴 👀 👁️ 👅 👄 💋 🫦 👶 🧒 👦 👧 🧑 👱 👨 🧔 👨‍🦰 👨‍🦱 👨‍🦳 👨‍🦲 👩 👩‍🦰 👩‍🦱 👩‍🦳 👩‍🦲 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 👷 💂 🕵️ 👩‍⚕️ 👨‍⚕️ 👩‍🎓 👨‍🎓 👩‍🏫 👨‍🏫 👩‍💻 👨‍💻 👩‍🍳 👨‍🍳 👩‍🚀 👨‍🚀 👩‍🚒 👨‍🚒 🧙 🧚 🧛 🧜 🧝 🧞 🧟 💃 🕺 🕴️ 👯 🚶 🏃 🧘 🛀 🛌 ❤️‍🔥 ❤️‍🩹 🩷 🩵 🩶 🫶 🫂 🤍‍🔥 ⭐ 🌟 ✨ ⚡ 🔥 🎉 🎊 🎁 🎈 💎 👑 🏆 🥇 🥈 🥉 ⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🪀 🪁 🎮 🎯 🎲 🎸 🎹 🎺 🎻 📱 💻 🖥️ ⌨️ 🖱️ 📷 📸 🎥 📺 ☎️ 📞 💡 🔔 🔕 📌 📍 ✏️ 📝 📚 📖 🔑 🔒 🔓 ⚙️ 🛠️ 🔧 🔨 🧰 💰 💵 💳 📦 🚗 🚕 🚌 🚓 🚑 ✈️ 🚀 🚲 🏠 🏡 🏢 🌍 🌎 🌏 ☀️ 🌙 ⭐ 🌈 ☁️ ❄️ ☔ 🌧️ 🌊 🌴 🌹 🌷 🌺 🌸 🌼 🌻 🍎 🍓 🍉 🍌 🍇 🍒 🍑 🍍 🥝 🍕 🍔 🍟 🌭 🌮 🍿 🍩 🍪 ☕ 🥤 🍺 🍰 🎂 🍫 🍭 🧃`.split(' ').filter(Boolean);

const getNameStyleProps = (style: string, color: string) => {
  switch (style) {
    case 'glowing':
      return {
        color: color || '#2563eb',
        textShadow: `0 0 8px ${color || '#2563eb'}, 0 0 14px ${color || '#2563eb'}`
      };
    case 'icy':
      return {
        background: 'linear-gradient(135deg, #38bdf8, #e0f2fe)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 3px rgba(56, 189, 248, 0.9))'
      };
    case 'fire':
      return {
        background: 'linear-gradient(135deg, #ef4444, #f97316)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.9))'
      };
    case 'gold':
      return {
        background: 'linear-gradient(135deg, #eab308, #fef08a)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 3px rgba(234, 179, 8, 0.9))'
      };
    default:
      return {
        color: color || '#0284c7'
      };
  }
};


const VideoIcon = ({ type, size = 20, stroke = 2.2 }: { type: string; size?: number; stroke?: number }) => {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (type === 'menu') return <svg {...common}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
  if (type === 'diamond') return <svg {...common}><path d="M3 9l4-5h10l4 5-9 11L3 9z"/><path d="M3 9h18M7 4l5 5 5-5M8 9l4 11 4-11"/></svg>;
  if (type === 'crown') return <svg {...common}><path d="M3 7l4 4 5-7 5 7 4-4-2 11H5L3 7z"/><path d="M5 18h14"/></svg>;
  if (type === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></svg>;
  if (type === 'request') return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M3 19c.5-3.2 2.5-5 6-5s5.5 1.8 6 5M17 7v6M14 10h6"/></svg>;
  if (type === 'bell') return <svg {...common}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>;
  if (type === 'settings') return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6v-2.6h.5A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2H15v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1z"/></svg>;
  if (type === 'home') return <svg {...common}><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></svg>;
  if (type === 'users') return <svg {...common}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M14 15c3-.3 5 1.2 6 4"/></svg>;
  if (type === 'userplus') return <svg {...common}><circle cx="8" cy="8" r="3"/><path d="M2.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M18 7v6M15 10h6"/></svg>;
  return null;
};

const VIDEO_LOGIN_BANNER = 'data:image/jpeg;base64,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';

const VIDEO_PROFILE_AVATAR = 'data:image/jpeg;base64,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';

export default function App() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'menu' | 'register' | 'login' | 'guest' | 'forgot'>('menu');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('الأردن');
  const [guestName, setGuestName] = useState(() => localStorage.getItem('gat_guest_name') || '');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [currentView, setCurrentView] = useState<'rooms' | 'chat'>(() => {
    return localStorage.getItem('gat_current_room_id') ? 'chat' : 'rooms';
  });
  
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string; flag?: string } | null>(() => {
    const savedId = localStorage.getItem('gat_current_room_id');
    const savedName = localStorage.getItem('gat_current_room_name');
    const savedFlag = localStorage.getItem('gat_current_room_flag');
    if (savedId && savedName) {
      return { id: savedId, name: savedName, flag: savedFlag || '💬' };
    }
    return null;
  });

  const [rooms, setRooms] = useState<Array<{ id: string; name: string; flag: string }>>([]);
  const [roomCounts, setRoomCounts] = useState<{ [roomId: string]: number }>({});
  const roomsCursorRef = useRef<any>(null);
  const [hasMoreRooms, setHasMoreRooms] = useState(false);
  const [loadingMoreRooms, setLoadingMoreRooms] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([]);
  const roomOlderMessagesRef = useRef<Record<string, any[]>>({});
  const roomFirstDocRef = useRef<Record<string, any>>({});
  const [hasMoreRoomMessages, setHasMoreRoomMessages] = useState(false);
  const [loadingMoreRoomMessages, setLoadingMoreRoomMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [onlineUsersList, setOnlineUsersList] = useState<Array<any>>([]);
  
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [profileTab, setProfileTab] = useState<'complete'|'info'|'ignore'|'options'|'more'>('info');
  const [showGiftRankPanel, setShowGiftRankPanel] = useState(false);
  const [giftRankTab, setGiftRankTab] = useState<'leaders'|'gifts'|'ranks'>('leaders');
  const [showTopSearch, setShowTopSearch] = useState(false);
  const [showWallModal, setShowWallModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [wallPosts, setWallPosts] = useState<any[]>([]);
  const [wallInput, setWallInput] = useState('');
  const [wallCommentInputs, setWallCommentInputs] = useState<Record<string,string>>({});
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [newsInput, setNewsInput] = useState('');
  const [newsCommentInputs, setNewsCommentInputs] = useState<Record<string,string>>({});
  const [newsImage, setNewsImage] = useState('');
  const [rankedUsers, setRankedUsers] = useState<any[]>([]);
  const [pendingChatImage, setPendingChatImage] = useState<string | null>(null);
  const [pendingChatImageName, setPendingChatImageName] = useState('image.jpg');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const chatImageInputRef = useRef<HTMLInputElement | null>(null);

  const [activePrivateChat, setActivePrivateChat] = useState<{ peerId: string; peerName: string } | null>(null);
  const [privateMessages, setPrivateMessages] = useState<Array<any>>([]);
  const privateOlderMessagesRef = useRef<Record<string, any[]>>({});
  const privateFirstDocRef = useRef<Record<string, any>>({});
  const [hasMorePrivateMessages, setHasMorePrivateMessages] = useState(false);
  const [loadingMorePrivateMessages, setLoadingMorePrivateMessages] = useState(false);
  const [hasMorePrivateConversations, setHasMorePrivateConversations] = useState(false);
  const [loadingMorePrivateConversations, setLoadingMorePrivateConversations] = useState(false);
  const privateConversationsCursorRef = useRef<any>(null);
  const [privateInputText, setPrivateInputText] = useState('');
  const [privateConversations, setPrivateConversations] = useState<Array<any>>([]);

  const [pendingRequests, setPendingRequests] = useState<Array<any>>([]);
  const [notificationsList, setNotificationsList] = useState<Array<any>>([]);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const [loadingMoreNotifications, setLoadingMoreNotifications] = useState(false);
  const notificationsCursorRef = useRef<any>(null);
  const [friendsList, setFriendsList] = useState<Array<any>>([]);
  const [hasMoreFriends, setHasMoreFriends] = useState(false);
  const [loadingMoreFriends, setLoadingMoreFriends] = useState(false);
  const friendsCursorRef = useRef<any>(null);
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'info' | 'friends' | 'ignore' | 'options' | 'more'>('info');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const [selectedProfileUser, setSelectedProfileUser] = useState<any | null>(null);
  const [editingUserName, setEditingUserName] = useState('');
  const [isEditingNameActive, setIsEditingNameActive] = useState(false);

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomFlag, setNewRoomFlag] = useState('💬');

  const [profileGender, setProfileGender] = useState('ذكر');
  const [profileCountry, setProfileCountry] = useState('الأردن');
  const [profileBio, setProfileBio] = useState('');
  const [currentFlag, setCurrentFlag] = useState('🇯🇴');
  const [nameColor, setNameColor] = useState('#2563eb');
  const [nameStyle, setNameStyle] = useState('normal'); 
  const [profileBgColor, setProfileBgColor] = useState('#ffffff'); 
  const [currentUserRole, setCurrentUserRole] = useState<string>('Member');
  const [userJoinedDate, setUserJoinedDate] = useState<string>('');

  const [profileAvatar, setProfileAvatar] = useState<string>('');
  const [profileCover, setProfileCover] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [profileSong, setProfileSong] = useState<string>('');
  const [isSongPlaying, setIsSongPlaying] = useState(false);

  const [userKickedUntil, setUserKickedUntil] = useState<number | null>(null);
  const [kickTimeLeft, setKickTimeLeft] = useState<number>(0);

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isVideoMinimized, setIsVideoMinimized] = useState(false);
  const [videoPos, setVideoPos] = useState({ x: 20, y: 100 });
  const isDraggingVideo = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const songInputRef = useRef<HTMLInputElement | null>(null);
  const profileAudioRef = useRef<HTMLAudioElement | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const privateChatBottomRef = useRef<HTMLDivElement | null>(null);

  const normalizeRole = (role: any): string => {
    const value = String(role || '').trim().toLowerCase();
    if (value === 'owner') return 'Owner';
    if (value === 'admin') return 'Admin';
    if (value === 'super admin' || value === 'super_admin' || value === 'superadmin') return 'Super Admin';
    if (value === 'premium') return 'Premium';
    if (value === 'guest') return 'Guest';
    return 'Member';
  };

  const rolePermissions: Record<string, string[]> = {
    Owner: ['manage_roles', 'manage_admins', 'manage_rooms', 'manage_users', 'edit_avatar', 'edit_cover', 'add_song', 'custom_profile', 'kick'],
    Admin: ['manage_users', 'edit_avatar', 'edit_cover', 'add_song', 'custom_profile', 'kick'],
    'Super Admin': ['manage_users', 'edit_avatar', 'edit_cover', 'add_song', 'custom_profile', 'kick'],
    Premium: ['edit_avatar', 'edit_cover', 'add_song', 'custom_profile'],
    Member: ['edit_avatar'],
    Guest: []
  };

  const normalizedCurrentRole = normalizeRole(currentUserRole);
  const normalizedCurrentEmail = (user?.email || '').trim().toLowerCase();
  const isOwner = Boolean(
    user &&
    !user.isAnonymous &&
    (
      normalizedCurrentEmail === ADMIN_EMAIL.trim().toLowerCase() ||
      normalizedCurrentRole === 'Owner'
    )
  );

  const isAdmin = Boolean(
    user &&
    !user.isAnonymous &&
    (
      isOwner ||
      normalizedCurrentRole === 'Admin' ||
      normalizedCurrentRole === 'Super Admin'
    )
  );

  const isSuperAdmin = Boolean(
    user &&
    !user.isAnonymous &&
    normalizedCurrentRole === 'Super Admin'
  );

  const hasRankForCustomization = Boolean(
    user &&
    !user.isAnonymous &&
    (
      isOwner ||
      isAdmin ||
      normalizedCurrentRole === 'Premium' ||
      ['Owner', 'Admin', 'Super Admin', 'Premium'].includes(normalizedCurrentRole)
    )
  );

  const hasCurrentPermission = (permission: string) =>
    isOwner || (rolePermissions[normalizedCurrentRole] || []).includes(permission);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const storedGuestName = localStorage.getItem('gat_guest_name') || guestName;
        const actualName = currentUser.isAnonymous 
          ? (currentUser.displayName || storedGuestName || 'زائر') 
          : (currentUser.displayName || currentUser.email?.split('@')[0] || 'عضو');

        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        const todayDate = new Date().toISOString().split('T')[0];

        const ownerEmail = ADMIN_EMAIL.trim().toLowerCase();
        const cleanEmail = (currentUser.email || '').trim().toLowerCase();

        let activeRole = currentUser.isAnonymous ? 'Guest' : 'Member';

        if (cleanEmail === ownerEmail) {
          activeRole = 'Owner';
        } else if (!currentUser.isAnonymous && cleanEmail) {
          try {
            const roleDoc = await getDoc(doc(db, 'roles_by_email', cleanEmail));
            if (roleDoc.exists() && roleDoc.data().role) {
              activeRole = normalizeRole(roleDoc.data().role);
            } else if (userSnap.exists() && userSnap.data().role) {
              activeRole = normalizeRole(userSnap.data().role);
            }
          } catch (error) {
            console.error(error);
          }
        }

        if (cleanEmail === ownerEmail) {
          activeRole = 'Owner';
        }

        setCurrentUserRole(activeRole);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: currentUser.email || '',
            displayName: actualName,
            role: activeRole,
            previousRole: 'Member',
            permissions: rolePermissions[normalizeRole(activeRole)] || [],
            flag: getCountryFlag(selectedCountry),
            country: selectedCountry,
            gender: 'ذكر',
            age: 'عدم إظهار',
            bio: 'أهلاً بك في ملفي الشخصي.',
            nameColor: '#2563eb',
            nameStyle: 'normal',
            profileBgColor: '#ffffff',
            points: 0,
            avatarUrl: '',
            coverUrl: '',
            profileSongUrl: '',
            joinedDate: todayDate,
            createdAt: new Date().toISOString()
          }, { merge: true });
          setUserJoinedDate(todayDate);
        } else {
          const data = userSnap.data();
          if (data.joinedDate) {
            setUserJoinedDate(data.joinedDate);
          } else {
            await updateDoc(userRef, { joinedDate: todayDate });
            setUserJoinedDate(todayDate);
          }
        }
      }
    });
    return () => unsubscribeAuth();
  }, [guestName]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.kickedUntil && data.kickedUntil > Date.now()) {
          setUserKickedUntil(data.kickedUntil);
        } else {
          setUserKickedUntil(null);
        }
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!userKickedUntil) return;
    const interval = setInterval(() => {
      const diff = userKickedUntil - Date.now();
      if (diff <= 0) {
        setUserKickedUntil(null);
        updateDoc(doc(db, 'users', user!.uid), { kickedUntil: 0 }).catch(() => {});
        clearInterval(interval);
      } else {
        setKickTimeLeft(Math.ceil(diff / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [userKickedUntil]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const ownerEmail = ADMIN_EMAIL.trim().toLowerCase();
    const cleanEmail = (user.email || '').trim().toLowerCase();

    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();

      if (data.role && cleanEmail !== ownerEmail && !cleanEmail) {
        setCurrentUserRole(normalizeRole(data.role));
      }
      if (data.joinedDate) setUserJoinedDate(data.joinedDate);
      if (data.gender) setProfileGender(data.gender);
      if (data.country) {
        setProfileCountry(data.country);
        setCurrentFlag(getCountryFlag(data.country));
      }
      if (data.flag) setCurrentFlag(data.flag);
      if (data.bio) setProfileBio(data.bio);
      if (data.nameColor) setNameColor(data.nameColor);
      if (data.nameStyle) setNameStyle(data.nameStyle);
      if (data.profileBgColor) setProfileBgColor(data.profileBgColor);
      if (data.avatarUrl) setProfileAvatar(data.avatarUrl);
      if (data.coverUrl) setProfileCover(data.coverUrl);
      if (data.profileSongUrl !== undefined) setProfileSong(data.profileSongUrl || '');
    });

    let unsubscribeRole = () => {};

    if (!user.isAnonymous && user.email) {
      if (cleanEmail === ownerEmail) {
        setCurrentUserRole('Owner');
      }

      const roleRef = doc(db, 'roles_by_email', cleanEmail);
      unsubscribeRole = onSnapshot(
        roleRef,
        (roleSnap) => {
          if (cleanEmail === ownerEmail) {
            setCurrentUserRole('Owner');
            return;
          }

          if (roleSnap.exists() && roleSnap.data().role) {
            setCurrentUserRole(normalizeRole(roleSnap.data().role));
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }

    return () => {
      unsubscribeUser();
      unsubscribeRole();
    };
  }, [user]);

  const updateLastSeenOnExit = async () => {
    if (!user) return;
    try {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const presenceRef = doc(db, 'room_presence', user.uid);
      const userRef = doc(db, 'users', user.uid);
      
      await setDoc(presenceRef, { lastSeen: nowTime, lastActive: 0, roomId: 'lobby', roomName: 'القائمة الرئيسية' }, { merge: true });
      await setDoc(userRef, { lastSeen: nowTime }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) return;
    const handleBeforeUnload = () => {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const presenceRef = doc(db, 'room_presence', user.uid);
      const userRef = doc(db, 'users', user.uid);
      setDoc(presenceRef, { lastSeen: nowTime, lastActive: 0, roomId: 'lobby', roomName: 'القائمة الرئيسية' }, { merge: true }).catch(() => {});
      setDoc(userRef, { lastSeen: nowTime }, { merge: true }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'private_chats'), orderBy('lastMessageTime', 'desc'), limit(20));
    return onSnapshot(q, (snapshot) => {
      privateConversationsCursorRef.current = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null;
      setHasMorePrivateConversations(snapshot.docs.length === 20);
      setPrivateConversations(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as any) })));
    });
  }, [user]);

  const loadMorePrivateConversations = async () => {
    if (!user || !privateConversationsCursorRef.current || !hasMorePrivateConversations || loadingMorePrivateConversations) return;
    setLoadingMorePrivateConversations(true);
    try {
      const snap = await getDocs(query(collection(db, 'users', user.uid, 'private_chats'), orderBy('lastMessageTime', 'desc'), startAfter(privateConversationsCursorRef.current), limit(20)));
      privateConversationsCursorRef.current = snap.docs.length ? snap.docs[snap.docs.length - 1] : privateConversationsCursorRef.current;
      setPrivateConversations(prev => [...prev, ...snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))]);
      setHasMorePrivateConversations(snap.docs.length === 20);
    } finally { setLoadingMorePrivateConversations(false); }
  };

  useEffect(() => {
    if (!user || !activePrivateChat) return;
    const chatId = [user.uid, activePrivateChat.peerId].sort().join('_');
    const msgQuery = query(collection(db, 'private_messages', chatId, 'messages'), orderBy('createdAt', 'asc'), limitToLast(20));
    return onSnapshot(msgQuery, (snapshot) => {
      privateFirstDocRef.current[chatId] = snapshot.docs.length ? snapshot.docs[0] : null;
      setHasMorePrivateMessages(snapshot.docs.length === 20);
      const latest = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      const older = privateOlderMessagesRef.current[chatId] || [];
      const map = new Map<string, any>();
      older.forEach(m => map.set(m.id, m)); latest.forEach(m => map.set(m.id, m));
      setPrivateMessages(Array.from(map.values()).sort((a,b) => ((a.createdAt?.seconds||0)-(b.createdAt?.seconds||0))));
      setTimeout(() => privateChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  }, [user, activePrivateChat]);

  const loadMorePrivateMessages = async () => {
    if (!user || !activePrivateChat || !hasMorePrivateMessages || loadingMorePrivateMessages) return;
    const chatId = [user.uid, activePrivateChat.peerId].sort().join('_');
    const firstDoc = privateFirstDocRef.current[chatId];
    if (!firstDoc) return;
    setLoadingMorePrivateMessages(true);
    try {
      const snap = await getDocs(query(collection(db, 'private_messages', chatId, 'messages'), orderBy('createdAt', 'asc'), endBefore(firstDoc), limitToLast(20)));
      const older = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      privateOlderMessagesRef.current[chatId] = [...older, ...(privateOlderMessagesRef.current[chatId] || [])];
      privateFirstDocRef.current[chatId] = snap.docs.length ? snap.docs[0] : firstDoc;
      setPrivateMessages(prev => { const map=new Map<string,any>(); [...older,...prev].forEach(m=>map.set(m.id,m)); return Array.from(map.values()); });
      setHasMorePrivateMessages(snap.docs.length === 20);
    } finally { setLoadingMorePrivateMessages(false); }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'friend_requests'),
      where('toUid', '==', user.uid),
      where('status', '==', 'pending')
    );
    return onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      }));
      setPendingRequests(reqs);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(q, (snapshot) => {
      notificationsCursorRef.current = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null;
      setHasMoreNotifications(snapshot.docs.length === 20);
      setNotificationsList(snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
  }, [user]);

  const loadMoreNotifications = async () => {
    if (!user || !notificationsCursorRef.current || !hasMoreNotifications || loadingMoreNotifications) return;
    setLoadingMoreNotifications(true);
    try {
      const snap = await getDocs(query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'), startAfter(notificationsCursorRef.current), limit(20)));
      notificationsCursorRef.current = snap.docs.length ? snap.docs[snap.docs.length - 1] : notificationsCursorRef.current;
      setNotificationsList(prev => [...prev, ...snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))]);
      setHasMoreNotifications(snap.docs.length === 20);
    } finally { setLoadingMoreNotifications(false); }
  };

  const handleOpenNotifications = async () => {
    setShowNotificationsModal(true);
    if (!user || notificationsList.length === 0) return;
    try {
      const unreadNotes = notificationsList.filter(n => !n.isRead);
      for (const note of unreadNotes) {
        await updateDoc(doc(db, 'users', user.uid, 'notifications', note.id), { isRead: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'friends'), limit(20));
    return onSnapshot(q, (snapshot) => {
      friendsCursorRef.current = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null;
      setHasMoreFriends(snapshot.docs.length === 20);
      setFriendsList(snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    });
  }, [user]);

  const loadMoreFriends = async () => {
    if (!user || !friendsCursorRef.current || !hasMoreFriends || loadingMoreFriends) return;
    setLoadingMoreFriends(true);
    try {
      const snap = await getDocs(query(collection(db, 'users', user.uid, 'friends'), startAfter(friendsCursorRef.current), limit(20)));
      friendsCursorRef.current = snap.docs.length ? snap.docs[snap.docs.length - 1] : friendsCursorRef.current;
      setFriendsList(prev => [...prev, ...snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))]);
      setHasMoreFriends(snap.docs.length === 20);
    } finally { setLoadingMoreFriends(false); }
  };

  const saveSettingToFirebase = async (field: string, value: any) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData: any = { [field]: value };
      if (field === 'country') {
        const newFlag = getCountryFlag(value);
        setCurrentFlag(newFlag);
        updateData.flag = newFlag;
      }
      await updateDoc(userRef, updateData);

      const presenceRef = doc(db, 'room_presence', user.uid);
      await setDoc(presenceRef, updateData, { merge: true });
    } catch (e) {
      console.error(e);
    }
  };

  const compressAndUploadImage = (file: File, maxWidth: number, maxHeight: number, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        callback(compressedBase64);
      };
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const maxW = type === 'avatar' ? 350 : 800;
    const maxH = type === 'avatar' ? 350 : 400;

    compressAndUploadImage(file, maxW, maxH, async (base64) => {
      if (type === 'avatar') {
        setProfileAvatar(base64);
        setSelectedProfileUser((prev: any) => prev ? { ...prev, avatarUrl: base64 } : null);
        await saveSettingToFirebase('avatarUrl', base64);
      } else {
        setProfileCover(base64);
        setSelectedProfileUser((prev: any) => prev ? { ...prev, coverUrl: base64 } : null);
        await saveSettingToFirebase('coverUrl', base64);
      }
    });
  };

  const handleSongSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 3 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setProfileSong(base64);
      setSelectedProfileUser((prev: any) => prev ? { ...prev, profileSongUrl: base64 } : null);
      await saveSettingToFirebase('profileSongUrl', base64);
    };
    e.target.value = '';
  };

  const playProfileSong = (songUrl: string) => {
    if (profileAudioRef.current) {
      profileAudioRef.current.pause();
      profileAudioRef.current.currentTime = 0;
      profileAudioRef.current = null;
    }

    if (!songUrl) return;

    const audio = new Audio(songUrl);
    audio.loop = false;
    audio.volume = 0.7;
    audio.play()
      .then(() => setIsSongPlaying(true))
      .catch((err) => {
        console.warn(err);
        setIsSongPlaying(false);
      });
    audio.onended = () => setIsSongPlaying(false);
    profileAudioRef.current = audio;
  };

  const stopProfileSong = () => {
    if (profileAudioRef.current) {
      profileAudioRef.current.pause();
      profileAudioRef.current.currentTime = 0;
      profileAudioRef.current = null;
    }
    setIsSongPlaying(false);
  };

  const handleDeleteSong = async () => {
    if (!user) return;
    setProfileSong('');
    setSelectedProfileUser((prev: any) => prev ? { ...prev, profileSongUrl: '' } : null);
    await saveSettingToFirebase('profileSongUrl', '');
    stopProfileSong();
  };

  useEffect(() => {
    let unsub: any;
    let cancelled = false;

    const initRoomsAndListen = async () => {
      const roomsCol = collection(db, 'rooms');
      const snapshot = await getDocs(roomsCol);

      if (snapshot.empty) {
        const defaultRooms = [
          { name: 'غرفة الأردن', flag: '🇯🇴' },
          { name: 'غرفة العامة', flag: '🌐' },
          { name: 'غرفة مصر', flag: '🇪🇬' },
          { name: 'غرفة الجزائر', flag: '🇩🇿' },
          { name: 'غرفة سوريا', flag: '🟩⬜⬛ ⭐⭐⭐' },
          { name: 'غرفة السعودية', flag: '🇸🇦' },
          { name: 'غرفة العراق', flag: '🇮🇶' },
          { name: 'غرفة فلسطين', flag: '🇵🇸' },
          { name: 'الدردشة الحرة', flag: '💬' }
        ];
        for (const r of defaultRooms) await addDoc(roomsCol, r);
      }

      const firstPage = await getDocs(query(roomsCol, limit(20)));
      if (cancelled) return;
      roomsCursorRef.current = firstPage.docs.length ? firstPage.docs[firstPage.docs.length - 1] : null;
      setHasMoreRooms(firstPage.docs.length === 20);
      setRooms(firstPage.docs.map(d => ({ id: d.id, ...(d.data() as any) })));

      const savedId = localStorage.getItem('gat_current_room_id');
      if (savedId) {
        const foundInPage = firstPage.docs.find(d => d.id === savedId);
        if (foundInPage) {
          const found = { id: foundInPage.id, ...(foundInPage.data() as any) };
          setSelectedRoom(found);
          setCurrentView('chat');
        } else {
          // لا نحمّل كل الغرف فقط لاستعادة غرفة المستخدم؛ نجلب وثيقة الغرفة المطلوبة وحدها.
          try {
            const savedRoomSnap = await getDocs(query(collection(db, 'rooms'), where('__name__', '==', savedId), limit(1)));
            if (!cancelled && !savedRoomSnap.empty) {
              const found = { id: savedRoomSnap.docs[0].id, ...(savedRoomSnap.docs[0].data() as any) };
              setSelectedRoom(found);
              setCurrentView('chat');
            }
          } catch (e) { console.warn('تعذر استعادة الغرفة المحفوظة', e); }
        }
      }

      // نستمع فقط لأول 20 غرفة. الغرف الأقدم تُطلب عند الضغط على «المزيد».
      unsub = onSnapshot(query(roomsCol, limit(20)), (snap) => {
        const liveRooms = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setRooms(prev => {
          const loadedMore = prev.slice(20);
          const map = new Map<string, any>();
          liveRooms.forEach(r => map.set(r.id, r));
          loadedMore.forEach(r => { if (!map.has(r.id)) map.set(r.id, r); });
          return Array.from(map.values());
        });
        const saved = localStorage.getItem('gat_current_room_id');
        if (saved) {
          const found = liveRooms.find(r => r.id === saved);
          if (found) setSelectedRoom(found);
        }
      });
    };

    initRoomsAndListen().catch(e => console.error(e));
    return () => { cancelled = true; if (unsub) unsub(); };
  }, []);

  const loadMoreRooms = async () => {
    if (!roomsCursorRef.current || !hasMoreRooms || loadingMoreRooms) return;
    setLoadingMoreRooms(true);
    try {
      const snap = await getDocs(query(collection(db, 'rooms'), startAfter(roomsCursorRef.current), limit(20)));
      if (snap.docs.length) {
        roomsCursorRef.current = snap.docs[snap.docs.length - 1];
        const older = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setRooms(prev => {
          const map = new Map(prev.map((r:any) => [r.id, r]));
          older.forEach(r => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
      setHasMoreRooms(snap.docs.length === 20);
    } finally {
      setLoadingMoreRooms(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || !newRoomName.trim()) return;
    try {
      await addDoc(collection(db, 'rooms'), {
        name: newRoomName.trim(),
        flag: newRoomFlag || '💬'
      });
      setNewRoomName('');
      setNewRoomFlag('💬');
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!isOwner) return;
    try {
      await deleteDoc(doc(db, 'rooms', roomId));
      if (selectedRoom?.id === roomId) {
        leaveRoomToLobby();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user) return;

    const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
    const userName = user.isAnonymous
      ? (user.displayName || storedGuest || 'زائر')
      : (user.displayName || user.email?.split('@')[0] || 'عضو');
    const roomId = selectedRoom ? selectedRoom.id : 'lobby';
    const roomName = selectedRoom ? selectedRoom.name : 'القائمة الرئيسية';
    const todayDate = userJoinedDate || new Date().toISOString().split('T')[0];
    const presenceRef = ref(rdb, `presence/${user.uid}`);

    const currentRole = user.isAnonymous
      ? 'Guest'
      : (isOwner ? 'Owner' : normalizeRole(currentUserRole));

    const presenceData = () => ({
      userId: user.uid,
      userName,
      email: (user.email || '').trim().toLowerCase(),
      role: currentRole,
      flag: currentFlag || '🇯🇴',
      gender: profileGender || 'ذكر',
      country: profileCountry || 'الأردن',
      avatarUrl: profileAvatar || '',
      coverUrl: profileCover || '',
      profileSongUrl: profileSong || '',
      nameColor: nameColor || '#2563eb',
      nameStyle: nameStyle || 'normal',
      profileBgColor: profileBgColor || '#ffffff',
      joinedDate: todayDate,
      roomId,
      roomName,
      online: true,
      lastActive: Date.now(),
      lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      points: 0
    });

    // Firebase نفسه يغيّر الحالة عند انقطاع الاتصال، حتى لو أُغلقت الصفحة فجأة.
    onDisconnect(presenceRef).update({
      online: false,
      lastActive: 0,
      lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }).catch(() => {});

    const publishPresence = () => set(presenceRef, presenceData()).catch(() => {});
    publishPresence();

    // تحديث خفيف فقط للتأكد من بقاء الحالة حية. الظهور نفسه لحظي عبر onValue.
    const interval = window.setInterval(publishPresence, 30000);

    const handleBeforeUnload = () => {
      update(presenceRef, {
        online: false,
        lastActive: 0,
        lastSeen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // عند تغيير الغرفة، effect التالي يكتب roomId الجديد فورًا.
    };
  }, [selectedRoom, user, currentFlag, profileGender, profileCountry, guestName, isAdmin, profileAvatar, profileCover, profileSong, currentUserRole, nameColor, nameStyle, profileBgColor, userJoinedDate]);

  // الحضور اللحظي للغرفة الحالية فقط.
  // مهم: نبقي بنية presence الحالية كما هي حتى لا نحتاج لتغيير Rules الموجودة الآن.
  // الاستعلام يطلب من Realtime Database فقط السجلات التي roomId فيها يساوي الغرفة الحالية،
  // بدل تحميل جميع المستخدمين المتصلين في جميع الغرف لكل مستخدم.
  useEffect(() => {
    const roomId = selectedRoom?.id || 'lobby';
    const currentRoomPresenceQuery = rtdbQuery(
      ref(rdb, 'presence'),
      rtdbOrderByChild('roomId'),
      rtdbEqualTo(roomId)
    );

    return onValue(currentRoomPresenceQuery, (snapshot) => {
      const raw = snapshot.val() || {};
      const now = Date.now();
      const users: any[] = [];

      Object.entries(raw).forEach(([uid, data]: [string, any]) => {
        if (!data || data.online !== true || !data.userId) return;
        // حماية إضافية للحالات القديمة التي لم يصلها onDisconnect.
        if (data.lastActive && now - Number(data.lastActive) > 2 * 60 * 1000) return;
        // حماية إضافية حتى لا تظهر حالة من غرفة أخرى بسبب بيانات قديمة.
        if ((data.roomId || 'lobby') !== roomId) return;

        users.push({
          id: uid,
          userId: uid,
          name: data.userName || 'زائر',
          email: data.email || '',
          role: data.role || 'Guest',
          flag: data.flag || '🇯🇴',
          country: data.country || 'الأردن',
          gender: data.gender || 'ذكر',
          avatarUrl: data.avatarUrl || '',
          coverUrl: data.coverUrl || '',
          profileSongUrl: data.profileSongUrl || '',
          nameColor: data.nameColor || '#2563eb',
          nameStyle: data.nameStyle || 'normal',
          profileBgColor: data.profileBgColor || '#ffffff',
          joinedDate: data.joinedDate || new Date().toISOString().split('T')[0],
          lastSeen: data.lastSeen || '',
          points: data.points || 0,
          roomId: data.roomId || 'lobby',
          roomName: data.roomName || 'القائمة الرئيسية',
          lastActive: data.lastActive || 0
        });
      });

      const rank = (u: any) => {
        const r = normalizeRole(u.role);
        if (String(u.email || '').trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() || r === 'Owner') return 1;
        if (r === 'Super Admin') return 2;
        if (r === 'Admin') return 3;
        if (r === 'Member' || r === 'Premium') return 4;
        return 5;
      };

      users.sort((a, b) => rank(a) - rank(b) || String(a.name).localeCompare(String(b.name)));
      setOnlineUsersList(users);
      setRoomCounts(prev => ({ ...prev, ...(roomId !== 'lobby' ? { [roomId]: users.length } : {}) }));
    });
  }, [selectedRoom?.id]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      const owner = list.find(u => String(u.email || '').trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() || normalizeRole(u.role) === 'Owner');
      const roleRank = (u:any) => {
        const r = normalizeRole(u.role);
        if (String(u.email || '').trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() || r === 'Owner') return 1;
        if (r === 'Super Admin') return 2;
        if (r === 'Admin') return 3;
        if (r === 'Member' || r === 'Premium') return 4;
        return 5;
      };
      const sorted = [...list].sort((a,b) => roleRank(a)-roleRank(b) || String(a.displayName || '').localeCompare(String(b.displayName || '')));
      if (owner && !sorted.some(u => u.id === owner.id)) sorted.unshift(owner);
      setRankedUsers(sorted);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!showWallModal || !user) return;
    const wallRef = collection(db, 'users', user.uid, 'wall_posts');
    const q = query(wallRef, orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(q, snap => setWallPosts(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
  }, [showWallModal, user]);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(20));
    return onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      items.sort((a,b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || ((b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setNewsItems(items);
    });
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    const msgQuery = query(collection(db, 'rooms', selectedRoom.id, 'messages'), orderBy('createdAt', 'asc'), limitToLast(20));
    return onSnapshot(msgQuery, (snapshot) => {
      const now = Date.now();
      const FIVE_MINUTES_MS = 5 * 60 * 1000;

      const msgs = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let isExpired = false;

        if (data.isSystemSpecial && data.createdAt) {
          const msgTime = data.createdAt.toMillis ? data.createdAt.toMillis() : Date.now();
          if (now - msgTime > FIVE_MINUTES_MS) {
            isExpired = true;
          }
        }

        return {
          id: docSnap.id,
          isExpired,
          ...data
        };
      }).filter(m => !m.isExpired);

      setMessages(msgs);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  }, [selectedRoom]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        setErrorMessage('⚠️ حسابك غير مؤكد! يرجى التحقق من بريدك الإلكتروني.');
        await signOut(auth);
      } else {
        setCurrentView('rooms');
      }
    } catch (error: any) {
      setErrorMessage(`❌ خطأ: ${error.message}`);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: displayName });
      await sendEmailVerification(userCredential.user);
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email: email,
        displayName: displayName,
        country: selectedCountry,
        flag: getCountryFlag(selectedCountry),
        joinedDate: new Date().toISOString().split('T')[0]
      }, { merge: true });

      setSuccessMessage('✅ تم إنشاء الحساب بنجاح! تفقد بريدك الإلكتروني للتفعيل.');
      await signOut(auth);
      setAuthMode('menu');
    } catch (error: any) {
      setErrorMessage(`❌ خطأ: ${error.message}`);
    }
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGuestName = guestName.trim();
    if (!cleanGuestName) return;

    try {
      localStorage.setItem('gat_guest_name', cleanGuestName);
      const userCredential = await signInAnonymously(auth);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: cleanGuestName });
      }
      setCurrentView('rooms');
    } catch (error: any) {
      setErrorMessage(`❌ خطأ: ${error.message}`);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!email.trim()) {
      setErrorMessage('⚠️ يرجى إدخال البريد الإلكتروني الخاص بك أولاً.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage('✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!');
    } catch (error: any) {
      setErrorMessage(`❌ خطأ: ${error.message}`);
    }
  };

  const enterRoom = async (room: { id: string; name: string; flag?: string }) => {
    setShowRoomsModal(false);
    setSelectedRoom(room);
    setCurrentView('chat');
    localStorage.setItem('gat_current_room_id', room.id);
    localStorage.setItem('gat_current_room_name', room.name);
    localStorage.setItem('gat_current_room_flag', room.flag || '💬');

    if (user) {
      const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
      const actualName = user.isAnonymous 
        ? (user.displayName || storedGuest || 'زائر') 
        : (user.displayName || user.email?.split('@')[0] || 'عضو');

      const currentRoleText = user.isAnonymous ? 'Guest' : (isOwner ? 'Owner' : normalizeRole(currentUserRole));

      try {
        await addDoc(collection(db, 'rooms', room.id, 'messages'), {
          user: 'نظام الشات',
          userId: 'system',
          text: `تم الانضمام ${actualName} (${currentRoleText})`,
          role: 'System',
          color: '#16a34a',
          isSystemSpecial: false,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const leaveRoomToLobby = async () => {
    await updateLastSeenOnExit();
    setSelectedRoom(null);
    setCurrentView('rooms');
    localStorage.removeItem('gat_current_room_id');
    localStorage.removeItem('gat_current_room_name');
    localStorage.removeItem('gat_current_room_flag');
  };

  const extractYouTubeEmbedUrl = (text: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = text.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };


  const getSenderInfo = () => {
    const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
    const senderName = user?.isAnonymous ? (user.displayName || storedGuest || 'زائر') : (user?.displayName || user?.email?.split('@')[0] || 'عضو');
    const roleText = user?.isAnonymous ? 'Guest' : (isOwner ? 'Owner' : normalizeRole(currentUserRole));
    return { senderName, roleText };
  };

  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    compressAndUploadImage(file, 900, 900, (base64) => {
      setPendingChatImage(base64);
      setPendingChatImageName(file.name || 'image.jpg');
    });
    e.target.value = '';
  };

  const sendChatMedia = async (mediaType: 'image'|'voice', mediaData: string, mediaName = 'media') => {
    if (!selectedRoom || !user) return;
    const { senderName, roleText } = getSenderInfo();
    try {
      await addDoc(collection(db, 'rooms', selectedRoom.id, 'messages'), {
        user: senderName, userId: user.uid, text: '', role: roleText,
        color: nameColor, nameStyle, profileBgColor: hasRankForCustomization ? profileBgColor : '', avatarUrl: profileAvatar || '',
        mediaType, mediaData, mediaName, isSystemSpecial: false, createdAt: serverTimestamp()
      });
      setPendingChatImage(null); setRecordingData(null); setRecordingSeconds(0);
    } catch (e) { console.error(e); }
  };

  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceChunksRef.current = [];
      recorder.ondataavailable = (ev) => { if (ev.data.size) voiceChunksRef.current.push(ev.data); };
      recorder.onstop = () => {
        const blob = new Blob(voiceChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => setRecordingData(reader.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true); setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => setRecordingSeconds(v => v + 1), 1000);
    } catch (e) { console.error(e); }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
    if (recordingTimerRef.current) { window.clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    voiceChunksRef.current = [];
    setIsRecording(false); setRecordingData(null); setRecordingSeconds(0);
    if (recordingTimerRef.current) { window.clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
  };

  const addWallPost = async () => {
    if (!user || !wallInput.trim()) return;
    const { senderName } = getSenderInfo();
    await addDoc(collection(db, 'users', user.uid, 'wall_posts'), { userId: user.uid, userName: senderName, text: wallInput.trim(), likes: [], comments: [], createdAt: serverTimestamp() });
    setWallInput('');
  };
  const toggleWallLike = async (post:any) => {
    if (!user) return;
    const likes = Array.isArray(post.likes) ? post.likes : [];
    const next = likes.includes(user.uid) ? likes.filter((x:string)=>x!==user.uid) : [...likes, user.uid];
    await updateDoc(doc(db, 'users', user.uid, 'wall_posts', post.id), { likes: next });
  };
  const addWallComment = async (post:any) => {
    if (!user) return;
    const text = (wallCommentInputs[post.id] || '').trim(); if (!text) return;
    const { senderName } = getSenderInfo();
    const comments = Array.isArray(post.comments) ? post.comments : [];
    await updateDoc(doc(db, 'users', user.uid, 'wall_posts', post.id), { comments: [...comments, { uid:user.uid, name:senderName, text, createdAt:new Date().toISOString() }] });
    setWallCommentInputs(v => ({...v, [post.id]: ''}));
  };
  const deleteWallPost = async (postId:string) => { if (isOwner || (user && wallPosts.find(p=>p.id===postId)?.userId===user.uid)) await deleteDoc(doc(db, 'users', user!.uid, 'wall_posts', postId)); };

  const addNewsPost = async () => {
    if (!user || (!isOwner && !isSuperAdmin) || !newsInput.trim()) return;
    const { senderName } = getSenderInfo();
    await addDoc(collection(db,'news'), {
      text:newsInput.trim(), image:newsImage, authorId:user.uid, authorName:senderName,
      authorRole:isOwner?'Owner':normalizeRole(currentUserRole), authorAvatar:profileAvatar || '',
      authorNameColor:nameColor || '#2563eb', likes:[], comments:[], pinned:false, createdAt:serverTimestamp()
    });
    setNewsInput(''); setNewsImage('');
  };
  const deleteNewsPost = async (id:string) => { if (isOwner) await deleteDoc(doc(db,'news',id)); };
  const toggleNewsPin = async (item:any) => { if (isOwner) await updateDoc(doc(db,'news',item.id), { pinned: !item.pinned }); };
  const canInteractWithNews = (item:any) => {
    if (!user) return false;
    if (item.authorId === user.uid) return true;
    return friendsList.some((f:any) => (f.id || f.userId || f.uid) === item.authorId);
  };
  const toggleNewsLike = async (item:any) => {
    if (!canInteractWithNews(item)) return;
    const likes = Array.isArray(item.likes) ? item.likes : [];
    const next = likes.includes(user!.uid) ? likes.filter((x:string)=>x!==user!.uid) : [...likes, user!.uid];
    await updateDoc(doc(db,'news',item.id), {likes:next});
  };
  const addNewsComment = async (item:any) => {
    if (!canInteractWithNews(item) || !newsCommentInputs[item.id]?.trim()) return;
    const comments = Array.isArray(item.comments) ? item.comments : [];
    const {senderName} = getSenderInfo();
    await updateDoc(doc(db,'news',item.id), {comments:[...comments,{uid:user!.uid,name:senderName,text:newsCommentInputs[item.id].trim(),createdAt:new Date().toISOString()}]});
    setNewsCommentInputs(v=>({...v,[item.id]:''}));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoom || !user) return;
    const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
    const senderName = user.isAnonymous 
      ? (user.displayName || storedGuest || 'زائر') 
      : (user.displayName || user.email?.split('@')[0] || 'عضو');

    let roleText = user.isAnonymous ? 'Guest' : (isOwner ? 'Owner' : normalizeRole(currentUserRole));
    const textMsg = inputText.trim();

    try {
      await addDoc(collection(db, 'rooms', selectedRoom.id, 'messages'), {
        user: senderName,
        userId: user.uid,
        text: textMsg,
        role: roleText,
        color: nameColor,
        nameStyle: nameStyle,
        profileBgColor: hasRankForCustomization ? profileBgColor : '',
        avatarUrl: profileAvatar || '',
        isSystemSpecial: false,
        createdAt: serverTimestamp()
      });
      setInputText('');
      setShowEmojiPicker(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privateInputText.trim() || !activePrivateChat || !user) return;

    const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
    const senderName = user.isAnonymous 
      ? (user.displayName || storedGuest || 'زائر') 
      : (user.displayName || user.email?.split('@')[0] || 'عضو');

    const chatId = [user.uid, activePrivateChat.peerId].sort().join('_');
    const textMsg = privateInputText.trim();

    try {
      await addDoc(collection(db, 'private_messages', chatId, 'messages'), {
        senderId: user.uid,
        senderName: senderName,
        text: textMsg,
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, 'users', user.uid, 'private_chats', activePrivateChat.peerId), {
        peerId: activePrivateChat.peerId,
        peerName: activePrivateChat.peerName,
        lastMessage: textMsg,
        lastMessageTime: serverTimestamp(),
        unreadCount: 0
      }, { merge: true });

      const receiverPeerRef = doc(db, 'users', activePrivateChat.peerId, 'private_chats', user.uid);
      const receiverPeerSnap = await getDoc(receiverPeerRef);
      let currentUnread = 0;
      if (receiverPeerSnap.exists()) {
        currentUnread = receiverPeerSnap.data().unreadCount || 0;
      }

      await setDoc(receiverPeerRef, {
        peerId: user.uid,
        peerName: senderName,
        lastMessage: textMsg,
        lastMessageTime: serverTimestamp(),
        unreadCount: currentUnread + 1
      }, { merge: true });

      setPrivateInputText('');
    } catch (e) {
      console.error(e);
    }
  };

  const openPrivateChatWithUser = (peerId: string, peerName: string) => {
    if (!user) return;
    if (peerId === user.uid) return;
    stopProfileSong();
    setActivePrivateChat({ peerId, peerName });
    setSelectedProfileUser(null);
    setShowFriendsModal(false);
    setShowOnlineModal(false);
    setShowMessagesModal(false);

    const chatRef = doc(db, 'users', user.uid, 'private_chats', peerId);
    setDoc(chatRef, { unreadCount: 0 }, { merge: true });
  };

  const handleSendFriendRequest = async (targetUserId: string, targetUserName: string) => {
    if (!user) return;
    if (targetUserId === user.uid) return;
    const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
    const currentUserName = user.isAnonymous 
      ? (user.displayName || storedGuest || 'زائر') 
      : (user.displayName || user.email?.split('@')[0] || 'عضو');
    try {
      await addDoc(collection(db, 'friend_requests'), {
        fromUid: user.uid,
        fromName: currentUserName,
        toUid: targetUserId,
        toName: targetUserName,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, 'users', targetUserId, 'notifications'), {
        title: 'طلب صداقة جديد 👥',
        body: `أرسل لك ${currentUserName} طلب صداقة.`,
        isRead: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setSelectedProfileUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptRequest = async (request: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'friend_requests', request.id), { status: 'accepted' });

      const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
      const currentUserName = user.isAnonymous 
        ? (user.displayName || storedGuest || 'زائر') 
        : (user.displayName || user.email?.split('@')[0] || 'عضو');

      await setDoc(doc(db, 'users', user.uid, 'friends', request.fromUid), {
        friendUid: request.fromUid,
        name: request.fromName,
        addedAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'users', request.fromUid, 'friends', user.uid), {
        friendUid: user.uid,
        name: currentUserName,
        addedAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'users', request.fromUid, 'notifications'), {
        title: 'قبول طلب صداقة 🎉',
        body: `قام ${currentUserName} بقبول طلب الصداقة الخاص بك!`,
        isRead: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'friend_requests', requestId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveFriend = async (friendUid: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'friends', friendUid));
      await deleteDoc(doc(db, 'users', friendUid, 'friends', user.uid));
    } catch (e) {
      console.error(e);
    }
  };

  const handleKickUser = async (targetUid: string, minutes: number) => {
    if (!user || !isAdmin) return;
    const targetRole = normalizeRole(selectedProfileUser?.role);
    if (['owner', 'admin', 'super admin'].includes(targetRole.toLowerCase())) {
      return;
    }

    const kickUntilTime = Date.now() + minutes * 60 * 1000;
    try {
      await updateDoc(doc(db, 'users', targetUid), {
        kickedUntil: kickUntilTime
      });
      await setDoc(doc(db, 'room_presence', targetUid), {
        kickedUntil: kickUntilTime
      }, { merge: true });

      await addDoc(collection(db, 'users', targetUid, 'notifications'), {
        title: 'تنبيه طرد 🚫',
        body: `تم طردك مؤقتاً لمدة ${minutes} دقيقة بواسطة الإدارة.`,
        isRead: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setSelectedProfileUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUserRole = async (targetUid: string, newRole: string) => {
    if (!user || !isOwner || !targetUid || targetUid === user.uid) return;

    const normalizedNewRole = normalizeRole(newRole);

    try {
      const targetUserRef = doc(db, 'users', targetUid);
      const targetUserSnap = await getDoc(targetUserRef);
      const targetUserData = targetUserSnap.exists() ? targetUserSnap.data() : {};

      let targetEmail = String(
        targetUserData.email ||
        selectedProfileUser?.email ||
        ''
      ).trim().toLowerCase();

      if (!targetEmail) {
        try {
          const roleQuery = query(
            collection(db, 'roles_by_email'),
            where('uid', '==', targetUid)
          );
          const roleSnap = await getDocs(roleQuery);
          if (!roleSnap.empty) {
            targetEmail = String(roleSnap.docs[0].data().email || '').trim().toLowerCase();
          }
        } catch (e) {
          console.warn(e);
        }
      }

      if (!targetEmail) return;

      const targetUserName =
        targetUserData.displayName ||
        selectedProfileUser?.name ||
        'المستخدم';

      const oldRole = targetUserData.role || 'Member';
      let roleToSave = normalizedNewRole;

      if (normalizedNewRole === 'Member' || normalizedNewRole === 'Guest') {
        roleToSave = targetUserData.previousRole && !['Member', 'Guest'].includes(targetUserData.previousRole) 
          ? targetUserData.previousRole 
          : 'Member';
      }

      const permissions = rolePermissions[roleToSave] || [];

      await setDoc(
        doc(db, 'roles_by_email', targetEmail),
        {
          uid: targetUid,
          email: targetEmail,
          role: roleToSave,
          permissions,
          updatedAt: serverTimestamp(),
          updatedBy: user.email || user.uid
        },
        { merge: true }
      );

      await setDoc(
        targetUserRef,
        {
          email: targetEmail,
          role: roleToSave,
          previousRole: oldRole !== 'Member' && oldRole !== 'Guest' ? oldRole : 'Member',
          permissions,
          roleUpdatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      await setDoc(
        doc(db, 'room_presence', targetUid),
        {
          email: targetEmail,
          role: roleToSave,
          permissions
        },
        { merge: true }
      );

      try {
        await update(ref(rdb, `users/${targetUid}`), {
          role: roleToSave,
          permissions,
          email: targetEmail
        });
      } catch (rdbErr) {
        console.warn(rdbErr);
      }

      const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
      const currentAdminName = user.isAnonymous 
        ? (user.displayName || storedGuest || 'المدير') 
        : (user.displayName || user.email?.split('@')[0] || 'المدير');

      const isDemote = normalizedNewRole === 'Member' || normalizedNewRole === 'Guest';
      if (selectedRoom) {
        const roomMsg = isDemote
          ? `تم سحب الرتبة من ${targetUserName} بواسطة ${currentAdminName}`
          : `تم إهداء رتبة ${roleToSave} من ${currentAdminName} إلى ${targetUserName}`;

        await addDoc(collection(db, 'rooms', selectedRoom.id, 'messages'), {
          user: 'نظام الشات',
          userId: 'system',
          text: roomMsg,
          role: 'System',
          color: isDemote ? '#ef4444' : '#eab308',
          isSystemSpecial: true,
          createdAt: serverTimestamp()
        });
      }

      const notifTitle = isDemote ? 'تحديث الرتبة ⚠️' : 'هدايا الرتب 🎁';
      const notifBody = isDemote 
        ? `تم سحب الرتبة منك وتحديثها إلى ${roleToSave}.`
        : `مبروك! تم إهداؤك رتبة (${roleToSave}) وتفعيل صلاحيات الحساب.`;

      await addDoc(collection(db, 'users', targetUid, 'notifications'), {
        title: notifTitle,
        body: notifBody,
        isRead: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setSelectedProfileUser((prev: any) =>
        prev
          ? {
              ...prev,
              role: roleToSave,
              email: targetEmail,
              permissions
            }
          : null
      );
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleUpdateUserName = async () => {
    if (!selectedProfileUser || !editingUserName.trim()) return;
    const targetUid = selectedProfileUser.userId;
    const cleanNewName = editingUserName.trim();
    
    const targetEmail = String(selectedProfileUser.email || '').trim().toLowerCase();
    const ownerEmail = ADMIN_EMAIL.trim().toLowerCase();
    const isTargetOwner = targetEmail === ownerEmail || selectedProfileUser.role === 'Owner';
    const isCurrentOwner = user && (user.email || '').trim().toLowerCase() === ownerEmail;

    if (isTargetOwner && !isCurrentOwner) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', targetUid), {
        displayName: cleanNewName
      });

      await setDoc(doc(db, 'room_presence', targetUid), {
        userName: cleanNewName
      }, { merge: true });

      if (user && user.uid === targetUid && !user.isAnonymous) {
        await updateProfile(user, { displayName: cleanNewName });
      }

      setSelectedProfileUser((prev: any) => prev ? { ...prev, name: cleanNewName } : null);
      setIsEditingNameActive(false);
    } catch (e: any) {
      console.error(e);
    }
  };

  const openUserProfile = async (uData: any) => {
    const targetId = uData.userId || uData.uid || uData.id || 'guest_id';
    let userEmail = uData.email || '';

    let fetchedData = {
      userId: targetId,
      name: uData.name || uData.user || uData.userName || 'زائر',
      role: normalizeRole(uData.role || (targetId === user?.uid && user?.isAnonymous ? 'Guest' : 'Member')),
      gender: uData.gender || (targetId === user?.uid ? profileGender : 'ذكر'),
      age: uData.age || '',
      country: uData.country || (targetId === user?.uid ? profileCountry : ''),
      relationship: uData.relationship || 'عدم إظهار',
      bio: uData.bio || '',
      joinedDate: uData.joinedDate || userJoinedDate || new Date().toISOString().split('T')[0],
      roomName: uData.roomName || 'القائمة الرئيسية',
      lastSeen: uData.lastSeen || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      points: uData.points || 0,
      email: userEmail,
      avatarUrl: uData.avatarUrl || '',
      coverUrl: uData.coverUrl || '',
      profileSongUrl: uData.profileSongUrl || '',
      nameColor: uData.nameColor || '#2563eb',
      nameStyle: uData.nameStyle || 'normal',
      profileBgColor: uData.profileBgColor || '#ffffff'
    };

    if (targetId && targetId !== 'guest_id') {
      try {
        const userSnap = await getDoc(doc(db, 'users', targetId));
        if (userSnap.exists()) {
          const data = userSnap.data();
          fetchedData = {
            ...fetchedData,
            name: data.displayName || fetchedData.name,
            role: normalizeRole(data.role || fetchedData.role),
            gender: data.gender || fetchedData.gender,
            age: data.age || fetchedData.age,
            country: data.country || fetchedData.country,
            relationship: data.relationship || fetchedData.relationship,
            bio: data.bio || fetchedData.bio,
            joinedDate: data.joinedDate || fetchedData.joinedDate,
            points: data.points ?? fetchedData.points,
            email: data.email || fetchedData.email || '',
            avatarUrl: data.avatarUrl || fetchedData.avatarUrl,
            coverUrl: data.coverUrl || fetchedData.coverUrl,
            profileSongUrl: data.profileSongUrl || fetchedData.profileSongUrl || '',
            nameColor: data.nameColor || fetchedData.nameColor,
            nameStyle: data.nameStyle || fetchedData.nameStyle,
            profileBgColor: data.profileBgColor || fetchedData.profileBgColor
          };
        }

        if (!fetchedData.email) {
          try {
            const roleQuery = query(
              collection(db, 'roles_by_email'),
              where('uid', '==', targetId)
            );
            const roleSnap = await getDocs(roleQuery);
            if (!roleSnap.empty) {
              const roleData = roleSnap.docs[0].data();
              fetchedData.email = roleData.email || fetchedData.email;
            }
          } catch (e) {
            console.warn(e);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    setEditingUserName(fetchedData.name);
    setIsEditingNameActive(false);
    setSelectedProfileUser(fetchedData);
  };

  useEffect(() => {
    if (selectedProfileUser) {
      setEditingUserName(selectedProfileUser.name || '');
    }
  }, [selectedProfileUser]);

  useEffect(() => {
    if (selectedProfileUser && selectedProfileUser.profileSongUrl) {
      const timer = setTimeout(() => {
        playProfileSong(selectedProfileUser.profileSongUrl);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopProfileSong();
    }
  }, [selectedProfileUser]);

  useEffect(() => {
    return () => {
      stopProfileSong();
    };
  }, []);

  const filteredOnlineUsers = onlineUsersList.filter(u => (!selectedRoom || u.roomId === selectedRoom.id) && u.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a,b) => { const rank=(u:any)=>{const r=normalizeRole(u.role); if(r==='Owner'||String(u.email||'').toLowerCase()===ADMIN_EMAIL.toLowerCase()) return 1; if(r==='Super Admin') return 2; if(r==='Admin') return 3; if(r==='Member'||r==='Premium') return 4; return 5;}; return rank(a)-rank(b); });
  const filteredFriendsList = friendsList.filter(f => f.name.toLowerCase().includes(friendsSearchQuery.toLowerCase()));

  const totalUnreadMessages = privateConversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);
  const unreadNotificationsCount = notificationsList.filter(n => !n.isRead).length;

  const renderBadgeText = (text: string) => {
    const badgeRegex = /\(#\s*([^#]+)\s*#\)/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = badgeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <span 
          key={match.index} 
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '1px 5px',
            borderRadius: '4px',
            border: '1px solid #fca5a5',
            display: 'inline-block',
            margin: '0 4px'
          }}
        >
          {match[1]}
        </span>
      );
      lastIndex = badgeRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  const hasSavedRoomOrSession = Boolean(
    localStorage.getItem('gat_current_room_id') || 
    localStorage.getItem('gat_guest_name') || 
    auth.currentUser
  );

  if (loading && !hasSavedRoomOrSession) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', backgroundColor: '#0b141a', color: '#22c55e', fontSize: '18px', fontWeight: 'bold' }}>
        جاري تحميل الشات... 💬
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="video-auth-screen" dir="rtl">
        <div className="video-auth-banner" />
        <div className="video-auth-links"><span>شات تعارف عربي</span><span>شروط الاستخدام</span><span>|</span><span>سياسة الخصوصية</span></div>
        <div className="video-auth-title">شات تعارف عربي</div>
        <div className="video-auth-card">
          <button className="video-auth-close" type="button" onClick={()=>setAuthMode('menu')}>×</button>
          {errorMessage && <div className="video-auth-error">{errorMessage}</div>}
          {successMessage && <div className="video-auth-success">{successMessage}</div>}

          {authMode === 'menu' && <>
            <label>اسم المستخدم</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="" inputMode="email" />
            <label>كلمة المرور</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" />
            <button className="video-auth-login" onClick={e=>{e.preventDefault();handleLogin(e as any)}}>دخول <span>↪</span></button>
            <button className="video-auth-forgot" onClick={()=>{setAuthMode('forgot');setErrorMessage('');setSuccessMessage('')}}>نسيت كلمة المرور ؟</button>
            <button className="video-auth-register" onClick={()=>{setAuthMode('register');setErrorMessage('');setSuccessMessage('')}}>إنشاء حساب <span>👤＋</span></button>
            <button className="video-auth-guest" onClick={()=>setAuthMode('guest')}>دخول كزائر</button>
          </>}

          {authMode === 'login' && <form onSubmit={handleLogin} className="video-auth-form">
            <label>اسم المستخدم / البريد الإلكتروني</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <label>كلمة المرور</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <button className="video-auth-login" type="submit">دخول <span>↪</span></button>
            <button className="video-auth-forgot" type="button" onClick={()=>setAuthMode('forgot')}>نسيت كلمة المرور ؟</button>
            <button className="video-auth-back" type="button" onClick={()=>setAuthMode('menu')}>رجوع</button>
          </form>}

          {authMode === 'register' && <form onSubmit={handleRegister} className="video-auth-form">
            <label>اسم المستخدم</label><input value={displayName} onChange={e=>setDisplayName(e.target.value)} required />
            <label>البريد الإلكتروني</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <label>كلمة المرور</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <div className="video-auth-grid">
              <div><label>الجنس</label><select value={profileGender} onChange={e=>setProfileGender(e.target.value)}><option>ذكر</option><option>أنثى</option><option>آخر</option></select></div>
              <div><label>الدولة</label><select value={selectedCountry} onChange={e=>setSelectedCountry(e.target.value)}>{COUNTRIES_LIST.filter(c=>c!=='عدم إظهار').map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
            <div className="video-auth-grid">
              <div><label>العمر</label><select defaultValue="26">{Array.from({length:63},(_,i)=>18+i).map(a=><option key={a}>{a}</option>)}</select></div>
              <div><label>العلاقة</label><select defaultValue="عدم إظهار"><option>عدم إظهار</option><option>أعزب</option><option>مرتبط</option></select></div>
            </div>
            <div className="video-captcha">☑ أنا لست برنامج روبوت <span>Cloudflare</span></div>
            <button className="video-auth-register" type="submit">إنشاء حساب <span>👤＋</span></button>
            <button className="video-auth-back" type="button" onClick={()=>setAuthMode('menu')}>رجوع</button>
          </form>}

          {authMode === 'guest' && <form onSubmit={handleGuestLogin} className="video-auth-form">
            <label>اسم الزائر</label><input value={guestName} onChange={e=>setGuestName(e.target.value)} required />
            <button className="video-auth-login" type="submit">دخول كزائر <span>↪</span></button>
            <button className="video-auth-back" type="button" onClick={()=>setAuthMode('menu')}>رجوع</button>
          </form>}

          {authMode === 'forgot' && <form onSubmit={handleForgotPassword} className="video-auth-form">
            <label>البريد الإلكتروني</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <button className="video-auth-login" type="submit">إرسال رابط الاستعادة</button>
            <button className="video-auth-back" type="button" onClick={()=>setAuthMode('menu')}>رجوع</button>
          </form>}
        </div>
        <div className="video-auth-ad">دردشة عربية | شات عربي | تعارف<br/>بدون تسجيل أو اشتراك مجاناً</div>
        <div className="video-auth-faq"><b>الأسئلة الشائعة: لماذا شات عربي</b><p>دردشة عربية للتعارف والتواصل وبناء العلاقات والصداقات.</p></div>
      </div>
    );
  }

  if (userKickedUntil && userKickedUntil > Date.now()) {
    const minutes = Math.floor(kickTimeLeft / 60);
    const seconds = kickTimeLeft % 60;
    return (
      <div style={{ height: '100dvh', width: '100vw', backgroundColor: '#0b141a', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center', direction: 'rtl' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🚫</div>
        <h2 style={{ color: '#ef4444', marginBottom: '10px', fontSize: '16px' }}>أنت مطرود من الشات مؤقتاً</h2>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>تم طردك من قبل إدارة الموقع. ستتمكن من العودة فور انتهاء الوقت أدناه.</p>
        <div style={{ backgroundColor: '#1e293b', padding: '16px 28px', borderRadius: '12px', border: '1px solid #334155', fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>
          ستعود بعد: {minutes} دقيقة و {seconds} ثانية
        </div>
      </div>
    );
  }

  const isSelfProfile = Boolean(user && selectedProfileUser && user.uid === selectedProfileUser.userId);

  const canEditAvatar = Boolean(
    isSelfProfile &&
    !user?.isAnonymous &&
    hasCurrentPermission('edit_avatar')
  );

  const canEditCover = Boolean(
    isSelfProfile &&
    !user?.isAnonymous &&
    hasCurrentPermission('edit_cover')
  );

  const canAddSong = Boolean(
    isSelfProfile &&
    !user?.isAnonymous &&
    hasRankForCustomization
  );

  const targetUserEmail = String(selectedProfileUser?.email || '').trim().toLowerCase();
  const ownerEmailClean = ADMIN_EMAIL.trim().toLowerCase();
  const isTargetProfileOwner = targetUserEmail === ownerEmailClean || selectedProfileUser?.role === 'Owner';
  const isViewerOwner = user && (user.email || '').trim().toLowerCase() === ownerEmailClean;
  const canModifyTargetName = isSuperAdmin && (!isTargetProfileOwner || isViewerOwner);

  return (
    <div className="video-theme" style={{ height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#003d43', overflow: 'hidden', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, boxSizing: 'border-box' }}>
      <style>{`
        .video-theme, .video-theme * { font-family: Arial, Tahoma, sans-serif; }
        .video-theme { background:#003d43 !important; }
        .video-topbar { background:#003d43 !important; border-bottom:0 !important; box-shadow:none !important; padding:0 14px !important; }
        .video-topbar .brand-logo { font-size:20px !important; font-weight:800 !important; letter-spacing:-1px; color:#16a6d4 !important; }
        .video-chat-scroll { background:#fff !important; font-family: Tahoma, Arial, sans-serif !important; }
        .video-chat-scroll > div { min-height:44px !important; padding:3px 7px !important; gap:7px !important; border-bottom:1px solid #e5e5e5 !important; }
        .video-chat-scroll > div:nth-child(even) { background:#efefef !important; }
        .video-chat-scroll > div:nth-child(odd) { background:#fff !important; }
        .video-chat-scroll img { border-radius:50%; }
        .video-chat-scroll > div > div:first-child { width:34px !important; height:34px !important; border-width:1px !important; font-size:14px !important; }
        .video-chat-scroll > div > div:nth-child(2) { font-size:12px !important; line-height:1.25 !important; justify-content:flex-start !important; gap:4px !important; }
        .video-chat-scroll > div > div:nth-child(2) span { font-size:inherit !important; }
        .video-composer { min-height:64px !important; border-top:1px solid #d8d8d8 !important; padding:6px 8px !important; gap:6px !important; }
        .video-composer input { font-size:12px !important; color:#333 !important; }
        .video-composer input::placeholder { color:#888 !important; }
        .video-composer > div { height:44px !important; border-radius:23px !important; background:#f5f5f5 !important; border:1px solid #ddd !important; }
        .video-composer > button[type=submit] { width:46px !important; height:46px !important; background:#003d43 !important; font-size:20px !important; }
        .video-bottom-nav { background:#003d43 !important; border-top:0 !important; box-shadow:none !important; height:48px !important; min-height:48px !important; padding:0 4px !important; }
        .video-bottom-nav > div { background:transparent !important; border:0 !important; border-radius:0 !important; color:#fff !important; min-width:0 !important; flex:1 !important; padding:3px 2px !important; }
        .video-bottom-nav > div div:first-child { font-size:18px !important; color:#fff !important; }
        .video-bottom-nav > div div:last-child { font-size:9px !important; font-weight:500 !important; color:#fff !important; }
        .video-rooms-overlay { background:rgba(0,0,0,.42) !important; }
        .video-rooms-panel { width:100% !important; max-width:100% !important; background:#fff !important; box-shadow:-12px 0 30px rgba(0,0,0,.28) !important; }
        .video-rooms-panel > div:first-child { background:#003d43 !important; padding:14px 16px !important; }
        .video-rooms-panel > div:first-child div { font-size:17px !important; }
        .video-rooms-panel > div:nth-child(2) { padding:12px 12px 18px !important; gap:10px !important; }
        .video-rooms-panel form { border-radius:14px !important; border:1px solid #ddd !important; background:#fff !important; box-shadow:none !important; }
        .video-rooms-panel form input { font-size:12px !important; }
        .video-rooms-panel form button { border-radius:10px !important; }
        .video-rooms-panel > div:nth-child(2) > div:not(form) { border-radius:14px !important; min-height:68px !important; padding:10px !important; box-shadow:0 2px 8px rgba(0,0,0,.08) !important; }
        .video-profile-backdrop > div { border-radius:18px !important; max-width:390px !important; }
        .video-drawer-overlay button, .video-topbar button, .video-bottom-nav div { -webkit-tap-highlight-color:transparent; }
        .video-composer button { min-width: 28px !important; } .video-composer { min-height: 38px !important; } .animated-emoji { animation: emojiPulse 1.2s ease-in-out infinite; } @keyframes emojiPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.28) rotate(5deg)} }

        /* ===== VIDEO REFERENCE UI ===== */
        .vr-top{height:80px;min-height:80px;background:#003840;color:#fff;display:flex;align-items:flex-end;justify-content:space-between;padding:0 16px 8px;box-sizing:border-box;direction:rtl}
        .vr-top-group{display:flex;align-items:flex-end;gap:18px}.vr-top-btn{position:relative;color:#fff;background:none;border:0;padding:0;cursor:pointer;text-align:center;min-width:45px}
        .vr-top-btn .vr-i{font-size:27px;line-height:28px;display:block}.vr-top-btn .vr-t{font-size:10px;display:block;margin-top:2px}
        .vr-badge{position:absolute;top:-4px;right:1px;background:#e51b23;color:#fff;font-size:12px;font-weight:800;padding:2px 7px;border-radius:3px}
        .vr-count{position:absolute;top:-6px;right:0;background:#e51b23;color:#fff;font-weight:800;font-size:14px;padding:4px 7px;border-radius:3px}
        .vr-account-menu{position:absolute;top:80px;right:12px;width:280px;background:#fff;color:#444;z-index:500;border:1px solid #ddd;box-shadow:0 3px 10px rgba(0,0,0,.25);direction:rtl}
        .vr-account-menu button{width:100%;height:60px;border:0;border-bottom:1px solid #e4e4e4;background:#fff;font-size:16px;color:#555;display:flex;align-items:center;justify-content:space-between;padding:0 20px;cursor:pointer}
        .vr-account-menu button span:first-child{color:#19a7ce;font-size:22px}
        .vr-chat-row{min-height:58px;background:#f0f0f0;border-bottom:2px solid #fff;display:flex;align-items:center;padding:0 10px;box-sizing:border-box;direction:rtl}
        .vr-chat-row:nth-child(even){background:#fafafa}.vr-chat-avatar{width:42px;height:42px;border-radius:50%;overflow:hidden;flex:none;border:2px solid #16a9c9;background:#ddd;margin-left:8px}
        .vr-chat-avatar img{width:100%;height:100%;object-fit:cover}.vr-chat-name{font-size:15px;font-weight:800;margin-left:4px}.vr-chat-text{font-size:14px;color:#111}.vr-chat-flag{font-size:13px;color:#aaa;margin-right:auto}
        .vr-input{height:58px;background:#fff;border:1px solid #ddd;border-radius:30px;display:flex;align-items:center;padding:0 14px;font-size:18px;color:#777}
        .vr-send{width:60px;height:60px;border-radius:50%;border:0;background:#003840;color:#fff;font-size:30px}
        .vr-bottom{height:76px;min-height:76px;background:#003840;color:#fff;display:flex;align-items:center;justify-content:space-around;direction:rtl}
        .vr-bottom-item{border:0;background:none;color:#fff;cursor:pointer;text-align:center;font-size:10px;min-width:72px}.vr-bottom-item .bi{font-size:31px;line-height:32px;display:block}.vr-radio{display:flex;align-items:center;gap:10px;direction:ltr}.vr-radio-play{width:58px;height:58px;border-radius:50%;background:#fff;color:#003840;border:0;font-size:28px}
        .vr-radio-title{font-size:13px;color:#12a8d0}.vr-radio-title b{display:block;color:#fff;font-size:17px}
        .vr-drawer{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.4);direction:rtl}.vr-drawer-inner{width:78%;max-width:430px;height:100%;background:#fff;overflow:auto;box-shadow:-5px 0 20px rgba(0,0,0,.25)}
        .vr-menu-item{height:54px;border:0;border-bottom:1px solid #e4e4e4;background:#fff;width:100%;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:14px;color:#444;cursor:pointer}.vr-menu-item .mi{color:#18a7ce;font-size:22px}
        .vr-menu-title{height:58px;background:#003840;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-size:15px}
        .vr-profile-overlay{position:fixed;inset:0;z-index:700;background:rgba(0,0,0,.58);display:flex;align-items:flex-start;justify-content:center;padding:0;direction:rtl}
        .vr-profile{width:96%;max-width:1080px;max-height:96dvh;margin-top:2%;background:#fff;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 30px rgba(0,0,0,.35)}
        .vr-profile-head{height:260px;min-height:260px;background:#003840;color:#fff;position:relative;display:flex;align-items:flex-end;justify-content:center;padding-bottom:20px}
        .vr-profile-head .close{position:absolute;left:22px;top:22px;border:0;background:none;color:#fff;font-size:44px;cursor:pointer}.vr-profile-avatar{position:absolute;right:16%;bottom:25px;width:180px;height:180px;object-fit:contain}
        .vr-profile-name{font-size:28px;font-weight:700;margin-right:120px}.vr-profile-tabs{height:74px;display:grid;grid-template-columns:repeat(5,1fr);background:#f4f4f4}
        .vr-profile-tabs button{border:0;border-left:1px solid #ddd;background:#f4f4f4;font-size:18px;color:#555;cursor:pointer}.vr-profile-tabs button.active{background:#003840;color:#fff}
        .vr-profile-body{flex:1;overflow:auto;padding:25px;background:#fff}.vr-field-label{color:#10a7c9;text-align:center;font-weight:800;font-size:18px;margin:18px 0 7px}.vr-select{height:55px;border:1px solid #ddd;border-radius:5px;background:#f5f5f5;width:100%;font-size:17px;padding:0 12px;text-align:center;color:#555}
        .vr-grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}.vr-save{background:#10abd0;color:#fff;border:0;border-radius:8px;padding:14px 40px;font-size:18px;font-weight:800;cursor:pointer}
        .vr-info-row{height:45px;border-bottom:1px solid #e6e6e6;display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#555}.vr-info-row b{color:#222}
        .vr-rank-overlay{position:fixed;inset:0;z-index:710;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;padding-top:70px;direction:rtl}
        .vr-rank-box{width:96%;max-width:780px;max-height:80dvh;background:#111;overflow:hidden;border:1px solid #555}.vr-rank-head{height:55px;background:#003840;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 16px}.vr-rank-tabs{display:grid;grid-template-columns:repeat(3,1fr)}.vr-rank-tabs button{height:45px;border:0;background:#eee;color:#555;font-size:13px}.vr-rank-tabs button.active{background:#003840;color:#fff}
        .vr-gift-list{padding:12px;background:#111;overflow:auto;max-height:65dvh}.vr-gift{height:88px;margin-bottom:10px;border-radius:20px;border:2px solid #ddd;display:flex;align-items:center;padding:0 18px;color:#fff;font-size:20px;font-weight:800;box-sizing:border-box}.vr-gift:nth-child(1){background:linear-gradient(#c40000,#ff3131)}.vr-gift:nth-child(2){background:linear-gradient(90deg,#ff00e8,#bdefff)}.vr-gift:nth-child(3){background:linear-gradient(#b90000,#ff2d2d)}.vr-gift:nth-child(4){background:linear-gradient(#ff8a16,#25206e)}.vr-gift:nth-child(5){background:linear-gradient(#ff5b5b,#eee,#333)}.vr-gift:nth-child(6){background:linear-gradient(#7b0000,#280000)}.vr-gift:nth-child(7){background:linear-gradient(#77d5ff,#84909b)}.vr-gift:nth-child(8){background:linear-gradient(#9f7a20,#eadfc7)}.vr-gift span:last-child{margin-right:auto;font-size:20px}


        /* FINAL VIDEO-REFERENCE OVERRIDES */
        .video-reference-topbar{height:92px;min-height:92px;background:#003c43;color:#fff;display:flex;align-items:center;padding:10px 18px;gap:26px;direction:rtl;position:relative;z-index:500}
        .vtop-icon{position:relative;border:0;background:none;color:#fff;width:58px;height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;padding:0}
        .vtop-icon svg{opacity:.98}.vtop-icon small{font-size:14px;margin-top:3px}.vtop-icon>span:first-of-type{display:none}.vtop-spacer{flex:1}.vtop-count,.vtop-badge{position:absolute;top:3px;right:1px;background:#f0181f;color:#fff;border-radius:3px;font-size:16px;font-weight:900;line-height:1;padding:7px 9px}.vtop-badge{font-size:13px;padding:4px 6px;top:2px}
        .video-account-menu{position:absolute;right:14px;top:92px;width:260px;background:#fff;color:#444;box-shadow:0 5px 18px rgba(0,0,0,.3);z-index:1000;direction:rtl}.video-account-menu button{display:block;width:100%;height:56px;border:0;border-bottom:1px solid #e5e5e5;background:#fff;text-align:right;padding:0 18px;font-size:16px;color:#555}
        .video-reference-bottom{height:108px;min-height:108px;background:#003c43;color:#fff;display:flex;align-items:center;justify-content:space-around;direction:rtl;position:relative;z-index:500;padding:6px 8px}
        .video-reference-bottom>button{width:18%;height:92px;border:0;background:none;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:15px;cursor:pointer}.video-reference-bottom>button svg{display:block}.video-reference-bottom>button span{font-size:14px}
        .radio-reference{width:42%;height:92px;display:flex;align-items:center;justify-content:center;gap:10px;direction:ltr}.radio-play{width:70px;height:70px;border:0;border-radius:50%;background:#fff;color:#003c43;font-size:31px;cursor:pointer}.radio-reference div{display:flex;flex-direction:column;line-height:1}.radio-reference div span{color:#12a8d0;font-size:16px}.radio-reference div b{color:#fff;font-size:25px;margin-top:5px}
        .video-chat-scroll>div{min-height:58px!important;padding:4px 9px!important;border-bottom:1px solid #e0e0e0!important}.video-chat-scroll>div>div:first-child{width:44px!important;height:44px!important;border-radius:50%!important}.video-chat-scroll>div>div:nth-child(2){font-size:15px!important}.video-chat-scroll>div>div:nth-child(2) span{font-size:15px!important}.video-composer{min-height:76px!important;padding:9px 13px!important}.video-composer>button[type=submit]{width:60px!important;height:60px!important;font-size:28px!important}.video-composer>div{height:56px!important;border-radius:30px!important;background:#f7f7f7!important}
        .video-auth-screen{min-height:100dvh;background:#fff;color:#333;overflow:auto;position:relative;font-family:Tahoma,Arial,sans-serif}.video-auth-banner{height:300px;background:#003c43 url('data:image/jpeg;base64,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) center/cover no-repeat}.video-auth-links{position:absolute;top:24px;right:18px;color:#f2bd2e;font-size:17px;font-weight:700}.video-auth-title{position:absolute;top:140px;left:0;right:0;text-align:center;color:#fff;text-shadow:0 3px 5px #000;font-size:45px;font-weight:900}.video-auth-card{position:relative;margin:-40px auto 0;width:94%;max-width:850px;background:#fff;min-height:760px;padding:70px 38px 30px;box-shadow:0 0 3px rgba(0,0,0,.25);direction:rtl}.video-auth-close{position:absolute;right:18px;top:12px;background:#003c43;color:#fff;border:0;font-size:44px;width:72px;height:65px;line-height:55px;cursor:pointer}.video-auth-card label{display:block;text-align:center;font-size:21px;font-weight:700;margin:16px 0 8px}.video-auth-card input,.video-auth-card select{width:100%;height:58px;background:#f2f2f2;border:1px solid #ddd;padding:0 12px;font-size:18px;text-align:right;box-sizing:border-box}.video-auth-login,.video-auth-register,.video-auth-guest{width:100%;height:70px;border:0;color:#fff;font-size:24px;margin-top:20px;cursor:pointer}.video-auth-login{background:#11a9cf}.video-auth-register{background:#76be05}.video-auth-guest{background:#0a454b}.video-auth-forgot,.video-auth-back{display:block;border:0;background:none;color:#777;font-size:18px;margin:16px 0 0 auto;cursor:pointer}.video-auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.video-captcha{margin-top:18px;border:1px solid #ddd;background:#fafafa;height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:16px}.video-auth-error{background:#ffe1e1;color:#b40000;padding:10px;margin-bottom:10px;text-align:center}.video-auth-success{background:#e4f9e8;color:#087d26;padding:10px;margin-bottom:10px;text-align:center}.video-auth-ad{text-align:center;color:#064d88;font-size:30px;padding:28px 15px 20px;line-height:1.35}.video-auth-faq{margin:0 0 40px;background:#a80042;color:#fff;padding:28px;font-size:18px;line-height:1.8}.video-auth-faq b{font-size:28px}
        .video-room-list{background:#efefef!important;padding:10px 14px 20px!important}.video-room-card{border-radius:28px!important;padding:22px 18px 20px!important;margin-bottom:14px!important;box-shadow:0 1px 5px rgba(0,0,0,.15)!important;border:1px solid #ddd!important}.video-room-card>div{font-size:21px!important}.video-room-card button{height:58px!important;border-radius:30px!important;font-size:18px!important;background:#003c43!important}.video-room-card button span{background:#72be08!important;border-radius:10px!important;padding:4px 10px!important}
        .vr-profile-overlay{background:rgba(0,0,0,.56)!important}.vr-profile{width:96%!important;max-width:1080px!important;max-height:94dvh!important;margin-top:1%!important;border-radius:4px!important}.vr-profile-head{height:330px!important;min-height:330px!important;background:#003c43!important}.vr-profile-avatar{right:15%!important;bottom:24px!important;width:210px!important;height:210px!important}.vr-profile-name{font-size:32px!important;margin-right:120px!important;margin-bottom:15px!important}.vr-profile-tabs{height:78px!important}.vr-profile-tabs button{font-size:21px!important}.vr-profile-body{padding:34px 48px!important}.vr-info-row{height:62px!important;font-size:18px!important}.vr-field-label{font-size:22px!important}.vr-select{height:66px!important;font-size:20px!important}.vr-grid2{gap:22px!important}.vr-save{font-size:20px!important}
        .vr-rank-overlay{padding-top:110px!important}.vr-rank-box{width:94%!important;max-width:1000px!important;max-height:78dvh!important}.vr-gift{height:112px!important;border-radius:22px!important;font-size:27px!important}
        @media (max-width:600px) {
          .video-topbar { height:48px !important; min-height:48px !important; }
          .video-topbar .brand-logo { font-size:18px !important; }
          .video-chat-scroll > div { min-height:44px !important; }
          .video-chat-scroll > div > div:nth-child(2) { font-size:12px !important; }
          .video-rooms-panel { width:100% !important; }
        }
      `}</style>

      <style>{`*{box-sizing:border-box} body{margin:0;font-family:Tahoma,Arial,sans-serif;background:#004247} button,input,textarea,select{font-family:inherit} ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-thumb{background:#aab7b8;border-radius:10px}`}</style>
      
      <input 
        type="file" 
        ref={avatarInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={(e) => handleFileSelect(e, 'avatar')} 
      />
      <input 
        type="file" 
        ref={coverInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={(e) => handleFileSelect(e, 'cover')} 
      />
      <input 
        type="file" 
        ref={songInputRef} 
        accept="audio/*" 
        style={{ display: 'none' }} 
        onChange={handleSongSelect} 
      />
      <input type="file" ref={chatImageInputRef} accept="image/*" style={{display:'none'}} onChange={handleChatImageSelect} />

      {(currentView === 'chat' || currentView === 'rooms') && (
        <header className="video-reference-topbar">
          <button className="vtop-icon" onClick={()=>{setShowVipModal(true);setGiftRankTab('leaders')}} title="الأثرياء"><VideoIcon type="diamond" size={31}/><span>♢</span></button>
          <button className="vtop-icon" onClick={()=>{setShowVipModal(true);setGiftRankTab('ranks')}} title="الكبار"><VideoIcon type="crown" size={31}/><span className="vtop-count">363</span></button>
          <div className="vtop-spacer" />
          <button className="vtop-icon" onClick={()=>setShowMessagesModal(true)} title="رسالة"><VideoIcon type="mail" size={31}/>{totalUnreadMessages>0&&<span className="vtop-badge">{totalUnreadMessages}</span>}<small>رسالة</small></button>
          <button className="vtop-icon" onClick={handleOpenNotifications} title="إشعار"><VideoIcon type="bell" size={31}/>{unreadNotificationsCount>0&&<span className="vtop-badge">{unreadNotificationsCount}</span>}<small>إشعار</small></button>
          <button className="vtop-icon" onClick={()=>setShowAccountMenu(v=>!v)} title="إعدادات"><VideoIcon type="users" size={31}/><small>إعدادات</small></button>
          {showAccountMenu && <div className="video-account-menu">
            <button onClick={async()=>{setShowAccountMenu(false);if(user) await openUserProfile({uid:user.uid,name:displayName||user.email||'المستخدم'})}}>ملفي الشخصي</button>
            <button onClick={()=>{setShowAccountMenu(false);setShowRoomsModal(true)}}>قائمة الغرف</button>
            <button onClick={async()=>{setShowAccountMenu(false);await signOut(auth)}}>خروج</button>
          </div>}
        </header>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#ffffff', minHeight: 0, position: 'relative' }}>
        
        {currentView === 'rooms' && (
          <div className="video-room-list" style={{padding:'10px 8px 0',overflowY:'auto',flex:1,direction:'rtl',background:'#eeeeee'}}>
            {isOwner && (
              <form onSubmit={handleCreateRoom} style={{background:'#fff',borderRadius:'24px',padding:'14px 16px',marginBottom:'12px',border:'1px solid #ddd',boxShadow:'0 1px 4px rgba(0,0,0,.08)'}}>
                <div style={{fontSize:'16px',fontWeight:'700',color:'#333',textAlign:'center',marginBottom:'10px'}}>إدارة الغرف — صاحب الموقع فقط</div>
                <div style={{display:'flex',gap:'8px'}}>
                  <input value={newRoomName} onChange={e=>setNewRoomName(e.target.value)} required placeholder="اسم الغرفة" style={{flex:1,padding:'11px',border:'1px solid #ddd',borderRadius:'12px',fontSize:'14px',textAlign:'right'}} />
                  <input value={newRoomFlag} onChange={e=>setNewRoomFlag(e.target.value)} aria-label="رمز الغرفة" style={{width:'58px',padding:'10px',border:'1px solid #ddd',borderRadius:'12px',fontSize:'18px',textAlign:'center'}} />
                  <button type="submit" style={{background:'#16a34a',color:'#fff',border:0,borderRadius:'12px',padding:'0 15px',fontWeight:'700'}}>إضافة</button>
                </div>
              </form>
            )}
            {rooms.map(room=>{const count=roomCounts[room.id]||0;return (
              <div key={room.id} className="video-room-card" style={{background:'#fff',borderRadius:'18px',padding:'10px 10px 9px',marginBottom:'8px',border:'1px solid #ddd',boxShadow:'0 1px 5px rgba(0,0,0,.08)',textAlign:'center'}}>
                <div style={{fontSize:'15px',fontWeight:'700',color:'#333',lineHeight:1.3}}><span style={{color:'#20a8d1',fontWeight:'800'}}>{count}</span> <span style={{color:'#62b70c'}}>♣</span> <span style={{color:'#aaa'}}>│</span> {room.name} <span style={{color:'#aaa'}}>│</span> {room.flag||'🌐'}</div>
                <button onClick={()=>enterRoom(room)} style={{marginTop:'12px',width:'100%',height:'40px',border:0,borderRadius:'30px',background:'#003f45',color:'#fff',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}><span style={{background:'#69be00',borderRadius:'10px',padding:'3px 8px',marginLeft:'8px'}}>↪</span> دخول الغرفة</button>
                {isOwner && <button onClick={()=>handleDeleteRoom(room.id)} style={{marginTop:'8px',background:'#fff0f0',color:'#d22',border:'1px solid #f2b3b3',borderRadius:'10px',padding:'6px 14px',fontSize:'12px',fontWeight:'700'}}>حذف الغرفة</button>}
              </div>
            )})}
          </div>
        )}
        {currentView === 'chat' && selectedRoom && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
            
            {activeVideoUrl && (
              <div 
                style={{
                  position: 'absolute',
                  top: `${videoPos.y}px`,
                  left: `${videoPos.x}px`,
                  zIndex: 100,
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                  border: '2px solid #ef4444',
                  overflow: 'hidden',
                  width: isVideoMinimized ? '180px' : '300px',
                  transition: isDraggingVideo.current ? 'none' : 'width 0.2s'
                }}
              >
                <div 
                  onMouseDown={(e) => {
                    isDraggingVideo.current = true;
                    dragOffset.current = { x: e.clientX - videoPos.x, y: e.clientY - videoPos.y };
                    const onMouseMove = (ev: MouseEvent) => {
                      if (!isDraggingVideo.current) return;
                      setVideoPos({ x: ev.clientX - dragOffset.current.x, y: ev.clientY - dragOffset.current.y });
                    };
                    const onMouseUp = () => {
                      isDraggingVideo.current = false;
                      window.removeEventListener('mousemove', onMouseMove);
                      window.removeEventListener('mouseup', onMouseUp);
                    };
                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                  }}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    isDraggingVideo.current = true;
                    dragOffset.current = { x: touch.clientX - videoPos.x, y: touch.clientY - videoPos.y };
                    const onTouchMove = (ev: TouchEvent) => {
                      if (!isDraggingVideo.current) return;
                      const t = ev.touches[0];
                      setVideoPos({ x: t.clientX - dragOffset.current.x, y: t.clientY - dragOffset.current.y });
                    };
                    const onTouchEnd = () => {
                      isDraggingVideo.current = false;
                      window.removeEventListener('touchmove', onTouchMove);
                      window.removeEventListener('touchend', onTouchEnd);
                    };
                    window.addEventListener('touchmove', onTouchMove);
                    window.addEventListener('touchend', onTouchEnd);
                  }}
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    padding: '6px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'grab',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}
                >
                  <span>📺 مشغل يوتيوب</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => setIsVideoMinimized(!isVideoMinimized)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {isVideoMinimized ? '+' : '-'}
                    </button>
                    <button 
                      onClick={() => setActiveVideoUrl(null)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {!isVideoMinimized && (
                  <div style={{ width: '100%', height: '170px', background: '#000' }}>
                    <iframe 
                      src={`${activeVideoUrl}?autoplay=1`} 
                      title="YouTube player" 
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}

            <div className="video-chat-scroll" style={{ flex: 1, padding: '0', overflowY: 'auto', display: 'flex', flexDirection: 'column', direction: 'rtl', background: '#ffffff' }}>
              
              {messages.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  لا توجد رسائل في هذه الغرفة بعد. اكتب شيئاً وابدأ المحادثة! 💬
                </div>
              ) : (
                messages.map((m, idx) => {
                  const styleProps = getNameStyleProps(m.nameStyle || 'normal', m.color || '#0284c7');
                  const hasCustomBg = m.profileBgColor && m.profileBgColor !== '#ffffff';

                  if (m.isSystemSpecial) {
                    return (
                      <div key={m.id || idx} style={{ padding: '6px 12px', display: 'flex', justifyContent: 'center', direction: 'rtl' }}>
                        <div style={{ backgroundColor: '#d9f7e8', border: 'none', color: '#111827', padding: '6px 10px', borderRadius: '0', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                          📢 {m.text}
                        </div>
                      </div>
                    );
                  }

                  const youtubeEmbedUrl = extractYouTubeEmbedUrl(m.text);

                  return (
                    <div 
                      key={m.id || idx} 
                      style={{ 
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f1f1f1', 
                        padding: '4px 6px', 
                        minHeight: '30px',
                        borderBottom: '1px solid #e7e7e7', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        direction: 'rtl' 
                      }}
                    >
                      
                      <div onClick={() => openUserProfile(m)} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0, cursor: 'pointer', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          '👤'
                        )}
                      </div>

                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '13px' }}>
                                                <span 
                          style={{ 
                            backgroundColor: hasCustomBg ? m.profileBgColor : 'transparent',
                            padding: hasCustomBg ? '3px 8px' : '0',
                            borderRadius: hasCustomBg ? '6px' : '0',
                            border: hasCustomBg ? '1px solid rgba(0,0,0,0.1)' : 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span style={{ fontWeight: 'bold', cursor: 'pointer', ...styleProps }} onClick={() => openUserProfile(m)}>
                            {m.user}:
                          </span>
                        </span>

                        {m.mediaType === 'image' ? (
                          <div style={{display:'flex',flexDirection:'column',gap:'4px',maxWidth:'220px'}}>
                            <img src={m.mediaData} alt={m.mediaName || 'صورة'} style={{maxWidth:'220px',maxHeight:'220px',borderRadius:'8px',objectFit:'cover',display:'block'}} />
                            <a href={m.mediaData} download={m.mediaName || 'chat-image.jpg'} style={{fontSize:'10px',color:'#0284c7',textDecoration:'none'}}>⬇ تنزيل الصورة</a>
                          </div>
                        ) : m.mediaType === 'voice' ? (
                          <audio controls src={m.mediaData} style={{width:'190px',height:'34px'}} />
                        ) : youtubeEmbedUrl ? (
                          <button 
                            onClick={() => setActiveVideoUrl(youtubeEmbedUrl)}
                            style={{ 
                              backgroundColor: '#ef4444', 
                              color: '#fff', 
                              border: 'none', 
                              padding: '4px 12px', 
                              borderRadius: '16px', 
                              fontSize: '11px', 
                              fontWeight: 'bold', 
                              cursor: 'pointer', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                            }}
                          >
                            <span>▶</span>
                            <span>يوتيوب</span>
                          </button>
                        ) : (
                          <span style={{ color: '#1e293b', fontWeight: '500' }}>
                            {renderBadgeText(m.text)}
                          </span>
                        )}
                      </div>

                      {isOwner && (
                        <button 
                          onClick={async () => {
                            try {
                              await deleteDoc(doc(db, 'rooms', selectedRoom.id, 'messages', m.id));
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer', fontWeight: '500', padding: '0 2px', marginRight: '3px', alignSelf: 'center', borderRadius: '4px' }}
                          title="حذف الكلام"
                        >
                          ✕
                        </button>
                      )}

                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {showEmojiPicker && (
              <div className="emoji-panel" style={{ backgroundColor:'#f8fafc', borderTop:'1px solid #cbd5e1', padding:'5px', display:'grid', gridTemplateColumns:'repeat(9,1fr)', gap:'2px', maxHeight:'160px', overflowY:'auto', flexShrink:0, position:'relative' }}>
                <button type="button" onClick={()=>setShowEmojiPicker(false)} aria-label="إغلاق السمايلات" style={{position:'absolute',top:'3px',left:'5px',width:'22px',height:'22px',border:'1px solid #cbd5e1',borderRadius:'50%',background:'#fff',color:'#334155',fontSize:'15px',lineHeight:'18px',cursor:'pointer',zIndex:2}}>×</button>
                {EMOJIS_LIST.map((emoji, idx) => (
                  <button key={idx} onClick={() => setInputText(prev => prev + emoji)} className={idx % 17 === 0 ? 'animated-emoji' : ''} style={{background:'transparent',border:'none',fontSize:'20px',cursor:'pointer',padding:'3px',lineHeight:1}}>{emoji}</button>
                ))}
              </div>
            )}

            {(pendingChatImage || isRecording || recordingData) && (
              <div style={{background:'#f8fafc',borderTop:'1px solid #ddd',padding:'7px 10px',display:'flex',alignItems:'center',gap:'8px',direction:'rtl'}}>
                {pendingChatImage && <img src={pendingChatImage} alt="preview" style={{width:'52px',height:'52px',objectFit:'cover',borderRadius:'7px',border:'1px solid #ccc'}} />}
                {recordingData && <audio controls src={recordingData} style={{width:'190px',height:'34px'}} />}
                {isRecording && <span style={{fontSize:'12px',color:'#dc2626',fontWeight:'bold'}}>● تسجيل {recordingSeconds}s</span>}
                <div style={{marginRight:'auto',display:'flex',gap:'5px'}}>
                  {!isRecording && (pendingChatImage || recordingData) && <button type="button" onClick={() => {setPendingChatImage(null);setRecordingData(null);}} style={{border:'1px solid #fecaca',background:'#fff1f2',color:'#dc2626',borderRadius:'6px',padding:'5px 8px',fontSize:'10px'}}>حذف</button>}
                  {recordingData && <button type="button" onClick={() => sendChatMedia('voice', recordingData, 'voice.webm')} style={{border:'none',background:'#16a34a',color:'#fff',borderRadius:'6px',padding:'5px 8px',fontSize:'10px'}}>إرسال</button>}
                  {isRecording && <button type="button" onClick={stopVoiceRecording} style={{border:'none',background:'#dc2626',color:'#fff',borderRadius:'6px',padding:'5px 8px',fontSize:'10px'}}>إيقاف</button>}
                  {pendingChatImage && <button type="button" onClick={() => sendChatMedia('image', pendingChatImage, pendingChatImageName)} style={{border:'none',background:'#16a34a',color:'#fff',borderRadius:'6px',padding:'5px 8px',fontSize:'10px'}}>إرسال</button>}
                </div>
              </div>
            )}
            <form className="video-composer" onSubmit={handleSendMessage} style={{ flexShrink: 0, backgroundColor: '#ffffff', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid #cbd5e1', direction: 'rtl', boxSizing: 'border-box' }}>
              <button type="submit" style={{ background: '#004247', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>➤</button>
              <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 10px', border: '1px solid #cbd5e1', height: '40px' }}>
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="اكتب هنا أو ألصق رابط يوتيوب..." style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', textAlign: 'right', fontSize: '12px' }} />
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{background:'transparent',border:'none',fontSize:'16px',cursor:'pointer',padding:'0 2px'}}>😊</button>
              </div>
              <button type="button" onClick={isRecording ? stopVoiceRecording : startVoiceRecording} style={{background:'transparent',border:'none',fontSize:'17px',cursor:'pointer',color:isRecording?'#dc2626':'#64748b',padding:'0 2px'}}>🎙</button>
              <button type="button" onClick={() => chatImageInputRef.current?.click()} style={{background:'transparent',border:'none',fontSize:'19px',cursor:'pointer',color:'#64748b',padding:'0 2px'}}>🖼️</button>
            </form>

          </div>
        )}

      </div>

      {activePrivateChat && (
        <div style={{ position: 'fixed', top: '50%', bottom: '60px', left: 0, right: 0, backgroundColor: '#ffffff', zIndex: 130, display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 25px rgba(0,0,0,0.3)', borderTop: '2px solid #0b141a', overflow: 'hidden', direction: 'rtl' }}>
          
          <div style={{ backgroundColor: '#0b141a', color: '#ffffff', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{activePrivateChat.peerName}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px', cursor: 'pointer' }}>⚙</span>
              <button onClick={() => setActivePrivateChat(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {hasMorePrivateMessages && <button type="button" onClick={loadMorePrivateMessages} disabled={loadingMorePrivateMessages} style={{alignSelf:'center',border:0,borderRadius:'8px',padding:'6px 12px',fontSize:'10px',background:'#e2e8f0',color:'#0f172a'}}>{loadingMorePrivateMessages?'جاري التحميل...':'تحميل المزيد'}</button>}
            {privateMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '20px' }}>
                ابدأ محادثتك الخاصة الآن مع {activePrivateChat.peerName} 💬
              </div>
            ) : (
              privateMessages.map((msg, idx) => {
                const isMe = msg.senderId === user?.uid;
                return (
                  <div key={msg.id || idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth: '75%', backgroundColor: isMe ? '#dcfce7' : '#ffffff', color: '#1e293b', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px', fontWeight: 'bold' }}>{msg.senderName}</div>
                      <div>{msg.text}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={privateChatBottomRef} />
          </div>

          <form onSubmit={handleSendPrivateMessage} style={{ backgroundColor: '#f1f5f9', padding: '8px', borderTop: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: '0' }}>
            <button type="submit" style={{ backgroundColor: '#0b141a', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '15px' }}>➤</button>
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid #cbd5e1', height: '40px' }}>
              <input 
                type="text" 
                value={privateInputText} 
                onChange={(e) => setPrivateInputText(e.target.value)} 
                placeholder="اكتب هنا..." 
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', textAlign: 'right', fontSize: '13px' }}
              />
            </div>
            <button type="button" style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>📎</button>
            <button type="button" style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>🎙</button>
          </form>

        </div>
      )}

      {showMessagesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 110, display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'rtl', padding: '12px' }}>
          <div style={{ width: '100%', maxWidth: '360px', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            
            <div style={{ backgroundColor: '#0b141a', color: '#ffffff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>قائمة الرسائل الخاصة ✉</span>
              <button onClick={() => setShowMessagesModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ padding: '12px', maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hasMorePrivateConversations && <button type="button" onClick={loadMorePrivateConversations} disabled={loadingMorePrivateConversations} style={{border:0,borderRadius:'8px',padding:'6px 10px',fontSize:'10px',background:'#e2e8f0'}}>{loadingMorePrivateConversations?'جاري التحميل...':'تحميل المزيد'}</button>}
              {privateConversations.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '20px 0' }}>
                  لا توجد محادثات خاصة مسجلة حالياً.
                </div>
              ) : (
                privateConversations.map((conv) => (
                  <div 
                    key={conv.peerId} 
                    onClick={() => openPrivateChatWithUser(conv.peerId, conv.peerName)}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }}>{conv.peerName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.lastMessage}</div>
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span style={{ backgroundColor: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {currentView === 'chat' && (
        <nav className="video-reference-bottom">
          <button onClick={()=>setShowMainMenu(true)}><VideoIcon type="settings" size={34}/><span>خيارات</span></button>
          <div className="radio-reference">
            <button type="button" onClick={()=>{
              const el=document.getElementById('radio9090') as HTMLAudioElement|null;
              if(el){ if(el.paused) el.play().catch(()=>{}); else el.pause(); }
            }} className="radio-play">▶</button>
            <div><span>Radio</span><b>9090</b></div>
            <audio id="radio9090" preload="none" src="https://9090streaming.mobtada.com/9090FMEGYPT" />
          </div>
          <button onClick={()=>setShowRoomsModal(true)}><VideoIcon type="home" size={34}/><span>الغرف</span></button>
          <button onClick={()=>setShowOnlineModal(true)}><VideoIcon type="users" size={34}/><span>المتصلين</span></button>
        </nav>
      )}

      {showMainMenu && (
        <div className="vr-drawer" onClick={()=>setShowMainMenu(false)}>
          <div className="vr-drawer-inner" onClick={e=>e.stopPropagation()}>
            <div style={{height:'58px',background:'#fff',display:'flex',alignItems:'center',padding:'0 18px',borderBottom:'1px solid #ddd'}}>
              <button onClick={()=>setShowMainMenu(false)} style={{border:0,background:'none',fontSize:'40px',color:'#444'}}>×</button>
            </div>
            {[
              ['🟢','متصل',()=>setShowOnlineModal(true)],
              ['📰','الأخبار',()=>setShowNewsModal(true)],
              ['✉','إتصل بنا',()=>setShowMessagesModal(true)],
              ['🔎','بحث',()=>setShowTopSearch(true)],
              ['💎','كبار الشخصيات',()=>{setShowVipModal(true);setGiftRankTab('leaders')}],
              ['♛','الأثرياء',()=>{setShowVipModal(true);setGiftRankTab('gifts')}],
              ['＋','المزيد',()=>setShowRoomsModal(true)],
              ['f','تابعنا على فيسبوك',()=>{}],
              ['▶','قناتنا على يوتيوب',()=>{}],
              ['🤖','تطبيق الأندرويد',()=>{}],
              ['⟳','تحديث الصفحة',()=>window.location.reload()]
            ].map(([icon,label,fn],i)=>
              <button key={i} className="vr-menu-item" onClick={async()=>{setShowMainMenu(false);await (fn as any)()}}>
                <span className="mi">{icon as any}</span><span>{label as any}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {showTopSearch && (
        <div style={{position:'fixed',inset:0,zIndex:650,background:'#fff',direction:'rtl',display:'flex',flexDirection:'column'}}>
          <div style={{height:'68px',display:'flex',alignItems:'center',justifyContent:'center',borderBottom:'1px solid #ddd',position:'relative',fontSize:'20px',color:'#444'}}>
            <button onClick={()=>setShowTopSearch(false)} style={{position:'absolute',left:'22px',border:0,background:'none',fontSize:'38px',color:'#444'}}>×</button>
            <span>البحث عن أشخاص <b style={{color:'#12a8d0',fontSize:'28px'}}>⌕</b></span>
          </div>
          <div style={{textAlign:'center',height:'65px',paddingTop:'18px',fontSize:'17px',color:'#222',boxSizing:'border-box'}}>إعلان ترويجي</div>
          <div style={{display:'flex',alignItems:'center',padding:'7px 12px',borderBottom:'1px solid #ddd'}}>
            <span style={{fontSize:'18px',color:'#12a8d0'}}>⌕</span>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="البحث عن أشخاص" style={{flex:1,border:0,outline:0,fontSize:'13px',textAlign:'right',padding:'7px'}}/>
            {searchQuery&&<button onClick={()=>setSearchQuery('')} style={{border:0,background:'none',fontSize:'18px'}}>×</button>}
          </div>
          <div style={{flex:1,overflow:'auto'}}>
            {onlineUsersList.filter(u=>u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u=>
              <div key={u.id} onClick={()=>{setShowTopSearch(false);openUserProfile(u)}} style={{height:'63px',borderBottom:'1px solid #eee',display:'flex',alignItems:'center',padding:'0 14px',cursor:'pointer',direction:'rtl'}}>
                <div style={{width:'42px',height:'42px',borderRadius:'50%',overflow:'hidden',border:'2px solid #18a7ce',background:'#ddd',marginLeft:'9px'}}>{u.avatarUrl?<img src={u.avatarUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{display:'flex',height:'100%',alignItems:'center',justifyContent:'center'}}>👤</span>}</div>
                <div style={{fontSize:'13px',fontWeight:700,color:u.nameColor||'#333',flex:1}}>{u.name}</div>
                <span style={{fontSize:'15px'}}>{u.flag||'🌐'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {showRoomsModal && (
        <div className="video-rooms-overlay"
          onClick={() => setShowRoomsModal(false)}
          style={{
            position: 'fixed',
            top: currentView === 'chat' ? '48px' : '0',
            right: 0,
            bottom: currentView === 'chat' ? '50px' : '0',
            left: 0,
            backgroundColor: 'rgba(15,23,42,0.55)',
            zIndex: 200,
            direction: 'rtl',
            overflow: 'hidden'
          }}
        >
          <div className="video-rooms-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '100%',
              minWidth: '290px',
              background: '#ffffff',
              boxShadow: '-12px 0 30px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ background: '#004247', color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '7px' }}>قائمة الغرف <span>🏠</span></div>
              <button onClick={() => setShowRoomsModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '32px', lineHeight: 1, cursor: 'pointer', fontWeight: '300', padding: 0 }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isOwner && (
                <form onSubmit={handleCreateRoom} style={{ background: 'linear-gradient(135deg,#f0f9ff,#ffffff)', border: '1px solid #dbeafe', borderRadius: '14px', padding: '12px', boxShadow: '0 5px 16px rgba(15,23,42,0.06)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '11px', textAlign: 'center' }}>إدارة الغرف — صاحب الموقع فقط ⚙️</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="text" placeholder="اسم الغرفة..." value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: '11px 12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '11px', outline: 'none', textAlign: 'right' }} />
                    <input type="text" value={newRoomFlag} onChange={(e) => setNewRoomFlag(e.target.value)} aria-label="رمز الغرفة" style={{ width: '52px', padding: '10px 6px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '16px', textAlign: 'center', outline: 'none' }} />
                    <button type="submit" style={{ background: 'linear-gradient(135deg,#10b981,#16a34a)', color: '#fff', border: 'none', padding: '11px 14px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap', boxShadow: '0 5px 12px rgba(16,185,129,0.22)' }}>+ إضافة</button>
                  </div>
                </form>
              )}

              {rooms.map((room) => {
                const count = roomCounts[room.id] || 0;
                const isCurrentRoom = selectedRoom?.id === room.id;
                return (
                  <div key={room.id} style={{ background: isCurrentRoom ? 'linear-gradient(135deg,#eff6ff,#ffffff)' : '#ffffff', borderRadius: '12px', padding: '10px', border: isCurrentRoom ? '1.5px solid #38bdf8' : '1px solid #e2e8f0', boxShadow: '0 5px 16px rgba(15,23,42,0.07)', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '62px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isCurrentRoom ? '#dbeafe' : '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', flexShrink: 0 }}>{room.flag || '🏠'}</div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '11px', fontWeight: '700' }}>👥 {count}</div>
                      {isCurrentRoom && <span style={{ alignSelf: 'flex-start', color: '#16a34a', fontSize: '9px', fontWeight: '800' }}>● الغرفة الحالية</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '7px', flexShrink: 0 }}>
                      {isCurrentRoom ? (
                        <button disabled style={{ background: '#94a3b8', color: '#fff', border: 'none', padding: '5px 7px', borderRadius: '999px', fontWeight: '800', fontSize: '11px', minWidth: '105px', opacity: 0.95 }}>الغرفة الحالية</button>
                      ) : (
                        <button onClick={() => enterRoom(room)} style={{ background: 'linear-gradient(135deg,#0b141a,#173044)', color: '#fff', border: 'none', padding: '8px 11px', borderRadius: '999px', fontWeight: '800', cursor: 'pointer', fontSize: '10px', minWidth: '96px', boxShadow: '0 5px 12px rgba(11,20,26,0.16)' }}>دخول الغرفة 🚪</button>
                      )}
                      {isOwner && !isCurrentRoom && (
                        <button onClick={() => handleDeleteRoom(room.id)} style={{ background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3', padding: '6px 10px', borderRadius: '9px', fontSize: '9px', fontWeight: '800', cursor: 'pointer' }}>حذف 🗑️</button>
                      )}
                    </div>
                  </div>
                );
              })}

              {hasMoreRooms && (
                <button
                  type="button"
                  onClick={loadMoreRooms}
                  disabled={loadingMoreRooms}
                  style={{ marginTop: '2px', width: '100%', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px', fontSize: '11px', fontWeight: '800', cursor: loadingMoreRooms ? 'default' : 'pointer' }}
                >
                  {loadingMoreRooms ? 'جاري تحميل المزيد...' : 'تحميل المزيد من الغرف'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {showWallModal && user && (
        <div style={{position:'fixed',inset:0,zIndex:280,background:'rgba(0,0,0,.45)',display:'flex',justifyContent:'flex-start',direction:'rtl'}} onClick={()=>setShowWallModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:'86%',maxWidth:'430px',height:'100%',background:'#fff',display:'flex',flexDirection:'column',boxShadow:'-8px 0 25px rgba(0,0,0,.2)'}}>
            <div style={{height:'50px',background:'#004247',color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px'}}><b style={{fontSize:'14px'}}>حائط الأصدقاء</b><button onClick={()=>setShowWallModal(false)} style={{background:'none',border:0,color:'#fff',fontSize:'28px'}}>×</button></div>
            <div style={{padding:'10px',borderBottom:'1px solid #ddd'}}><textarea value={wallInput} onChange={e=>setWallInput(e.target.value)} placeholder='اكتب منشوراً على حائطك...' style={{width:'100%',minHeight:'70px',resize:'none',border:'1px solid #ddd',borderRadius:'9px',padding:'8px',fontSize:'12px',outline:'none',direction:'rtl'}}/><button onClick={addWallPost} style={{marginTop:'6px',background:'#16a34a',color:'#fff',border:0,borderRadius:'7px',padding:'7px 14px',fontSize:'11px'}}>نشر</button></div>
            <div style={{flex:1,overflowY:'auto',padding:'8px'}}>{wallPosts.map(p=><div key={p.id} style={{border:'1px solid #e2e8f0',borderRadius:'9px',padding:'9px',marginBottom:'8px',background:'#fff'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',fontWeight:'bold'}}><span>{p.userName}</span>{(isOwner || p.userId===user.uid)&&<button onClick={()=>deleteWallPost(p.id)} style={{border:0,background:'none',color:'#dc2626',fontSize:'12px'}}>حذف</button>}</div><div style={{fontSize:'12px',margin:'7px 0',lineHeight:1.6}}>{p.text}</div><div style={{display:'flex',gap:'6px',alignItems:'center',borderTop:'1px solid #f1f5f9',paddingTop:'6px'}}><button onClick={()=>toggleWallLike(p)} style={{border:0,background:'none',fontSize:'11px',color:(p.likes||[]).includes(user.uid)?'#2563eb':'#64748b'}}>👍 {(p.likes||[]).length}</button><span style={{fontSize:'10px',color:'#64748b'}}>💬 {(p.comments||[]).length}</span></div>{(p.comments||[]).map((c:any,i:number)=><div key={i} style={{fontSize:'10px',background:'#f8fafc',padding:'5px',borderRadius:'5px',marginTop:'4px'}}><b>{c.name}:</b> {c.text}</div>)}<div style={{display:'flex',gap:'5px',marginTop:'6px'}}><input value={wallCommentInputs[p.id]||''} onChange={e=>setWallCommentInputs(v=>({...v,[p.id]:e.target.value}))} placeholder='اكتب تعليقاً...' style={{flex:1,border:'1px solid #ddd',borderRadius:'6px',padding:'5px',fontSize:'10px',outline:'none'}}/><button onClick={()=>addWallComment(p)} style={{border:0,background:'#0284c7',color:'#fff',borderRadius:'6px',padding:'4px 8px',fontSize:'10px'}}>تعليق</button></div></div>)}</div>
          </div>
        </div>
      )}

      {showNewsModal && (
        <div style={{position:'fixed',inset:0,zIndex:281,background:'#f8fafc',display:'flex',flexDirection:'column',direction:'rtl'}}><button type="button" onClick={()=>window.location.reload()} style={{margin:'6px 8px',alignSelf:'flex-start',border:0,borderRadius:'7px',background:'#e2e8f0',color:'#334155',padding:'5px 10px',fontSize:'10px',cursor:'pointer'}}>⟳ تحديث الصفحة</button>
          <div style={{height:'52px',flexShrink:0,background:'#004247',color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px'}}>
            <b style={{fontSize:'15px'}}>الأخبار</b>
            <button onClick={()=>setShowNewsModal(false)} style={{background:'none',border:0,color:'#fff',fontSize:'27px',cursor:'pointer'}}>×</button>
          </div>
          {(isOwner || isSuperAdmin) && <div style={{background:'#fff',padding:'8px',borderBottom:'1px solid #e2e8f0'}}>
            <textarea value={newsInput} onChange={e=>setNewsInput(e.target.value)} placeholder='اكتب خبراً...' style={{width:'100%',minHeight:'55px',boxSizing:'border-box',border:'1px solid #cbd5e1',borderRadius:'8px',padding:'7px',fontSize:'11px',resize:'none',outline:'none'}}/>
            <button onClick={addNewsPost} style={{marginTop:'5px',background:'#16a34a',color:'#fff',border:0,borderRadius:'7px',padding:'6px 14px',fontSize:'10px',cursor:'pointer'}}>نشر الخبر</button>
          </div>}
          <div style={{flex:1,overflowY:'auto',padding:'10px'}}>
            {newsItems.length===0 ? <div style={{textAlign:'center',padding:'40px',color:'#64748b',fontSize:'12px'}}>لا توجد أخبار حالياً.</div> : newsItems.map(n=>{
              const likes=Array.isArray(n.likes)?n.likes:[]; const comments=Array.isArray(n.comments)?n.comments:[]; const interact=canInteractWithNews(n);
              const roleLabel=n.authorRole==='Owner'?'صاحب الموقع':n.authorRole==='Super Admin'?'سوبر أدمن':n.authorRole==='Admin'?'أدمن':(n.authorRole||'عضو');
              return <article key={n.id} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'10px',marginBottom:'9px',boxShadow:'0 1px 3px rgba(0,0,0,.05)',borderRight:n.pinned?'3px solid #eab308':'1px solid #e2e8f0'}}>
                {n.pinned&&<div style={{fontSize:'10px',color:'#92400e',marginBottom:'5px'}}>📌 منشور مثبت</div>}
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
                  <div style={{width:'40px',height:'40px',borderRadius:'50%',overflow:'hidden',background:'#e2e8f0',flexShrink:0}}>{n.authorAvatar?<img src={n.authorAvatar} alt='' style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'18px'}}>👤</span>}</div>
                  <div style={{minWidth:0}}><div style={{fontSize:'12px',fontWeight:'800',color:n.authorNameColor||'#2563eb'}}>{n.authorName||'الإدارة'}</div><div style={{fontSize:'9px',color:'#64748b'}}>{roleLabel}</div></div>
                </div>
                {n.image&&<img src={n.image} alt='' style={{width:'100%',maxHeight:'280px',objectFit:'cover',borderRadius:'7px',marginBottom:'7px'}}/>}
                <div style={{fontSize:'12px',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{n.text}</div>
                <div style={{display:'flex',alignItems:'center',gap:'12px',borderTop:'1px solid #f1f5f9',marginTop:'8px',paddingTop:'7px'}}>
                  <button onClick={()=>toggleNewsLike(n)} disabled={!interact} style={{border:0,background:'none',fontSize:'11px',color:likes.includes(user?.uid)?'#2563eb':interact?'#475569':'#cbd5e1',cursor:interact?'pointer':'default'}}>👍 {likes.length}</button>
                  <span style={{fontSize:'10px',color:'#64748b'}}>💬 {comments.length}</span>
                  {isOwner&&<><button onClick={()=>toggleNewsPin(n)} style={{marginRight:'auto',border:0,background:'#fef3c7',color:'#92400e',borderRadius:'5px',padding:'4px 7px',fontSize:'9px'}}>{n.pinned?'إلغاء التثبيت':'تثبيت'}</button><button onClick={()=>deleteNewsPost(n.id)} style={{border:0,background:'#fee2e2',color:'#b91c1c',borderRadius:'5px',padding:'4px 7px',fontSize:'9px'}}>حذف</button></>}
                </div>
                {comments.map((c:any,i:number)=><div key={i} style={{fontSize:'10px',background:'#f8fafc',padding:'5px 7px',borderRadius:'5px',marginTop:'5px'}}><b>{c.name}:</b> {c.text}</div>)}
                {interact&&<div style={{display:'flex',gap:'5px',marginTop:'6px'}}><input value={newsCommentInputs[n.id]||''} onChange={e=>setNewsCommentInputs(v=>({...v,[n.id]:e.target.value}))} placeholder='اكتب تعليقاً...' style={{flex:1,border:'1px solid #ddd',borderRadius:'6px',padding:'6px',fontSize:'10px',outline:'none'}}/><button onClick={()=>addNewsComment(n)} style={{border:0,background:'#0284c7',color:'#fff',borderRadius:'6px',padding:'4px 9px',fontSize:'10px'}}>تعليق</button></div>}
              </article>
            })}
          </div>
        </div>
      )}

      {showVipModal && (
        <div className="vr-rank-overlay" onClick={()=>setShowVipModal(false)}>
          <div className="vr-rank-box" onClick={e=>e.stopPropagation()}>
            <div className="vr-rank-head"><b>الأثرياء والكبار</b><button onClick={()=>setShowVipModal(false)} style={{background:'none',border:0,color:'#fff',fontSize:'28px'}}>×</button></div>
            <div className="vr-rank-tabs">
              <button className={giftRankTab==='leaders'?'active':''} onClick={()=>setGiftRankTab('leaders')}>كبار الشخصيات</button>
              <button className={giftRankTab==='gifts'?'active':''} onClick={()=>setGiftRankTab('gifts')}>الهدايا</button>
              <button className={giftRankTab==='ranks'?'active':''} onClick={()=>setGiftRankTab('ranks')}>الرتب</button>
            </div>
            {giftRankTab==='leaders' && <div style={{background:'#fff',maxHeight:'65dvh',overflow:'auto'}}>
              {rankedUsers.map((u:any,i:number)=><div key={u.id||i} style={{height:'58px',borderBottom:'1px solid #ddd',display:'flex',alignItems:'center',padding:'0 10px',cursor:'pointer'}} onClick={()=>{setShowVipModal(false);openUserProfile(u)}}><b style={{width:'28px'}}>{i+1}</b><div style={{width:'40px',height:'40px',borderRadius:'50%',overflow:'hidden',background:'#ddd',marginLeft:'8px'}}>{u.avatarUrl?<img src={u.avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'👤'}</div><span style={{fontWeight:800,color:u.nameColor||'#008fa3'}}>{u.displayName||u.name}</span><span style={{marginRight:'auto',fontSize:'10px',color:'#999'}}>{u.role||'عضو'}</span></div>)}
            </div>}
            {giftRankTab==='gifts' && <div className="vr-gift-list">
              {['الملك 👑','MoOoKAlI كنج','دار زايد 🕊','Silda★NightMare','ذيبان TOP','♨BYURA','سالم العبيدي','Khalid VIP','المزيد'].map((x,i)=><div className="vr-gift" key={x}><span>{x}</span><span>{i+1}</span></div>)}
            </div>}
            {giftRankTab==='ranks' && <div style={{background:'#fff',maxHeight:'65dvh',overflow:'auto'}}>
              {['زائر','عضو رتبة 1','عضو مشارك رتبة 5','عضو نشيط رتبة 10','عضو مميز رتبة 20','عضو ذهبي مرتبة 45','مشرف','Admin','Super Admin','صاحب الموقع'].map((x,i)=><div key={x} style={{height:'52px',borderBottom:'1px solid #ddd',display:'flex',alignItems:'center',padding:'0 15px'}}><b style={{width:'35px'}}>{i+1}</b><span style={{fontSize:'13px',fontWeight:800}}>{x}</span></div>)}
            </div>}
          </div>
        </div>
      )}

      {showRequestsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 110, display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'rtl', padding: '12px' }}>
          <div style={{ width: '100%', maxWidth: '360px', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            
            <div style={{ backgroundColor: '#0b141a', color: '#ffffff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>طلبات الصداقة 👤⁺</span>
              <button onClick={() => setShowRequestsModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ padding: '12px', maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '20px 0' }}>
                  لا توجد طلبات صداقة معلقة حالياً.
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }}>{req.fromName}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>يرغب بإضافتك كصديق</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleAcceptRequest(req)} style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>قبول</button>
                      <button onClick={() => handleRejectRequest(req.id)} style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>رفض</button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {showNotificationsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 110, display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'rtl', padding: '12px' }}>
          <div style={{ width: '100%', maxWidth: '360px', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            
            <div style={{ backgroundColor: '#0b141a', color: '#ffffff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>التنبيهات والإشعارات 🔔</span>
              <button onClick={() => setShowNotificationsModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ padding: '12px', maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hasMoreNotifications && <button type="button" onClick={loadMoreNotifications} disabled={loadingMoreNotifications} style={{margin:'6px auto',border:0,borderRadius:'8px',padding:'6px 12px',fontSize:'10px',background:'#e2e8f0'}}>{loadingMoreNotifications?'جاري التحميل...':'تحميل المزيد'}</button>}
              {notificationsList.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '20px 0' }}>
                  لا توجد إشعارات أو تنبيهات جديدة.
                </div>
              ) : (
                notificationsList.map((note) => (
                  <div key={note.id} style={{ borderRight: '4px solid #eab308', backgroundColor: '#fefce8', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#854d0e' }}>{note.title}</span>
                      <span style={{ fontSize: '9px', color: '#a16207' }}>{note.createdAt}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#713f12' }}>{note.body}</div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {showFriendsModal && (
        <div style={{ position: 'fixed', top: '48px', left: 0, right: 0, bottom: '50px', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', justifyContent: 'flex-start', direction: 'rtl' }}>
          <div style={{ width: '78%', maxWidth: '360px', minWidth: '280px', backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 16px rgba(0,0,0,0.2)', boxSizing: 'border-box', overflow: 'hidden' }}>
            
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff' }}>
              <button onClick={() => setShowFriendsModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', color: '#1e293b' }}>✕</button>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '4px 10px' }}>
                <span style={{ color: '#0284c7', marginLeft: '6px', fontSize: '13px' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="البحث عن أشخاص" 
                  value={friendsSearchQuery}
                  onChange={(e) => setFriendsSearchQuery(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '12px', textAlign: 'right', background: 'transparent' }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '10px', color: '#475569', fontSize: '12px', borderBottom: '1px solid #f1f5f9' }}>
              إعلان ترويجي
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {filteredFriendsList.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '12px' }}>
                    👤
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>
                    قائمة أصدقائك فارغة
                  </div>
                </div>
              ) : (
                filteredFriendsList.map((friend) => (
                  <div key={friend.id} style={{ padding: '5px 7px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👤</div>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>{friend.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => openPrivateChatWithUser(friend.friendUid, friend.name)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>خاص</button>
                      <button onClick={() => handleRemoveFriend(friend.friendUid)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>حذف</button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {showOnlineModal && (
        <div style={{ position: 'fixed', top: '48px', left: 0, right: 0, bottom: '50px', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', justifyContent: 'flex-start', direction: 'rtl' }}>
          <div style={{ width: '78%', maxWidth: '360px', minWidth: '280px', backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 16px rgba(0,0,0,0.2)', boxSizing: 'border-box', overflow: 'hidden' }}>
            
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff' }}>
              <button onClick={() => setShowOnlineModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', color: '#1e293b' }}>✕</button>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '4px 10px' }}>
                <span style={{ color: '#0284c7', marginLeft: '6px', fontSize: '13px' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="البحث في المتصلين" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '12px', textAlign: 'right', background: 'transparent' }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px' }}>
              {filteredOnlineUsers.map((u) => {
                const uStyleProps = getNameStyleProps(u.nameStyle || 'normal', u.nameColor || '#2563eb');
                return (
                  <div 
                    key={u.id} 
                    onClick={() => openUserProfile(u)}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      cursor: 'pointer', 
                      backgroundColor: u.profileBgColor || '#ffffff', 
                      border: '1px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', overflow: 'hidden' }}>
                        {u.avatarUrl ? <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', ...uStyleProps }}>{u.name}</span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{u.role}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px' }}>{u.flag}</span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {showSettingsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 110, display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'rtl', padding: '12px' }}>
          <div style={{ width: '100%', maxWidth: '380px', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', maxHeight: '85dvh' }}>
            
            <div style={{ backgroundColor: '#0b141a', color: '#ffffff', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>إعدادات الحساب ⚙</span>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setSettingsTab('info')} style={{ flex: 1, padding: '8px 4px', fontSize: '11px', fontWeight: 'bold', border: 'none', background: settingsTab === 'info' ? '#ffffff' : 'transparent', color: settingsTab === 'info' ? '#0284c7' : '#64748b', borderBottom: settingsTab === 'info' ? '2px solid #0284c7' : 'none', cursor: 'pointer' }}>المعلومات</button>
              <button onClick={() => setSettingsTab('options')} style={{ flex: 1, padding: '8px 4px', fontSize: '11px', fontWeight: 'bold', border: 'none', background: settingsTab === 'options' ? '#ffffff' : 'transparent', color: settingsTab === 'options' ? '#0284c7' : '#64748b', borderBottom: settingsTab === 'options' ? '2px solid #0284c7' : 'none', cursor: 'pointer' }}>الخيارات</button>
            </div>

            <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
              {settingsTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>الدولة / العلم</label>
                    <select 
                      value={profileCountry} 
                      onChange={(e) => {
                        setProfileCountry(e.target.value);
                        saveSettingToFirebase('country', e.target.value);
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      {COUNTRIES_LIST.map((c, i) => <option key={i} value={c}>{c} {getCountryFlag(c)}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>الجنس</label>
                    <select 
                      value={profileGender} 
                      onChange={(e) => {
                        setProfileGender(e.target.value);
                        saveSettingToFirebase('gender', e.target.value);
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>لون الاسم في المحادثة</label>
                    <input 
                      type="color" 
                      value={nameColor} 
                      onChange={(e) => {
                        setNameColor(e.target.value);
                        saveSettingToFirebase('nameColor', e.target.value);
                      }}
                      style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                    />
                  </div>

                  {hasRankForCustomization && (
                    <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #f0abfc', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#86198f' }}>✨ إعدادات أصحاب الرتب (حفظ فوري):</div>
                      
                      <div>
                        <label style={{ fontSize: '11px', color: '#701a75', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اختر لون خلفية المربع (للملف والمتصلين ومربع الاسم بالشات):</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
                          {PROFILE_BG_COLORS.map((item) => (
                            <button
                              key={item.value}
                              onClick={() => {
                                setProfileBgColor(item.value);
                                saveSettingToFirebase('profileBgColor', item.value);
                              }}
                              style={{
                                backgroundColor: item.value,
                                border: profileBgColor === item.value ? '2px solid #86198f' : '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '10px 4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: ['#0b141a', '#0f172a', '#1e293b', '#3b0764'].includes(item.value) ? '#fff' : '#000',
                                boxShadow: profileBgColor === item.value ? '0 0 0 2px #f0abfc' : 'none',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <span style={{ fontSize: '10px', color: '#701a75' }}>أو لون مخصص:</span>
                          <input 
                            type="color" 
                            value={profileBgColor} 
                            onChange={(e) => {
                              setProfileBgColor(e.target.value);
                              saveSettingToFirebase('profileBgColor', e.target.value);
                            }}
                            style={{ flex: 1, height: '32px', borderRadius: '6px', border: '1px solid #f0abfc', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: '#701a75', display: 'block', marginBottom: '4px' }}>زخرفة وتأثير الاسم</label>
                        <select 
                          value={nameStyle} 
                          onChange={(e) => {
                            setNameStyle(e.target.value);
                            saveSettingToFirebase('nameStyle', e.target.value);
                          }}
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #f0abfc', fontSize: '13px' }}
                        >
                          <option value="normal">عادي (بدون زخرفة)</option>
                          <option value="glowing">متوهج 🌟</option>
                          <option value="icy">جليدي 🧊</option>
                          <option value="fire">ناري 🔥</option>
                          <option value="gold">ذهبي 👑</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>نبذة شخصية (Bio)</label>
                    <textarea 
                      value={profileBio} 
                      onChange={(e) => setProfileBio(e.target.value)}
                      onBlur={() => saveSettingToFirebase('bio', profileBio)}
                      rows={3}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {canAddSong && (
                    <div style={{ marginTop: '6px', padding: '10px', borderRadius: '8px', backgroundColor: '#f5f3ff', border: '1px solid #c4b5fd' }}>
                      <label style={{ fontSize: '11px', color: '#6d28d9', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>🎵 أغنية الملف الشخصي</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => songInputRef.current?.click()}
                          style={{ flex: 1, minWidth: '120px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {profileSong ? '🔄 تغيير الأغنية' : '➕ إضافة أغنية'}
                        </button>
                        {profileSong && (
                          <button 
                            onClick={handleDeleteSong}
                            style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            🗑 حذف
                          </button>
                        )}
                      </div>
                      {profileSong && (
                        <div style={{ fontSize: '10px', color: '#6d28d9', marginTop: '6px' }}>
                          ✅ الأغنية مضافة وستشغّل تلقائياً عند فتح ملفك.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {settingsTab === 'options' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={async () => {
                      stopProfileSong();
                      await updateLastSeenOnExit();
                      await signOut(auth);
                      setShowSettingsModal(false);
                      localStorage.clear();
                      window.location.reload();
                    }} 
                    style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    تسجيل الخروج 🚪
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {selectedProfileUser && (
        <div className="vr-profile-overlay" onClick={()=>{stopProfileSong();setSelectedProfileUser(null)}}>
          <div className="vr-profile" onClick={e=>e.stopPropagation()}>
            <div className="vr-profile-head">
              <button className="close" onClick={()=>{stopProfileSong();setSelectedProfileUser(null)}}>×</button>
              <img className="vr-profile-avatar" src={selectedProfileUser.avatarUrl||VIDEO_PROFILE_AVATAR} alt="" />
              <div className="vr-profile-name">{selectedProfileUser.name}</div>
            </div>
            <div className="vr-profile-tabs">
              <button className={profileTab==='complete'?'active':''} onClick={()=>setProfileTab('complete')}>✎ إكمال التسجيل</button>
              <button className={profileTab==='info'?'active':''} onClick={()=>setProfileTab('info')}>معلوماتي</button>
              <button className={profileTab==='ignore'?'active':''} onClick={()=>setProfileTab('ignore')}>تجاهل</button>
              <button className={profileTab==='options'?'active':''} onClick={()=>setProfileTab('options')}>خيارات</button>
              <button className={profileTab==='more'?'active':''} onClick={()=>setProfileTab('more')}>المزيد</button>
            </div>
            <div className="vr-profile-body">
              {profileTab==='complete' && <div>
                <div className="vr-field-label">اسم المستخدم</div><input className="vr-select" value={editingUserName} onChange={e=>setEditingUserName(e.target.value)}/>
                <div className="vr-grid2">
                  <div><div className="vr-field-label">تحديد الجنس</div><select className="vr-select" value={profileGender} onChange={e=>setProfileGender(e.target.value)}><option>ذكر</option><option>أنثى</option></select></div>
                  <div><div className="vr-field-label">تحديد العمر</div><select className="vr-select" defaultValue={selectedProfileUser.age||26}>{Array.from({length:63},(_,i)=>18+i).map(a=><option key={a}>{a}</option>)}</select></div>
                </div>
                <div className="vr-grid2">
                  <div><div className="vr-field-label">البلد</div><select className="vr-select" value={profileCountry} onChange={e=>setProfileCountry(e.target.value)}>{COUNTRIES_LIST.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><div className="vr-field-label">العلاقة</div><select className="vr-select" defaultValue="عدم إظهار"><option>عدم إظهار</option><option>أعزب</option><option>مرتبط</option></select></div>
                </div>
                <button className="vr-save" onClick={async()=>{await handleUpdateUserName();saveSettingToFirebase('gender',profileGender);saveSettingToFirebase('country',profileCountry);saveSettingToFirebase('age',selectedProfileUser.age||'');saveSettingToFirebase('relationship','عدم إظهار');}}>حفظ 💾</button>
              </div>}
              {profileTab==='info' && <div>
                <div className="vr-info-row"><b>الجنس</b><span>{selectedProfileUser.gender||'ذكر'}</span></div>
                <div className="vr-info-row"><b>العمر</b><span>{selectedProfileUser.age||'غير محدد'}</span></div>
                <div className="vr-info-row"><b>العلاقة</b><span>{selectedProfileUser.relationship||'عدم إظهار'}</span></div>
                <div className="vr-info-row"><b>البلد</b><span>{selectedProfileUser.country||profileCountry} {selectedProfileUser.flag||currentFlag}</span></div>
                <div className="vr-info-row"><b>تاريخ الانضمام</b><span>{selectedProfileUser.joinedDate}</span></div>
                <div className="vr-info-row"><b>الغرفة الحالية</b><span>{selectedProfileUser.roomName}</span></div>
                <div className="vr-info-row"><b>آخر تواجد</b><span>{selectedProfileUser.lastSeen}</span></div>
                <div className="vr-info-row"><b>النقاط</b><span>{selectedProfileUser.points||0}</span></div>
                <div className="vr-info-row"><b>رابط الملف الشخصي</b><span>https://www.arabic.chat/#id{selectedProfileUser.userId}</span></div>
                <div className="vr-info-row" style={{minHeight:'70px'}}><b>معلوماتي</b><span>{selectedProfileUser.bio||'افعل مايجعلك سعيداً'}</span></div>
              </div>}
              {profileTab==='ignore' && <div>
                <div className="vr-grid2">
                  <div><div className="vr-field-label">تحديد الجنس</div><select className="vr-select" value={selectedProfileUser.gender||'ذكر'} onChange={e=>setSelectedProfileUser((v:any)=>({...v,gender:e.target.value}))}><option>ذكر</option><option>أنثى</option><option>آخر</option></select></div>
                  <div><div className="vr-field-label">تحديد العمر</div><select className="vr-select" defaultValue={selectedProfileUser.age||26}>{Array.from({length:63},(_,i)=>18+i).map(a=><option key={a}>{a}</option>)}</select></div>
                </div>
                <div className="vr-grid2">
                  <div><div className="vr-field-label">العلاقة</div><select className="vr-select" defaultValue={selectedProfileUser.relationship||'عدم إظهار'}><option>عدم إظهار</option><option>أعزب</option><option>مرتبط</option></select></div>
                  <div><div className="vr-field-label">البلد</div><select className="vr-select" value={selectedProfileUser.country||profileCountry} onChange={e=>setSelectedProfileUser((v:any)=>({...v,country:e.target.value}))}>{COUNTRIES_LIST.map(c=><option key={c}>{c}</option>)}</select></div>
                </div>
                <button className="vr-save" onClick={()=>{saveSettingToFirebase('gender',selectedProfileUser.gender||'ذكر');saveSettingToFirebase('country',selectedProfileUser.country||profileCountry)}}>حفظ 💾</button>
              </div>}
              {profileTab==='options' && <div>
                <div className="vr-field-label">لغة الدردشة</div><select className="vr-select" defaultValue="Arabic"><option>Arabic</option><option>English</option></select>
                <div className="vr-field-label">منطقة التوقيت الزمني</div><select className="vr-select" defaultValue="Asia/Amman"><option>Asia/Amman</option><option>Asia/Riyadh</option><option>UTC</option></select>
                <div className="vr-grid2">
                  <div><div className="vr-field-label">دردشة خاصة</div><select className="vr-select" defaultValue="تشغيل"><option>تشغيل</option><option>إيقاف</option></select></div>
                  <div><div className="vr-field-label">الذين يمكنهم إرسال صور خاصة</div><select className="vr-select" defaultValue="لا أحد"><option>لا أحد</option><option>الأصدقاء</option><option>الجميع</option></select></div>
                  <div><div className="vr-field-label">ظهور رسائل الانضمام</div><select className="vr-select" defaultValue="تشغيل"><option>تشغيل</option><option>إيقاف</option></select></div>
                  <div><div className="vr-field-label">كتم الرسائل غير المرغوبة</div><select className="vr-select" defaultValue="إيقاف"><option>إيقاف</option><option>تشغيل</option></select></div>
                  <div><div className="vr-field-label">الثيم</div><select className="vr-select" defaultValue="الثيم الافتراضي"><option>الثيم الافتراضي</option><option>فاتح</option><option>داكن</option></select></div>
                  <div><div className="vr-field-label">الأصوات</div><select className="vr-select" defaultValue="جميع الأصوات"><option>جميع الأصوات</option><option>إيقاف</option></select></div>
                </div>
                <div className="vr-field-label">فتح الخاص تلقائياً للرسائل غير المقروءة</div><select className="vr-select" defaultValue="إيقاف"><option>إيقاف</option><option>تشغيل</option></select>
              </div>}
              {profileTab==='more' && <div>
                <div className="vr-field-label">المزيد</div>
                <button className="vr-menu-item" onClick={() => setPreviewImage(selectedProfileUser.avatarUrl || VIDEO_PROFILE_AVATAR)}>🖼 معاينة الصورة</button>
                {selectedProfileUser.profileSongUrl&&<button className="vr-menu-item" onClick={()=>playProfileSong(selectedProfileUser.profileSongUrl)}>🎵 تشغيل الأغنية</button>}
                <button className="vr-menu-item" onClick={()=>setShowTopSearch(true)}>🔎 البحث عن المستخدم</button>
                <button className="vr-menu-item" onClick={()=>setSelectedProfileUser(null)}>✕ إغلاق</button>
              </div>}
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)} 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', cursor: 'pointer' }}
        >
          <img src={previewImage} alt="معاينة" style={{ maxWidth: '90%', maxHeight: '80dvh', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', objectFit: 'contain' }} />
        </div>
      )}

    </div>
  );
}
