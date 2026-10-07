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
    if (!selectedRoom || !user) return;

    let cleanupTimer: number | null = null;

    // Spark-safe cleanup: expired voice messages are removed from Firestore
    // by their sender while that sender has the room open. No Cloud Functions
    // or Cloud Storage are required for this step.
    const cleanupExpiredVoiceMessages = async () => {
      try {
        const expiredQuery = query(
          collection(db, 'rooms', selectedRoom.id, 'messages'),
          where('expiresAt', '<=', new Date()),
          limit(20)
        );
        const expiredSnapshot = await getDocs(expiredQuery);

        for (const docSnap of expiredSnapshot.docs) {
          const data = docSnap.data();
          if (data.mediaType !== 'voice' || data.userId !== user.uid) continue;
          try {
            await deleteDoc(docSnap.ref);
          } catch (error) {
            console.warn('تعذر حذف التسجيل الصوتي المنتهي', error);
          }
        }
      } catch (error) {
        console.warn('تعذر تنفيذ تنظيف التسجيلات الصوتية المنتهية', error);
      }
    };

    cleanupExpiredVoiceMessages();
    cleanupTimer = window.setInterval(cleanupExpiredVoiceMessages, 5 * 60 * 1000);

    const msgQuery = query(collection(db, 'rooms', selectedRoom.id, 'messages'), orderBy('createdAt', 'asc'), limitToLast(20));
    const unsubscribe = onSnapshot(msgQuery, (snapshot) => {
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

    return () => {
      unsubscribe();
      if (cleanupTimer) window.clearInterval(cleanupTimer);
    };
  }, [selectedRoom, user]);

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
      const mediaMessage: any = {
        user: senderName, userId: user.uid, text: '', role: roleText,
        color: nameColor, nameStyle, profileBgColor: hasRankForCustomization ? profileBgColor : '', avatarUrl: profileAvatar || '',
        mediaType, mediaData, mediaName, isSystemSpecial: false, createdAt: serverTimestamp()
      };

      if (mediaType === 'voice') {
        // Keep voice data in Firestore on Spark and mark it for client-side cleanup.
        mediaMessage.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      }

      await addDoc(collection(db, 'rooms', selectedRoom.id, 'messages'), mediaMessage);
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

      if (selectedRoom) {
        const isDemote = normalizedNewRole === 'Member' || normalizedNewRole === 'Guest';
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
      <div style={{ backgroundColor: '#0b141a', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', padding: '16px', direction: 'rtl', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0' }}>GAT CHAT 💬</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>منصة الدردشة العربية العصرية</p>
          </div>

          {errorMessage && <div style={{ color: '#ef4444', fontSize: '11px', background: 'rgba(239,68,68,0.15)', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(239,68,68,0.3)' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: '#22c55e', fontSize: '11px', background: 'rgba(34,197,94,0.15)', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '1px solid rgba(34,197,94,0.3)' }}>{successMessage}</div>}

          {authMode === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={() => { setAuthMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
                style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>✨</span>
                <span>إنشاء حساب جديد</span>
              </button>

              <button 
                onClick={() => { setAuthMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                style={{ width: '100%', padding: '12px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>🔑</span>
                <span>تسجيل الدخول</span>
              </button>

              <button 
                onClick={() => { setAuthMode('guest'); setErrorMessage(''); setSuccessMessage(''); }}
                style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>👤</span>
                <span>الدخول كزائر</span>
              </button>
            </div>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>الاسم المستعار</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="اكتب اسمك..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', boxSizing: 'border-box', background: '#111b21', color: '#fff' }} />
              </div>
              
              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>اختر الدولة</label>
                <select 
                  value={selectedCountry} 
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', boxSizing: 'border-box', background: '#111b21', color: '#fff', cursor: 'pointer' }}
                >
                  {COUNTRIES_LIST.filter(c => c !== 'عدم إظهار').map((c, i) => (
                    <option key={i} value={c} style={{ background: '#0b141a', color: '#fff' }}>
                      {c} {getCountryFlag(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', boxSizing: 'border-box', background: '#111b21', color: '#fff' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>كلمة المرور</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', boxSizing: 'border-box', background: '#111b21', color: '#fff' }} />
              </div>
              
              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '6px' }}>إنشاء حساب</button>
              <button type="button" onClick={() => setAuthMode('menu')} style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← رجوع للقائمة الرئيسية</button>
            </form>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', boxSizing: 'border-box', background: '#111b21', color: '#fff' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>كلمة المرور</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', boxSizing: 'border-box', background: '#111b21', color: '#fff' }} />
              </div>

              <div style={{ textAlign: 'left', marginTop: '-2px' }}>
                <button type="button" onClick={() => { setAuthMode('forgot'); setErrorMessage(''); setSuccessMessage(''); }} style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                  هل نسيت كلمة المرور؟
                </button>
              </div>

              <button type="submit" style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}>تسجيل الدخول</button>
              <button type="button" onClick={() => setAuthMode('menu')} style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← رجوع للقائمة الرئيسية</button>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور فوراً.
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', boxSizing: 'border-box', background: '#111b21', color: '#fff' }} />
              </div>
              <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>إرسال رابط الاستعادة</button>
              <button type="button" onClick={() => setAuthMode('login')} style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← العودة لتسجيل الدخول</button>
            </form>
          )}

          {authMode === 'guest' && (
            <form onSubmit={handleGuestLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>اسم الزائر</label>
                <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} required placeholder="اكتب اسمك المستعار..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px', boxSizing: 'border-box', background: '#111b21', color: '#fff' }} />
              </div>
              <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '6px' }}>دخول زائر</button>
              <button type="button" onClick={() => setAuthMode('menu')} style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>← رجوع للقائمة الرئيسية</button>
            </form>
          )}

        </div>
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
        <header className="video-topbar" style={{height:'48px',minHeight:'48px',flexShrink:0,background:'#003f45',color:'#fff',padding:'0 10px',display:'flex',justifyContent:'space-between',alignItems:'center',direction:'ltr',boxSizing:'border-box',zIndex:50}}>
          {currentView === 'rooms' ? (
            <>
              <div className="brand-logo" style={{fontSize:'22px'}}>Arabic<span style={{color:'#ff4d76'}}>chat</span></div>
              <div onClick={()=>{setShowSettingsModal(true);setSettingsTab('info')}} style={{width:'54px',height:'54px',borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(255,255,255,.5)',background:'#334155',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{profileAvatar?<img src={profileAvatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'25px'}}>👤</span>}</div>
            </>
          ) : (
            <>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <button onClick={()=>setShowMainMenu(true)} aria-label="القائمة" style={{background:'transparent',border:0,color:'#fff',cursor:'pointer',padding:0,display:'flex',alignItems:'center'}}><VideoIcon type="menu" size={23}/></button>
                <button onClick={()=>setShowTopSearch(true)} aria-label="البحث" style={{background:'transparent',border:0,color:'#fff',fontSize:'31px',lineHeight:1,cursor:'pointer',padding:0}}>⌕</button>
                <div style={{display:'flex',alignItems:'center',gap:'13px'}}><VideoIcon type="diamond" size={20}/></div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'11px'}}>
                <div onClick={()=>setShowMessagesModal(true)} style={{cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',fontSize:'9px',color:'#fff',position:'relative'}}><span style={{display:'flex'}}><VideoIcon type="mail" size={20}/></span><span>رسالة</span>{totalUnreadMessages>0&&<b style={{position:'absolute',top:'-6px',right:'-8px',background:'#ef233c',borderRadius:'4px',padding:'1px 5px',fontSize:'10px'}}>{totalUnreadMessages}</b>}</div>
                <div onClick={()=>setShowRequestsModal(true)} style={{cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',fontSize:'9px',color:'#fff',position:'relative'}}><span style={{display:'flex'}}><VideoIcon type="request" size={20}/></span><span>طلب</span>{pendingRequests.length>0&&<b style={{position:'absolute',top:'-6px',right:'-8px',background:'#ef233c',borderRadius:'4px',padding:'1px 5px',fontSize:'10px'}}>{pendingRequests.length}</b>}</div>
                <div onClick={handleOpenNotifications} style={{cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',fontSize:'9px',color:'#fff',position:'relative'}}><span style={{display:'flex'}}><VideoIcon type="bell" size={20}/></span><span>إشعار</span>{unreadNotificationsCount>0&&<b style={{position:'absolute',top:'-6px',right:'-8px',background:'#ef233c',borderRadius:'4px',padding:'1px 5px',fontSize:'10px'}}>{unreadNotificationsCount}</b>}</div>
                <div onClick={()=>{setShowSettingsModal(true);setSettingsTab('info')}} style={{cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',fontSize:'9px',color:'#fff'}}><span style={{display:'flex'}}><VideoIcon type="settings" size={20}/></span><span>اعدادات</span></div>
              </div>
            </>
          )}
        </header>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#ffffff', minHeight: 0, position: 'relative' }}>
        
        {currentView === 'rooms' && (
          <div className="video-room-list" style={{padding:'20px 20px 0',overflowY:'auto',flex:1,direction:'rtl',background:'#eeeeee'}}>
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
              <div key={room.id} className="video-room-card" style={{background:'#fff',borderRadius:'28px',padding:'18px 28px 14px',marginBottom:'14px',border:'1px solid #ddd',boxShadow:'0 1px 5px rgba(0,0,0,.08)',textAlign:'center'}}>
                <div style={{fontSize:'27px',fontWeight:'700',color:'#333',lineHeight:1.3}}><span style={{color:'#20a8d1',fontWeight:'800'}}>{count}</span> <span style={{color:'#62b70c'}}>♣</span> <span style={{color:'#aaa'}}>│</span> {room.name} <span style={{color:'#aaa'}}>│</span> {room.flag||'🌐'}</div>
                <button onClick={()=>enterRoom(room)} style={{marginTop:'12px',width:'100%',height:'58px',border:0,borderRadius:'30px',background:'#003f45',color:'#fff',fontSize:'20px',fontWeight:'700',cursor:'pointer'}}><span style={{background:'#69be00',borderRadius:'10px',padding:'3px 8px',marginLeft:'8px'}}>↪</span> دخول الغرفة</button>
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
        <nav className="video-bottom-nav" style={{height:'50px',minHeight:'50px',flexShrink:0,background:'#003f45',display:'flex',justifyContent:'space-between',alignItems:'center',direction:'ltr',padding:'0 5px',zIndex:10}}>
          <div onClick={()=>setShowRoomsModal(true)} style={{color:'#fff',cursor:'pointer',textAlign:'center',fontSize:'10px',flex:1,minWidth:0}}><div style={{fontSize:'20px',lineHeight:1,display:'flex',justifyContent:'center'}}><VideoIcon type="home" size={20}/></div><div>الغرف</div></div>
          <div onClick={()=>setShowOnlineModal(true)} style={{color:'#fff',cursor:'pointer',textAlign:'center',fontSize:'10px',flex:1,minWidth:0}}><div style={{fontSize:'20px',lineHeight:1,display:'flex',justifyContent:'center'}}><VideoIcon type="users" size={20}/></div><div>المتصلين</div></div>
          <div onClick={()=>setShowFriendsModal(true)} style={{color:'#fff',cursor:'pointer',textAlign:'center',fontSize:'10px',flex:1,minWidth:0}}><div style={{fontSize:'20px',lineHeight:1,display:'flex',justifyContent:'center'}}><VideoIcon type="userplus" size={20}/></div><div>الأصدقاء</div></div>
          <div onClick={()=>{setShowSettingsModal(true);setSettingsTab('options')}} style={{color:'#fff',cursor:'pointer',textAlign:'center',fontSize:'10px',flex:1,minWidth:0}}><div style={{fontSize:'20px',lineHeight:1,display:'flex',justifyContent:'center'}}><VideoIcon type="settings" size={20}/></div><div>خيارات</div></div>
        </nav>
      )}

      {showMainMenu && (
        <div className="video-drawer-overlay" onClick={()=>setShowMainMenu(false)} style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.38)',zIndex:260,direction:'rtl'}}>
          <div onClick={e=>e.stopPropagation()} style={{width:'44%',minWidth:'300px',maxWidth:'420px',height:'100%',background:'#fff',boxShadow:'8px 0 24px rgba(0,0,0,.2)',overflowY:'auto'}}>
            <button onClick={()=>setShowMainMenu(false)} style={{width:'100%',height:'52px',background:'#fff',border:0,borderBottom:'1px solid #ddd',fontSize:'30px',textAlign:'left',padding:'0 18px',cursor:'pointer'}}>×</button>
            {[
              ['🟢','متصل',()=>setShowOnlineModal(true)],['📡','حائط الأصدقاء',()=>setShowWallModal(true)],['📰','الأخبار',()=>setShowNewsModal(true)],['✉','إتصل بنا',()=>setShowMessagesModal(true)],['🔍','بحث',()=>setShowTopSearch(true)],['💎','كبار الشخصيات',()=>setShowVipModal(true)],['➕','المزيد',()=>{}],['f','تابعنا على فيسبوك',()=>{}],['▶','قناتنا على يوتيوب',()=>{}],['🤖','تطبيق الأندرويد',()=>{}]
            ].map(([icon,label,fn],i)=><button key={i} onClick={()=>{(fn as any)();setShowMainMenu(false)}} style={{width:'100%',height:'54px',background:'#fff',border:0,borderBottom:'1px solid #e5e5e5',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 18px',fontSize:'15px',color:'#444',cursor:'pointer'}}><span style={{fontSize:'20px'}}>{icon as any}</span><span>{label as any}</span></button>)}
          </div>
        </div>
      )}

      {showTopSearch && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'#fff',zIndex:270,direction:'rtl',display:'flex',flexDirection:'column'}}>
          <div style={{height:'82px',display:'flex',alignItems:'center',gap:'14px',padding:'0 18px',borderBottom:'1px solid #ddd'}}>
            <button onClick={()=>setShowTopSearch(false)} style={{border:0,background:'transparent',fontSize:'38px',color:'#444',cursor:'pointer'}}>×</button>
            <div style={{flex:1,fontSize:'21px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>البحث عن أشخاص <span style={{color:'#16a6d4',fontSize:'32px'}}>⌕</span></div><button type="button" onClick={()=>{setShowTopSearch(false);setShowVipModal(true)}} title="كبار الشخصيات" style={{border:0,background:'transparent',fontSize:'24px',cursor:'pointer'}}>⭐</button>
          </div>
          <div style={{textAlign:'center',fontSize:'18px',padding:'24px'}}>إعلان ترويجي</div>
          <div style={{flex:1,overflowY:'auto'}}>{onlineUsersList.filter(u=>u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u=><div key={u.id} onClick={()=>{setShowTopSearch(false);openUserProfile(u)}} style={{height:'86px',borderBottom:'1px solid #e5e5e5',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',cursor:'pointer'}}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><span style={{fontSize:'20px',fontWeight:'700',color:'#333'}}>{u.name}</span></div><div style={{width:'58px',height:'58px',borderRadius:'50%',overflow:'hidden',border:'3px solid #17a7d2',background:'#eee'}}>{u.avatarUrl?<img src={u.avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%'}}>👤</span>}</div></div>)}</div>
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
        <div style={{position:'fixed',inset:0,zIndex:282,background:'rgba(0,0,0,.45)',display:'flex',justifyContent:'center',alignItems:'center',direction:'rtl',padding:'10px'}} onClick={()=>setShowVipModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:'370px',maxHeight:'82dvh',background:'#fff',borderRadius:'10px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{height:'48px',background:'#004247',color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 12px'}}><b style={{fontSize:'14px'}}>كبار الشخصيات 💎</b><button onClick={()=>setShowVipModal(false)} style={{background:'none',border:0,color:'#fff',fontSize:'26px'}}>×</button></div>
            <div style={{flex:1,overflowY:'auto',padding:'7px'}}>{rankedUsers.filter(u=>['Owner','Super Admin','Admin'].includes(normalizeRole(u.role)) || String(u.email||'').trim().toLowerCase()===ADMIN_EMAIL.trim().toLowerCase()).map((u:any,i:number)=><div key={u.id} onClick={()=>{setShowVipModal(false);openUserProfile(u);}} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px',borderBottom:'1px solid #eee',cursor:'pointer'}}><b style={{width:'24px',fontSize:'12px',color:'#b45309'}}>{i+1}</b><div style={{width:'40px',height:'40px',borderRadius:'50%',overflow:'hidden',background:'#0284c7',display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid '+(u.nameColor||'#17a7d2')}}>{u.avatarUrl?<img src={u.avatarUrl} alt='' style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'👤'}</div><div style={{minWidth:0}}><div style={{fontSize:'12px',fontWeight:'bold',color:u.nameColor||'#2563eb'}}>{u.displayName||u.name||'مستخدم'}</div><div style={{fontSize:'10px',color:'#64748b'}}>{(String(u.email||'').trim().toLowerCase()===ADMIN_EMAIL.trim().toLowerCase()||normalizeRole(u.role)==='Owner')?'صاحب الموقع':normalizeRole(u.role)}</div><div style={{fontSize:'9px',color:'#94a3b8'}}>{u.country||''} {u.flag||''}</div></div></div>)}</div>
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
        <div className="video-profile-backdrop"
          onClick={() => { stopProfileSong(); setSelectedProfileUser(null); }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 120, display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'rtl', padding: '12px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '100%', 
              maxWidth: '360px', 
              backgroundColor: selectedProfileUser.profileBgColor || '#ffffff', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column', 
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)', 
              border: '1px solid #1e293b', 
              maxHeight: '90dvh',
              transition: 'background-color 0.3s ease'
            }}
          >
            
            <div style={{ position: 'relative', width: '100%', backgroundColor: '#0b1724', minHeight: '280px', overflow: 'hidden' }}>
              
              <div 
                onClick={() => {
                  if (canEditCover) {
                    coverInputRef.current?.click();
                  } else if (selectedProfileUser.coverUrl) {
                    setPreviewImage(selectedProfileUser.coverUrl);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: selectedProfileUser.coverUrl ? `url(${selectedProfileUser.coverUrl})` : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  cursor: (canEditCover || selectedProfileUser.coverUrl) ? 'pointer' : 'default'
                }}
              />

              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(11,23,36,0.2) 0%, rgba(11,23,36,0.85) 100%)', pointerEvents: 'none' }} />

              <button 
                onClick={(e) => { e.stopPropagation(); stopProfileSong(); setSelectedProfileUser(null); }} 
                style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#ffffff', fontSize: '16px', cursor: 'pointer', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 10 }}
              >
                ✕
              </button>

              {canAddSong && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {selectedProfileUser.profileSongUrl ? (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); songInputRef.current?.click(); }}
                        style={{ background: 'rgba(34,197,94,0.9)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>🎵</span>
                        <span>تغيير الأغنية</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteSong(); }}
                        style={{ background: 'rgba(220,38,38,0.9)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); songInputRef.current?.click(); }}
                      style={{ background: 'rgba(124,58,237,0.9)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>🎵</span>
                      <span>إضافة أغنية</span>
                    </button>
                  )}
                </div>
              )}

              <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'center', paddingBottom: '14px', width: '100%' }}>
                
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div 
                    onClick={() => {
                      if (canEditAvatar) {
                        avatarInputRef.current?.click();
                      } else if (selectedProfileUser.avatarUrl) {
                        setPreviewImage(selectedProfileUser.avatarUrl);
                      }
                    }}
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      fontWeight: 'bold',
                      border: '3px solid #ffffff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      cursor: (canEditAvatar || selectedProfileUser.avatarUrl) ? 'pointer' : 'default'
                    }}
                  >
                    {selectedProfileUser.avatarUrl ? (
                      <img src={selectedProfileUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      '👤'
                    )}
                  </div>

                  {canEditAvatar && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); avatarInputRef.current?.click(); }}
                      style={{ position: 'absolute', bottom: '0', right: '0', backgroundColor: '#0284c7', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '2px solid #ffffff', cursor: 'pointer' }}
                    >
                      📷
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', padding: '2px 10px', borderRadius: '12px', marginTop: '6px' }}>
                  {selectedProfileUser.role}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px', width: '100%' }}>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', ...getNameStyleProps(selectedProfileUser.nameStyle || 'normal', selectedProfileUser.nameColor || '#2563eb') }}>
                    {selectedProfileUser.name}
                  </span>
                  {canModifyTargetName && (
                    <span 
                      onClick={() => setIsEditingNameActive(!isEditingNameActive)}
                      style={{ cursor: 'pointer', fontSize: '14px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      title="تعديل الاسم"
                    >
                      ✏️
                    </span>
                  )}
                </div>

              </div>

              {canEditCover && (
                <button 
                  onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
                  style={{ position: 'absolute', top: '46px', right: '12px', background: 'rgba(0,0,0,0.75)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>📷</span>
                  <span>تغيير الغلاف</span>
                </button>
              )}

            </div>

            <div style={{ padding: '14px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#334155' }}>
              
              {isEditingNameActive && canModifyTargetName && (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#0f172a', marginBottom: '6px' }}>✏️ تعديل اسم المستخدم:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input 
                      type="text" 
                      value={editingUserName} 
                      onChange={(e) => setEditingUserName(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    />
                    <button 
                      onClick={handleUpdateUserName}
                      style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '6px' }}>
                <span style={{ opacity: 0.7 }}>الجنس:</span>
                <span style={{ fontWeight: 'bold' }}>{selectedProfileUser.gender}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '6px' }}>
                <span style={{ opacity: 0.7 }}>تاريخ الانضمام:</span>
                <span style={{ fontWeight: 'bold' }}>{selectedProfileUser.joinedDate}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '6px' }}>
                <span style={{ opacity: 0.7 }}>المتواجد حالياً في:</span>
                <span style={{ fontWeight: 'bold', color: '#0284c7' }}>{selectedProfileUser.roomName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '6px' }}>
                <span style={{ opacity: 0.7 }}>آخر ظهور:</span>
                <span style={{ fontWeight: 'bold' }}>{selectedProfileUser.lastSeen}</span>
              </div>

              {isAdmin && !isSelfProfile && !['Owner', 'Admin', 'Super Admin'].includes(normalizeRole(selectedProfileUser?.role)) && (
                <div style={{ marginTop: '10px', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#991b1b', marginBottom: '6px' }}>🚫 لوحة الطرد (للأعضاء والزوار فقط):</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                    <button onClick={() => handleKickUser(selectedProfileUser.userId, 1)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>دقيقة 1</button>
                    <button onClick={() => handleKickUser(selectedProfileUser.userId, 5)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>5 دقائق</button>
                    <button onClick={() => handleKickUser(selectedProfileUser.userId, 30)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>30 دقيقة</button>
                    <button onClick={() => handleKickUser(selectedProfileUser.userId, 60)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ساعة</button>
                    <button onClick={() => handleKickUser(selectedProfileUser.userId, 120)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>ساعتين</button>
                    <button onClick={() => handleKickUser(selectedProfileUser.userId, 180)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 4px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>3 ساعات</button>
                  </div>
                </div>
              )}

              {isOwner && !isSelfProfile && (
                <div style={{ marginTop: '10px', backgroundColor: 'rgba(255,255,255,0.6)', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#0f172a', marginBottom: '6px' }}>لوحة التحكم بالرتب (للمالك فقط):</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                    <button onClick={() => handleUpdateUserRole(selectedProfileUser.userId, 'Admin')} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Set Admin 👑</button>
                    <button onClick={() => handleUpdateUserRole(selectedProfileUser.userId, 'Super Admin')} style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Set Super Admin ⚡</button>
                    <button onClick={() => handleUpdateUserRole(selectedProfileUser.userId, 'Premium')} style={{ backgroundColor: '#eab308', color: '#000', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Set Premium 💎</button>
                    <button onClick={() => handleUpdateUserRole(selectedProfileUser.userId, 'Member')} style={{ backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Demote Member 👤</button>
                  </div>
                </div>
              )}

              {!isSelfProfile && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button 
                    onClick={() => openPrivateChatWithUser(selectedProfileUser.userId, selectedProfileUser.name)}
                    style={{ flex: 1, backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    محادثة خاصة ✉️
                  </button>
                  <button 
                    onClick={() => handleSendFriendRequest(selectedProfileUser.userId, selectedProfileUser.name)}
                    style={{ flex: 1, backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    إضافة صديق 👤⁺
                  </button>
                </div>
              )}

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
