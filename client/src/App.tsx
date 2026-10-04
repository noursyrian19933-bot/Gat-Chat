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
  updateDoc 
} from 'firebase/firestore';

// 🔹 الخطوة أ: استيراد Realtime Database
import { getDatabase, ref, child, get, set, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBYMtDF5lcLhSc2vvNlvkH0VkYV-PaoL2I",
  authDomain: "gat-chat-b7187.firebaseapp.com",
  projectId: "gat-chat-b7187",
  storageBucket: "gat-chat-b7187.firebasestorage.app",
  messagingSenderId: "1062482533282",
  appId: "1:1062482533282:web:745104a6415898bac530fb",
  measurementId: "G-ZW607L85LT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rdb = getDatabase(app); // 🔹 تهيئة Realtime Database

const ADMIN_EMAIL = "nour.syrian.19933@gmail.com";

// قائمة الألوان الجاهزة لتغيير لون مربع الملف الشخصي بالكامل فورياً
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
    case 'سوريا': return '🇸🇾';
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

const EMOJIS_LIST = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
  "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
  "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", 
  "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", 
  "❤", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", 
  "👍", "👎", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅"
];

// دالة لتطبيق تأثيرات زخرفة الأسماء
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

export default function App() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
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
  
  const [messages, setMessages] = useState<Array<{ id: string; user: string; text: string; role?: string; userId?: string; color?: string; nameStyle?: string; avatarUrl?: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsersList, setOnlineUsersList] = useState<Array<any>>([]);
  
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  const [activePrivateChat, setActivePrivateChat] = useState<{ peerId: string; peerName: string } | null>(null);
  const [privateMessages, setPrivateMessages] = useState<Array<any>>([]);
  const [privateInputText, setPrivateInputText] = useState('');
  const [privateConversations, setPrivateConversations] = useState<Array<any>>([]);

  const [pendingRequests, setPendingRequests] = useState<Array<any>>([]);
  const [notificationsList, setNotificationsList] = useState<Array<any>>([]);
  const [friendsList, setFriendsList] = useState<Array<any>>([]);
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'info' | 'friends' | 'ignore' | 'options' | 'more'>('info');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const [selectedProfileUser, setSelectedProfileUser] = useState<any | null>(null);

  const [profileGender, setProfileGender] = useState('ذكر');
  const [profileCountry, setProfileCountry] = useState('الأردن');
  const [profileBio, setProfileBio] = useState('');
  const [currentFlag, setCurrentFlag] = useState('🇯🇴');
  const [nameColor, setNameColor] = useState('#2563eb');
  const [nameStyle, setNameStyle] = useState('normal'); 
  const [profileBgColor, setProfileBgColor] = useState('#ffffff'); 
  const [currentUserRole, setCurrentUserRole] = useState<string>('Member');

  const [profileAvatar, setProfileAvatar] = useState<string>('');
  const [profileCover, setProfileCover] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // 🎵 States للأغنية
  const [profileSong, setProfileSong] = useState<string>('');
  const [isSongPlaying, setIsSongPlaying] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const songInputRef = useRef<HTMLInputElement | null>(null);
  const profileAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const privateChatBottomRef = useRef<HTMLDivElement | null>(null);

  // 🔐 نظام الرتب والصلاحيات
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
    Owner: ['manage_roles', 'manage_admins', 'manage_rooms', 'manage_users', 'edit_avatar', 'edit_cover', 'add_song', 'custom_profile'],
    Admin: ['manage_users', 'edit_avatar', 'edit_cover', 'add_song', 'custom_profile'],
    'Super Admin': ['manage_users', 'edit_avatar', 'edit_cover', 'add_song', 'custom_profile'],
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

  const isPremium = Boolean(
    user &&
    !user.isAnonymous &&
    normalizedCurrentRole === 'Premium'
  );

  // هل المستخدم يمتلك رتبة تؤهله لتخصيص لون الخلفية والزخرفة (صاحب الموقع، آدمن، سوبر آدمن، بريميوم)
  const hasRankForCustomization = Boolean(
    isOwner || isAdmin || isPremium || ['Owner', 'Admin', 'Super Admin', 'Premium'].includes(normalizedCurrentRole)
  );

  const hasCurrentPermission = (permission: string) =>
    isOwner || (rolePermissions[normalizedCurrentRole] || []).includes(permission);

  // 🔹 مراقبة بيانات المستخدم الحالية
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
            } else {
              try {
                const snapshot = await get(child(ref(rdb), `users/${currentUser.uid}`));
                if (snapshot.exists()) {
                  const rdbData = snapshot.val();
                  if (rdbData?.role || rdbData?.rank) {
                    activeRole = normalizeRole(rdbData.role || rdbData.rank);
                  }
                }
              } catch (error) {
                console.error("خطأ في Realtime DB:", error);
              }
            }
          } catch (e) {
            console.error("خطأ أثناء جلب الرتبة المربوطة بالإيميل:", e);
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
            permissions: rolePermissions[normalizeRole(activeRole)] || [],
            flag: '🇯🇴',
            country: 'الأردن',
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

          if (currentUser.email && cleanEmail !== ownerEmail) {
            try {
              await setDoc(
                doc(db, 'roles_by_email', cleanEmail),
                {
                  uid: currentUser.uid,
                  email: cleanEmail,
                  role: activeRole,
                  permissions: rolePermissions[normalizeRole(activeRole)] || [],
                  updatedAt: serverTimestamp()
                },
                { merge: true }
              );
            } catch (e) {
              console.warn("تعذر ربط الإيميل تلقائياً:", e);
            }
          }
        }
      }
    });
    return () => unsubscribeAuth();
  }, [guestName]);

  // 🔹 مستمع لحظي لملف المستخدم + الرتبة
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
          console.error("خطأ في المستمع اللحظي لرتبة البريد:", error);
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
      
      await setDoc(presenceRef, { lastSeen: nowTime, lastActive: 0 }, { merge: true });
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
      setDoc(presenceRef, { lastSeen: nowTime, lastActive: 0 }, { merge: true }).catch(() => {});
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
    const q = query(
      collection(db, 'users', user.uid, 'private_chats'),
      orderBy('lastMessageTime', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      }));
      setPrivateConversations(convs);
    });
  }, [user]);

  useEffect(() => {
    if (!user || !activePrivateChat) return;
    const chatId = [user.uid, activePrivateChat.peerId].sort().join('_');
    const msgQuery = query(
      collection(db, 'private_messages', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(msgQuery, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      }));
      setPrivateMessages(msgs);
      setTimeout(() => {
        privateChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  }, [user, activePrivateChat]);

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
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      }));
      setNotificationsList(notes);
    });
  }, [user]);

  const handleOpenNotifications = async () => {
    setShowNotificationsModal(true);
    if (!user || notificationsList.length === 0) return;
    try {
      const notifSnapshot = await getDocs(collection(db, 'users', user.uid, 'notifications'));
      const deletePromises = notifSnapshot.docs.map(d => deleteDoc(doc(db, 'users', user.uid, 'notifications', d.id)));
      await Promise.all(deletePromises);
      setNotificationsList([]);
    } catch (e) {
      console.error("خطأ أثناء مسح الإشعارات:", e);
    }
  };

  useEffect(() => {
    if (!user) return;
    const friendsRef = collection(db, 'users', user.uid, 'friends');
    return onSnapshot(friendsRef, (snapshot) => {
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      }));
      setFriendsList(list);
    });
  }, [user]);

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

  // 🎵 اختيار الأغنية
  const handleSongSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('⚠️ حجم الأغنية كبير جداً. الحد الأقصى 3 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setProfileSong(base64);
      setSelectedProfileUser((prev: any) => prev ? { ...prev, profileSongUrl: base64 } : null);
      await saveSettingToFirebase('profileSongUrl', base64);
      alert('✅ تم حفظ الأغنية بنجاح!');
    };
    e.target.value = '';
  };

  // 🎵 تشغيل الأغنية
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
        console.warn('تعذر تشغيل الأغنية:', err);
        setIsSongPlaying(false);
      });
    audio.onended = () => setIsSongPlaying(false);
    profileAudioRef.current = audio;
  };

  // 🎵 إيقاف الأغنية
  const stopProfileSong = () => {
    if (profileAudioRef.current) {
      profileAudioRef.current.pause();
      profileAudioRef.current.currentTime = 0;
      profileAudioRef.current = null;
    }
    setIsSongPlaying(false);
  };

  // 🎵 حذف الأغنية
  const handleDeleteSong = async () => {
    if (!user) return;
    if (!confirm('هل تريد حذف الأغنية من ملفك الشخصي؟')) return;
    setProfileSong('');
    setSelectedProfileUser((prev: any) => prev ? { ...prev, profileSongUrl: '' } : null);
    await saveSettingToFirebase('profileSongUrl', '');
    stopProfileSong();
    alert('🗑️ تم حذف الأغنية.');
  };

  useEffect(() => {
    const initRoomsAndListen = async () => {
      const roomsCol = collection(db, 'rooms');
      const snapshot = await getDocs(roomsCol);
      if (snapshot.empty) {
        const defaultRooms = [
          { name: 'غرفة الأردن', flag: '🇯🇴' },
          { name: 'غرفة العامة', flag: '🌐' },
          { name: 'غرفة مصر', flag: '🇪🇬' },
          { name: 'غرفة الجزائر', flag: '🇩🇿' },
          { name: 'غرفة سوريا', flag: '🇸🇾' },
          { name: 'غرفة السعودية', flag: '🇸🇦' },
          { name: 'غرفة العراق', flag: '🇮🇶' },
          { name: 'غرفة فلسطين', flag: '🇵🇸' },
          { name: 'الدردشة الحرة', flag: '💬' }
        ];
        for (const r of defaultRooms) {
          await addDoc(roomsCol, r);
        }
      }
      return onSnapshot(roomsCol, (snap) => {
        const fetchedRooms = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        setRooms(fetchedRooms);

        const savedId = localStorage.getItem('gat_current_room_id');
        if (savedId) {
          const found = fetchedRooms.find(r => r.id === savedId);
          if (found) {
            setSelectedRoom(found);
            setCurrentView('chat');
          }
        }
      });
    };
    let unsub: any;
    initRoomsAndListen().then(u => { unsub = u; });
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
    const userName = user.isAnonymous 
      ? (user.displayName || storedGuest || 'زائر') 
      : (user.displayName || user.email?.split('@')[0] || 'عضو');
    
    const roomId = selectedRoom ? selectedRoom.id : 'lobby';
    const roomName = selectedRoom ? selectedRoom.name : 'القائمة الرئيسية';
    
    const presenceRef = doc(db, 'room_presence', user.uid);
    const todayDate = new Date().toISOString().split('T')[0];

    const updatePresence = async () => {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let currentRole = user.isAnonymous ? 'Guest' : (isOwner ? 'Owner' : normalizeRole(currentUserRole));

      setDoc(presenceRef, {
        roomId: roomId,
        roomName: roomName,
        userId: user.uid,
        userName: userName,
        email: (user.email || '').trim().toLowerCase(),
        role: currentRole,
        flag: currentFlag,
        gender: profileGender,
        country: profileCountry,
        avatarUrl: profileAvatar,
        coverUrl: profileCover,
        profileSongUrl: profileSong,
        nameColor: nameColor,
        nameStyle: nameStyle,
        profileBgColor: profileBgColor,
        joinedDate: todayDate,
        lastSeen: nowTime,
        lastActive: Date.now(),
        points: 0
      }, { merge: true });
    };

    updatePresence();
    const presenceInterval = setInterval(updatePresence, 10000);

    return () => {
      clearInterval(presenceInterval);
    };
  }, [selectedRoom, user, currentFlag, profileGender, profileCountry, guestName, isAdmin, profileAvatar, profileCover, profileSong, currentUserRole, nameColor, nameStyle, profileBgColor]);

  useEffect(() => {
    return onSnapshot(collection(db, 'room_presence'), (snapshot) => {
      const counts: { [roomId: string]: number } = {};
      const uniqueUsersMap = new Map<string, any>();
      const now = Date.now();
      const FIVE_MINUTES = 5 * 60 * 1000;

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const uId = data.userId || docSnap.id;
        const isRecentlyActive = data.lastActive && (now - data.lastActive < FIVE_MINUTES);

        if (isRecentlyActive && uId) {
          if (!uniqueUsersMap.has(uId) || (uniqueUsersMap.get(uId).lastActive < data.lastActive)) {
            uniqueUsersMap.set(uId, {
              id: docSnap.id,
              userId: uId,
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
              lastSeen: data.lastSeen || '01:00 AM',
              points: data.points || 0,
              roomId: data.roomId,
              roomName: data.roomName || 'القائمة الرئيسية',
              lastActive: data.lastActive
            });
          }
        }
      });

      const activeUsersList = Array.from(uniqueUsersMap.values());

      activeUsersList.forEach(u => {
        if (u.roomId && u.roomId !== 'lobby') {
          counts[u.roomId] = (counts[u.roomId] || 0) + 1;
        }
      });

      setRoomCounts(counts);
      setOnlineUsersList(activeUsersList);
    });
  }, [selectedRoom]);

  useEffect(() => {
    if (!selectedRoom) return;
    const msgQuery = query(collection(db, 'rooms', selectedRoom.id, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(msgQuery, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as any)
      }));
      setMessages(msgs);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  }, [selectedRoom]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: displayName });
      await sendEmailVerification(userCredential.user);
      setSuccessMessage('✅ تم إنشاء الحساب! تفقد بريدك للتفعيل.');
      await signOut(auth);
      setAuthMode('login');
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

  const enterRoom = (room: { id: string; name: string; flag?: string }) => {
    setSelectedRoom(room);
    setCurrentView('chat');
    localStorage.setItem('gat_current_room_id', room.id);
    localStorage.setItem('gat_current_room_name', room.name);
    localStorage.setItem('gat_current_room_flag', room.flag || '💬');
  };

  const leaveRoomToLobby = async () => {
    await updateLastSeenOnExit();
    setSelectedRoom(null);
    setCurrentView('rooms');
    localStorage.removeItem('gat_current_room_id');
    localStorage.removeItem('gat_current_room_name');
    localStorage.removeItem('gat_current_room_flag');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRoom || !user) return;
    const storedGuest = localStorage.getItem('gat_guest_name') || guestName;
    const senderName = user.isAnonymous 
      ? (user.displayName || storedGuest || 'زائر') 
      : (user.displayName || user.email?.split('@')[0] || 'عضو');

    let roleText = user.isAnonymous ? 'Guest' : (isOwner ? 'Owner' : normalizeRole(currentUserRole));

    try {
      await addDoc(collection(db, 'rooms', selectedRoom.id, 'messages'), {
        user: senderName,
        userId: user.uid,
        text: inputText.trim(),
        role: roleText,
        color: nameColor,
        nameStyle: nameStyle,
        avatarUrl: profileAvatar || '',
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
    if (peerId === user.uid) {
      alert('لا يمكنك مراسلة نفسك!');
      return;
    }
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
    if (targetUserId === user.uid) {
      alert('لا يمكنك إرسال طلب صداقة لنفسك!');
      return;
    }
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
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      alert(`✅ تم إرسال طلب الصداقة إلى ${targetUserName}!`);
      setSelectedProfileUser(null);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء إرسال الطلب');
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
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      alert('🎉 تم قبول طلب الصداقة بنجاح!');
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
      alert('تم إزالة الصديق من القائمة');
    } catch (e) {
      console.error(e);
    }
  };

  // 👑 إدارة الرتب
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
          console.warn("تعذر البحث في roles_by_email:", e);
        }
      }

      if (!targetEmail) {
        try {
          const presenceSnap = await getDoc(doc(db, 'room_presence', targetUid));
          if (presenceSnap.exists()) {
            targetEmail = String(presenceSnap.data().email || '').trim().toLowerCase();
          }
        } catch (e) {
          console.warn("تعذر البحث في room_presence:", e);
        }
      }

      if (!targetEmail) {
        alert('❌ لا يمكن تغيير الرتبة: هذا المستخدم لا يملك بريد إلكتروني مسجل (زائر).');
        return;
      }

      const targetUserName =
        targetUserData.displayName ||
        selectedProfileUser?.name ||
        'المستخدم';

      const permissions = rolePermissions[normalizedNewRole] || [];

      await setDoc(
        doc(db, 'roles_by_email', targetEmail),
        {
          uid: targetUid,
          email: targetEmail,
          role: normalizedNewRole,
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
          role: normalizedNewRole,
          permissions,
          roleUpdatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      await setDoc(
        doc(db, 'room_presence', targetUid),
        {
          email: targetEmail,
          role: normalizedNewRole,
          permissions
        },
        { merge: true }
      );

      try {
        await update(ref(rdb, `users/${targetUid}`), {
          role: normalizedNewRole,
          permissions,
          email: targetEmail
        });
      } catch (rdbErr) {
        console.warn("تنبيه: فشل تحديث Realtime DB (غير حرج):", rdbErr);
      }

      if (selectedRoom) {
        const roomMsg =
          normalizedNewRole === 'Member' || normalizedNewRole === 'Guest'
            ? `⚠️ تم سحب الرتبة من ${targetUserName} وأصبح ${normalizedNewRole}`
            : `🎁 تم إهداء ${targetUserName} الرتبة: ${normalizedNewRole}`;

        await addDoc(collection(db, 'rooms', selectedRoom.id, 'messages'), {
          user: 'نظام الشات',
          userId: 'system',
          text: roomMsg,
          role: 'System',
          color: '#eab308',
          createdAt: serverTimestamp()
        });
      }

      const notifTitle =
        normalizedNewRole === 'Member' || normalizedNewRole === 'Guest'
          ? 'تحديث الرتبة ⚠️'
          : 'هدايا الرتب 🎁';

      const notifBody =
        normalizedNewRole === 'Member' || normalizedNewRole === 'Guest'
          ? `تم سحب الرتبة منك وتحديثها إلى ${normalizedNewRole}.`
          : `مبروك! تم إهداؤك رتبة (${normalizedNewRole}) وتفعيل صلاحيات الحساب وصورة الغلاف وزخرفة وتلوين الملف الشخصي.`;

      await addDoc(collection(db, 'users', targetUid, 'notifications'), {
        title: notifTitle,
        body: notifBody,
        createdAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      });

      setSelectedProfileUser((prev: any) =>
        prev
          ? {
              ...prev,
              role: normalizedNewRole,
              email: targetEmail,
              permissions
            }
          : null
      );

      alert(`✅ تم تعديل رتبة المستخدم بنجاح إلى: ${normalizedNewRole}`);
    } catch (e: any) {
      console.error("خطأ في تعديل الرتبة:", e);
      alert(`❌ حدث خطأ أثناء تغيير الرتبة: ${e.message}`);
    }
  };

  const toggleRadio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://stream.radio9090.com/9090fm');
    }
    if (isPlayingRadio) {
      audioRef.current.pause();
      setIsPlayingRadio(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlayingRadio(true);
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
      joinedDate: uData.joinedDate || new Date().toISOString().split('T')[0],
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
            console.warn("تعذر جلب الإيميل من roles_by_email:", e);
          }
        }
      } catch (err) {
        console.error("خطأ أثناء جلب بيانات الملف الشخصي:", err);
      }
    }
    setSelectedProfileUser(fetchedData);
  };

  // 🎵 تشغيل/إيقاف الأغنية تلقائياً
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

  const filteredOnlineUsers = onlineUsersList.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFriendsList = friendsList.filter(f => f.name.toLowerCase().includes(friendsSearchQuery.toLowerCase()));

  const totalUnreadMessages = privateConversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

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
      <div style={{ backgroundColor: '#0b141a', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', padding: '16px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '380px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', direction: 'rtl' }}>
          
          <div style={{ display: 'flex', marginBottom: '16px', borderBottom: '2px solid #cbd5e1' }}>
            <button style={{ flex: 1, padding: '8px', background: authMode === 'login' ? '#0b141a' : 'transparent', color: authMode === 'login' ? '#fff' : '#0b141a', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }} onClick={() => setAuthMode('login')}>دخول</button>
            <button style={{ flex: 1, padding: '8px', background: authMode === 'register' ? '#0b141a' : 'transparent', color: authMode === 'register' ? '#fff' : '#0b141a', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }} onClick={() => setAuthMode('register')}>تسجيل حساب</button>
            <button style={{ flex: 1, padding: '8px', background: authMode === 'guest' ? '#0b141a' : 'transparent', color: authMode === 'guest' ? '#fff' : '#0b141a', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }} onClick={() => setAuthMode('guest')}>زائر</button>
          </div>

          {errorMessage && <div style={{ color: '#b91c1c', fontSize: '11px', background: '#fee2e2', padding: '8px', borderRadius: '4px', marginBottom: '10px' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: '#15803d', fontSize: '11px', background: '#dcfce7', padding: '8px', borderRadius: '4px', marginBottom: '10px' }}>{successMessage}</div>}

          {authMode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>كلمة المرور</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: '#0b141a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '6px' }}>تسجيل الدخول</button>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>الاسم المستعار</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>كلمة المرور</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: '#15803d', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '6px' }}>إنشاء حساب</button>
            </form>
          )}

          {authMode === 'guest' && (
            <form onSubmit={handleGuestLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>اسم الزائر</label>
                <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} required placeholder="اكتب اسمك..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '6px' }}>دخول زائر</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const isSelfProfile = Boolean(user && selectedProfileUser && user.uid === selectedProfileUser.userId);
  const profileUserRole = normalizeRole(selectedProfileUser?.role);

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

  return (
    <div style={{ height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#0b141a', overflow: 'hidden', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, boxSizing: 'border-box' }}>
      
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

      <header style={{ height: '50px', minHeight: '50px', flexShrink: 0, backgroundColor: '#0b141a', color: '#fff', padding: '0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', direction: 'rtl', boxSizing: 'border-box', zIndex: 10 }}>
        
        <div style={{ cursor: 'pointer', fontSize: '22px', color: '#fff', padding: '0 4px', lineHeight: '1' }}>
          ☰
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
          <div onClick={() => { setShowSettingsModal(true); setSettingsTab('info'); }} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', color: '#cbd5e1', minWidth: '36px' }}>
            <span style={{ fontSize: '16px', lineHeight: '1' }}>👤</span>
            <span style={{ marginTop: '2px', whiteSpace: 'nowrap' }}>اعدادات</span>
          </div>

          <div onClick={handleOpenNotifications} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', color: '#cbd5e1', minWidth: '36px', position: 'relative' }}>
            <span style={{ fontSize: '16px', lineHeight: '1' }}>🔔</span>
            <span style={{ marginTop: '2px', whiteSpace: 'nowrap' }}>إشعار</span>
            {notificationsList.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '0px', backgroundColor: '#eab308', color: '#000000', fontSize: '9px', fontWeight: 'bold', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffffff' }}>
                {notificationsList.length}
              </span>
            )}
          </div>

          <div onClick={() => setShowRequestsModal(true)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', color: '#cbd5e1', minWidth: '36px', position: 'relative' }}>
            <span style={{ fontSize: '16px', lineHeight: '1' }}>👤⁺</span>
            <span style={{ marginTop: '2px', whiteSpace: 'nowrap' }}>طلب</span>
            {pendingRequests.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '0px', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '9px', fontWeight: 'bold', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffffff' }}>
                {pendingRequests.length}
              </span>
            )}
          </div>

          <div onClick={() => setShowMessagesModal(true)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', color: '#cbd5e1', minWidth: '36px', position: 'relative' }}>
            <span style={{ fontSize: '16px', lineHeight: '1' }}>✉️</span>
            <span style={{ marginTop: '2px', whiteSpace: 'nowrap' }}>رسالة</span>
            {totalUnreadMessages > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '0px', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '9px', fontWeight: 'bold', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ffffff' }}>
                {totalUnreadMessages}
              </span>
            )}
          </div>

          <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', color: '#cbd5e1', minWidth: '36px' }}>
            <span style={{ fontSize: '16px', lineHeight: '1' }}>👑</span>
            <span style={{ marginTop: '2px', whiteSpace: 'nowrap' }}>الأثرياء</span>
          </div>
          <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '9px', color: '#cbd5e1', minWidth: '36px' }}>
            <span style={{ fontSize: '16px', lineHeight: '1' }}>💎</span>
            <span style={{ marginTop: '2px', whiteSpace: 'nowrap' }}>الكبار</span>
          </div>
        </div>

      </header>

      <div style={{ backgroundColor: '#ffffff', color: '#000', fontSize: '12px', fontWeight: 'bold', padding: '2px 10px', textAlign: 'right', borderBottom: '1px solid #cbd5e1', flexShrink: 0, direction: 'rtl' }}>
        .Points
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f1f5f9', minHeight: 0, position: 'relative' }}>
        
        {currentView === 'rooms' && (
          <div style={{ padding: '8px', overflowY: 'auto', flex: 1, direction: 'rtl', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rooms.map((room) => {
              const count = roomCounts[room.id] || 0;
              return (
                <div key={room.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <button 
                    onClick={() => enterRoom(room)}
                    style={{ backgroundColor: '#0b141a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>دخول الغرفة</span>
                    <span>🚪</span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#1e293b', fontSize: '13px' }}>
                    <span>{room.flag}</span>
                    <span>{room.name}</span>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>||</span>
                    <span style={{ color: '#059669', fontSize: '12px' }}>{count} 👥</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentView === 'chat' && selectedRoom && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            
            <div style={{ flex: 1, padding: '0', overflowY: 'auto', display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
              
              {messages.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  لا توجد رسائل في هذه الغرفة بعد. اكتب شيئاً وابدأ المحادثة! 💬
                </div>
              ) : (
                messages.map((m, idx) => {
                  const styleProps = getNameStyleProps(m.nameStyle || 'normal', m.color || '#0284c7');
                  return (
                    <div key={m.id || idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', padding: '8px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', direction: 'rtl' }}>
                      
                      <div onClick={() => openUserProfile(m)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', flexShrink: 0, cursor: 'pointer', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          '👤'
                        )}
                      </div>

                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '12px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }}>🚩</span>
                        <span style={{ fontWeight: 'bold', cursor: 'pointer', ...styleProps }} onClick={() => openUserProfile(m)}>
                          {m.user}:
                        </span>
                        <span style={{ color: '#1e293b', fontWeight: '500' }}>
                          {renderBadgeText(m.text)}
                        </span>
                      </div>

                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {showEmojiPicker && (
              <div style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #cbd5e1', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px', maxHeight: '120px', overflowY: 'auto', flexShrink: 0 }}>
                {EMOJIS_LIST.map((emoji, idx) => (
                  <button key={idx} onClick={() => setInputText(prev => prev + emoji)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} style={{ flexShrink: 0, backgroundColor: '#f1f5f9', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid #cbd5e1', direction: 'rtl', boxSizing: 'border-box' }}>
              
              <button type="submit" style={{ background: '#0b141a', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '15px', flexShrink: 0 }}>
                ➤
              </button>

              <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid #cbd5e1', height: '38px' }}>
                <input 
                  type="text" 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="اكتب هنا..." 
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', textAlign: 'right', fontSize: '12px' }}
                />
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '0' }}>😊</button>
              </div>

              <button type="button" style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b', padding: '0 2px' }}>🎙</button>
              
              <button type="button" style={{ background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b', padding: '0 2px' }}>+</button>

            </form>

          </div>
        )}

      </div>

      {activePrivateChat && (
        <div style={{ position: 'fixed', top: '50%', bottom: '52px', left: 0, right: 0, backgroundColor: '#ffffff', zIndex: 130, display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 25px rgba(0,0,0,0.3)', borderTop: '2px solid #0b141a', overflow: 'hidden', direction: 'rtl' }}>
          
          <div style={{ backgroundColor: '#0b141a', color: '#ffffff', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{activePrivateChat.peerName}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', cursor: 'pointer' }}>⚙</span>
              <button onClick={() => setActivePrivateChat(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid #cbd5e1', height: '38px' }}>
              <input 
                type="text" 
                value={privateInputText} 
                onChange={(e) => setPrivateInputText(e.target.value)} 
                placeholder="اكتب هنا..." 
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', textAlign: 'right', fontSize: '12px' }}
              />
            </div>
            <button type="button" style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>📎</button>
            <button type="button" style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>🎙</button>
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

      <nav style={{ height: '52px', minHeight: '52px', flexShrink: 0, backgroundColor: '#0b141a', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #1e293b', direction: 'rtl', boxSizing: 'border-box', zIndex: 10 }}>
        
        <div onClick={() => { setShowSettingsModal(true); setSettingsTab('options'); }} style={{ color: '#94a3b8', cursor: 'pointer', textAlign: 'center', fontSize: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>⚙</span>
          <span>خيارات</span>
        </div>

        <div onClick={() => setShowFriendsModal(true)} style={{ color: showFriendsModal ? '#fff' : '#94a3b8', cursor: 'pointer', textAlign: 'center', fontSize: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>👥<sup>+</sup></span>
          <span>الأصدقاء</span>
        </div>

        <div onClick={() => setShowOnlineModal(true)} style={{ color: showOnlineModal ? '#fff' : '#94a3b8', cursor: 'pointer', textAlign: 'center', fontSize: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>👥</span>
          <span>المتصلين</span>
        </div>

        <div onClick={leaveRoomToLobby} style={{ color: currentView === 'rooms' ? '#fff' : '#94a3b8', cursor: 'pointer', textAlign: 'center', fontSize: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>🏠</span>
          <span>الغرف</span>
        </div>

        <div onClick={toggleRadio} style={{ color: isPlayingRadio ? '#22c55e' : '#94a3b8', cursor: 'pointer', textAlign: 'center', fontSize: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '18px' }}>{isPlayingRadio ? '⏸' : '🎛️'}</span>
          <span style={{ fontSize: '9px', fontWeight: 'bold' }}>Radio 9090</span>
        </div>

      </nav>

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
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>👤</div>
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
        <div style={{ position: 'fixed', top: '50px', left: 0, right: 0, bottom: '52px', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', justifyContent: 'flex-start', direction: 'rtl' }}>
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
                  <div key={friend.id} style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
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
        <div style={{ position: 'fixed', top: '50px', left: 0, right: 0, bottom: '52px', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', justifyContent: 'flex-start', direction: 'rtl' }}>
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

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {filteredOnlineUsers.map((u) => {
                const uStyleProps = getNameStyleProps(u.nameStyle || 'normal', u.nameColor || '#2563eb');
                return (
                  <div 
                    key={u.id} 
                    onClick={() => openUserProfile(u)}
                    style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: '#fff' }}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#475569', display: 'block', marginBottom: '4px' }}>الدولة / العلم</label>
                    <select 
                      value={profileCountry} 
                      onChange={(e) => {
                        setProfileCountry(e.target.value);
                        saveSettingToFirebase('country', e.target.value);
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      {COUNTRIES_LIST.map((c, i) => <option key={i} value={c}>{c}</option>)}
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
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
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

                  {/* 🌟 خيارات أصحاب الرتب حصراً: قائمة ألوان خلفية الملف الشخصي بالكامل + الحفظ الفوري */}
                  {hasRankForCustomization && (
                    <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #f0abfc', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#86198f' }}>✨ إعدادات أصحاب الرتب (حفظ فوري):</div>
                      
                      <div>
                        <label style={{ fontSize: '11px', color: '#701a75', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اختر لون خلفية الملف الشخصي بالكامل (حفظ فوري):</label>
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
                          <span style={{ fontSize: '10px', color: '#701a75' }}>أو اختر لوناً مخصصاً:</span>
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
                          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #f0abfc', fontSize: '12px' }}
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
                            🗑️ حذف
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
                    style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
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
        <div 
          onClick={() => { stopProfileSong(); setSelectedProfileUser(null); }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 120, display: 'flex', justifyContent: 'center', alignItems: 'center', direction: 'rtl', padding: '12px' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '100%', 
              maxWidth: '360px', 
              backgroundColor: selectedProfileUser.profileBgColor || '#ffffff', // 🔹 يتغير لون خلفية المربع بالكامل هنا فوراً
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

              {/* 🔹 الصورة والرتبة والاسم - في أسفل الغلاف مباشرة */}
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

                {/* 🔹 الرتبة تحت الصورة مباشرة */}
                <div style={{ backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', padding: '2px 10px', borderRadius: '12px', marginTop: '6px' }}>
                  {selectedProfileUser.role}
                </div>

                {/* 🔹 الاسم المزخرف تحت الرتبة */}
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', textAlign: 'center', width: '100%', ...getNameStyleProps(selectedProfileUser.nameStyle || 'normal', selectedProfileUser.nameColor || '#2563eb') }}>
                  {selectedProfileUser.name}
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
                    style={{ flex: 1, backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    محادثة خاصة ✉️
                  </button>
                  <button 
                    onClick={() => handleSendFriendRequest(selectedProfileUser.userId, selectedProfileUser.name)}
                    style={{ flex: 1, backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
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
