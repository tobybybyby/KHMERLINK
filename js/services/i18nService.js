// Hệ thống i18n trung tâm cho toàn bộ KhmerLink (Customer/Trail, Host/Studio, Management/Admin+Ops).
// Không phụ thuộc file nào khác trong project (zero-import) để mọi file khác (kể cả utils.js) có
// thể import ngược lại đây an toàn, không lo circular import. Toàn bộ chuỗi hiển thị nằm trong
// `translations` bên dưới — không dịch bằng cách tìm/thay text trực tiếp trong DOM.

const STORAGE_KEY = 'khmerlink.language';

const translations = {
  vi: {
    common: {
      brand: {
        trail: 'KhmerLink Trail',
        studio: 'KhmerLink Studio',
        managementGateway: 'Cổng quản lý',
        managementData: 'Cổng dữ liệu quản lý',
        ops: 'Cổng vận hành',
        community: 'Cố vấn cộng đồng',
      },
      nav: {
        explore: 'Khám phá',
        myTrips: 'Hành trình',
        passport: 'Hộ chiếu',
        profile: 'Cá nhân',
        notifications: 'Thông báo',
        overview: 'Tổng quan',
        experiences: 'Trải nghiệm',
        calendarBookings: 'Lịch & Booking',
        reports: 'Báo cáo',
        supportProposals: 'Hỗ trợ & Đề án',
        visitorFlow: 'Luồng khách',
        demandOpportunities: 'Nhu cầu & Cơ hội',
        proposals: 'Đề án',
        bookingsTransactions: 'Booking & Giao dịch',
        content: 'Nội dung',
        pilot: 'Pilot Khmer',
        tickets: 'Sự cố',
        quality: 'Chất lượng & Hỗ trợ hộ',
        backToGateway: '← Cổng quản lý',
        backToHome: '← Quay lại trang chào',
        homeLink: 'Về trang chào',
      },
      a11y: {
        languageSwitcher: 'Chọn ngôn ngữ',
        skipToContent: 'Bỏ qua tới nội dung chính',
        notifications: 'Thông báo',
        notificationsUnread: 'Thông báo — {count} chưa đọc',
        trailNav: 'Điều hướng Trail',
        studioNav: 'Điều hướng Studio',
        adminNav: 'Điều hướng Cổng dữ liệu quản lý',
        opsNav: 'Điều hướng Cổng vận hành',
        roleChoice: 'Chọn vai trò',
      },
      language: {
        vi: 'Tiếng Việt',
        en: 'English',
        changedTo: 'Đã chuyển sang {language}',
        close: 'Đóng',
      },
      status: {
        confirmed: 'Đã xác nhận',
        pending: 'Chờ xác nhận',
        completed: 'Đã hoàn thành',
        cancelled: 'Đã hủy',
        draft: 'Nháp',
        sent: 'Đã gửi',
        pendingReview: 'Đang chờ duyệt',
        approved: 'Đã duyệt',
        needsRevision: 'Cần bổ sung',
        rejected: 'Đã từ chối',
        published: 'Đã công bố',
        paused: 'Tạm dừng',
        paid: 'Đã thanh toán',
        unpaid: 'Chưa thanh toán',
        refunded: 'Đã hoàn tiền',
        partial: 'Thanh toán một phần',
        unknown: 'Không xác định',
      },
      price: {
        free: 'Miễn phí',
        updating: 'Đang cập nhật giá',
        perGuest: '{amount}/khách',
      },
      openStatus: {
        noHoursInfo: 'Chưa có thông tin giờ mở cửa',
        closedToday: 'Đóng cửa hôm nay',
        byAppointment: 'Cần đặt trước',
        closingSoon: 'Sắp đóng cửa ({time})',
        open: 'Đang mở',
        closed: 'Đóng cửa',
      },
      actions: {
        viewDetails: 'Xem chi tiết',
        addToTrip: 'Thêm vào hành trình',
        buildTrip: 'Tạo hành trình',
        bookTour: 'Đặt tour',
        approve: 'Duyệt',
        requestRevision: 'Yêu cầu chỉnh sửa',
        requestMore: 'Yêu cầu bổ sung',
        reject: 'Từ chối',
        cancel: 'Huỷ',
        confirm: 'Xác nhận',
        save: 'Lưu',
        close: 'Đóng',
        back: 'Quay lại',
        edit: 'Chỉnh sửa',
        delete: 'Xoá',
        submit: 'Gửi',
        loadMore: 'Xem thêm',
        showLess: 'Thu gọn',
        clearAllFilters: 'Xoá tất cả bộ lọc',
        retry: 'Thử lại',
      },
      category: {
        chuaKhmer: 'Chùa Khmer',
        baoTang: 'Bảo tàng',
        thuCong: 'Thủ công',
        amThuc: 'Ẩm thực',
        amNhacBieuDien: 'Âm nhạc và biểu diễn',
        diaDiemVanHoa: 'Địa điểm văn hóa',
        tonGiao: 'Tôn giáo',
        baoTangDiTich: 'Bảo tàng / Di tích',
        khuTuongNiem: 'Khu tưởng niệm',
        nhaCo: 'Nhà cổ',
        thienNhien: 'Thiên nhiên',
        langNgheCongDong: 'Làng nghề & cộng đồng',
        khuVuiChoi: 'Khu vui chơi',
        traiNghiemHoDan: 'Trải nghiệm tại hộ dân',
        leHoi: 'Lễ hội',
        khac: 'Khác',
      },
      crowd: {
        vang: 'Vắng',
        vua: 'Vừa',
        dong: 'Đông',
        ganHet: 'Gần hết sức chứa',
      },
      interest: {
        'tam-linh': 'Tâm linh',
        'anh-dep': 'Ảnh đẹp',
        'lich-su': 'Lịch sử',
        'thu-cong': 'Thủ công',
        'thien-nhien': 'Thiên nhiên',
        'gia-dinh': 'Phù hợp gia đình',
        'am-thuc-dia-phuong': 'Ẩm thực địa phương',
        'trai-nghiem-tay-chan': 'Trải nghiệm tay chân',
        'yen-tinh': 'Yên tĩnh',
        'van-hoa-khmer': 'Văn hoá Khmer',
      },
      listingType: {
        site: 'Điểm tham quan',
        cluster: 'Cụm điểm đến',
        experience: 'Trải nghiệm đề xuất',
        multiStopExperience: 'Trải nghiệm đề xuất — 2 điểm dừng',
      },
      cta: {
        interested: 'Quan tâm trải nghiệm',
        notify: 'Đăng ký nhận thông báo',
        preparing: 'Đang chuẩn bị pilot',
      },
      rating: {
        none: 'Chưa có đánh giá',
        countSuffix: '{count} đánh giá',
      },
      duration: {
        minutes: '{count} phút',
        hours: '{count} giờ',
        hoursMinutes: '{hours} giờ {minutes} phút',
      },
      weekday: {
        monday: 'Thứ 2', tuesday: 'Thứ 3', wednesday: 'Thứ 4', thursday: 'Thứ 5', friday: 'Thứ 6', saturday: 'Thứ 7', sunday: 'Chủ nhật',
      },
      weekdayShort: {
        monday: 'T2', tuesday: 'T3', wednesday: 'T4', thursday: 'T5', friday: 'T6', saturday: 'T7', sunday: 'CN',
      },
      home: {
        tagline: 'Chạm văn hóa, nối hành trình',
        heroText: 'Khám phá, kết nối và trải nghiệm cùng cộng đồng du lịch địa phương',
        travellerTitle: 'Tôi là du khách',
        travellerDesc: 'Khám phá địa điểm, tạo hành trình, đặt trải nghiệm',
        providerTitle: 'Tôi cung cấp trải nghiệm',
        providerDesc: 'Dành cho hộ dân, nghệ nhân, đơn vị du lịch',
      },
      gateway: {
        title: 'Cổng quản lý',
        subtitle: 'Dành cho cơ quan quản lý, đội vận hành và cố vấn cộng đồng.',
        dataTitle: '📊 Cổng dữ liệu quản lý',
        dataDesc: 'Tổng quan booking, luồng khách, nhu cầu, đề án, báo cáo',
        opsTitle: '🛠️ Cổng vận hành',
        opsDesc: 'Booking & giao dịch, nội dung, sự cố, chất lượng & hỗ trợ hộ',
        communityTitle: '🤝 Cố vấn cộng đồng',
        communityDesc: 'Hàng chờ duyệt văn hoá, xem xét ngoại lệ',
      },
      illustrativeImage: 'Ảnh minh hoạ',
      you: 'Bạn',
      bookingFlow: {
        slotNotFound: 'Không tìm thấy hoạt động hoặc khung giờ đã chọn.',
        notEnoughSlots: '"{title}" ({start}–{end}) chỉ còn {remaining} chỗ, không đủ cho {requested} khách.',
        createdTitle: 'Hành trình đã được ghi nhận',
        createdWithTime: 'Hành trình sẽ bắt đầu lúc {time}, ngày {date}. Mã booking {code}.',
        createdPending: 'Đã ghi nhận booking {code} — đang chờ hộ xác nhận.',
        bookingNotFound: 'Không tìm thấy booking.',
        noPendingItems: 'Booking không còn mục nào đang chờ xác nhận.',
        hostRejectedNote: 'Hộ từ chối (demo).',
        confirmedAllTitle: 'Booking đã được xác nhận',
        confirmedPartialTitle: 'Booking đã được xác nhận một phần',
        rejectedTitle: 'Hộ đã từ chối booking',
        confirmedAllMsg: 'Hộ đã xác nhận toàn bộ hoạt động trong booking {code}.',
        confirmedPartialMsg: 'Một phần hoạt động trong booking {code} đã được xác nhận — một số mục vẫn đang chờ hoặc đã bị từ chối, xem chi tiết trong Hành trình.',
        rejectedMsg: 'Rất tiếc, hộ đã từ chối toàn bộ hoạt động trong booking {code}. Bạn có thể xem hoạt động cộng đồng thay thế ở Khám phá.',
        bookingItemNotFound: 'Không tìm thấy mục booking.',
        onlyAcceptedCanComplete: 'Chỉ có thể xác nhận hoàn thành cho mục đã được chấp nhận.',
        hostCompletedNote: 'Hộ xác nhận hoàn thành (Studio).',
        payoutNotHolding: 'Khoản này chưa ở trạng thái đang giữ.',
        openTicketBlocksPayout: 'Có ticket hỗ trợ đang mở liên quan đến booking này — cần xử lý xong trước khi giải ngân.',
        payoutReleasedNote: 'Giải ngân mô phỏng (demo dùng nút thay vì chờ thời gian thật).',
        refundNoAcceptedItems: 'Chưa có hoạt động nào được xác nhận.',
        refundNotPaid: 'Chưa thanh toán, không phát sinh hoàn tiền.',
        refundFull: 'Huỷ trước 24 giờ: hoàn 100% (minh hoạ).',
        refundHalf: 'Huỷ trong 6–24 giờ: hoàn 50% (minh hoạ).',
        refundNone: 'Huỷ dưới 6 giờ trước giờ hẹn: không hoàn tiền (minh hoạ).',
        cannotCancelFinal: 'Booking đã ở trạng thái cuối, không thể huỷ.',
        holdExpiredReleased: 'Hết hạn giữ chỗ — chỗ đã được trả lại.',
        holdExpired: 'Hết hạn giữ chỗ.',
      },
      providerLabel: 'Đơn vị cung cấp',
      hostSwitcherA11y: 'Đơn vị cung cấp — chọn để xem demo',
      demoDataLabel: 'Dữ liệu mô phỏng',
      loading: 'Đang tải dữ liệu…',
      error: {
        title: 'Đã có lỗi xảy ra',
        genericMessage: 'Vui lòng thử lại.',
        backToHomeMessage: 'Vui lòng quay lại trang chào và thử lại.',
      },
    },
  },
  en: {
    common: {
      brand: {
        trail: 'KhmerLink Trail',
        studio: 'KhmerLink Studio',
        managementGateway: 'Management Portal',
        managementData: 'Management Data Portal',
        ops: 'Operations Portal',
        community: 'Community Advisor',
      },
      nav: {
        explore: 'Explore',
        myTrips: 'My Trips',
        passport: 'Passport',
        profile: 'Profile',
        notifications: 'Notifications',
        overview: 'Overview',
        experiences: 'Experiences',
        calendarBookings: 'Calendar & Bookings',
        reports: 'Reports',
        supportProposals: 'Support & Proposals',
        visitorFlow: 'Visitor Flow',
        demandOpportunities: 'Demand & Opportunities',
        proposals: 'Proposals',
        bookingsTransactions: 'Bookings & Transactions',
        content: 'Content',
        pilot: 'Khmer Pilot',
        tickets: 'Incidents',
        quality: 'Quality & Provider Support',
        backToGateway: '← Management Portal',
        backToHome: '← Back to Home',
        homeLink: 'Back to Home',
      },
      a11y: {
        languageSwitcher: 'Choose language',
        skipToContent: 'Skip to main content',
        notifications: 'Notifications',
        notificationsUnread: 'Notifications — {count} unread',
        trailNav: 'Trail navigation',
        studioNav: 'Studio navigation',
        adminNav: 'Management Data Portal navigation',
        opsNav: 'Operations Portal navigation',
        roleChoice: 'Choose your role',
      },
      language: {
        vi: 'Vietnamese',
        en: 'English',
        changedTo: 'Language changed to {language}',
        close: 'Close',
      },
      status: {
        confirmed: 'Confirmed',
        pending: 'Pending',
        completed: 'Completed',
        cancelled: 'Cancelled',
        draft: 'Draft',
        sent: 'Sent',
        pendingReview: 'Pending Review',
        approved: 'Approved',
        needsRevision: 'Needs Revision',
        rejected: 'Rejected',
        published: 'Published',
        paused: 'Paused',
        paid: 'Paid',
        unpaid: 'Unpaid',
        refunded: 'Refunded',
        partial: 'Partially Paid',
        unknown: 'Unknown',
      },
      price: {
        free: 'Free',
        updating: 'Price Updating',
        perGuest: '{amount}/guest',
      },
      openStatus: {
        noHoursInfo: 'No opening-hours information yet',
        closedToday: 'Closed today',
        byAppointment: 'By appointment',
        closingSoon: 'Closing soon ({time})',
        open: 'Open',
        closed: 'Closed',
      },
      actions: {
        viewDetails: 'View Details',
        addToTrip: 'Add to Trip',
        buildTrip: 'Build My Trip',
        bookTour: 'Book Tour',
        approve: 'Approve',
        requestRevision: 'Request Revision',
        requestMore: 'Request Revision',
        reject: 'Reject',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        close: 'Close',
        back: 'Back',
        edit: 'Edit',
        delete: 'Delete',
        submit: 'Submit',
        loadMore: 'Show more',
        showLess: 'Show less',
        clearAllFilters: 'Clear all filters',
        retry: 'Retry',
      },
      category: {
        chuaKhmer: 'Khmer Pagoda',
        baoTang: 'Museum',
        thuCong: 'Handicraft',
        amThuc: 'Cuisine',
        amNhacBieuDien: 'Music & Performance',
        diaDiemVanHoa: 'Cultural Site',
        tonGiao: 'Religious Site',
        baoTangDiTich: 'Museum / Heritage Site',
        khuTuongNiem: 'Memorial Site',
        nhaCo: 'Old House',
        thienNhien: 'Nature',
        langNgheCongDong: 'Craft Village & Community',
        khuVuiChoi: 'Recreation Area',
        traiNghiemHoDan: 'Homestay Experience',
        leHoi: 'Festival',
        khac: 'Other',
      },
      crowd: {
        vang: 'Quiet',
        vua: 'Moderate',
        dong: 'Busy',
        ganHet: 'Near Full Capacity',
      },
      interest: {
        'tam-linh': 'Spirituality',
        'anh-dep': 'Great photos',
        'lich-su': 'History',
        'thu-cong': 'Handicraft',
        'thien-nhien': 'Nature',
        'gia-dinh': 'Family friendly',
        'am-thuc-dia-phuong': 'Local food',
        'trai-nghiem-tay-chan': 'Hands-on experience',
        'yen-tinh': 'Quiet',
        'van-hoa-khmer': 'Khmer culture',
      },
      listingType: {
        site: 'Attraction',
        cluster: 'Destination Cluster',
        experience: 'Suggested Experience',
        multiStopExperience: 'Suggested Experience — 2 Stops',
      },
      cta: {
        interested: "I'm Interested",
        notify: 'Notify Me',
        preparing: 'Pilot in Preparation',
      },
      rating: {
        none: 'No reviews yet',
        countSuffix: '{count} reviews',
      },
      duration: {
        minutes: '{count} min',
        hours: '{count}h',
        hoursMinutes: '{hours}h {minutes}m',
      },
      weekday: {
        monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
      },
      weekdayShort: {
        monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
      },
      home: {
        tagline: 'Touch culture, connect journeys',
        heroText: 'Discover, connect and experience local community tourism',
        travellerTitle: "I'm a Traveller",
        travellerDesc: 'Discover places, build trips, book experiences',
        providerTitle: 'I Offer Experiences',
        providerDesc: 'For households, artisans and tourism providers',
      },
      gateway: {
        title: 'Management Portal',
        subtitle: 'For management agencies, operations teams and community advisors.',
        dataTitle: '📊 Management Data Portal',
        dataDesc: 'Booking overview, visitor flow, demand, proposals, reports',
        opsTitle: '🛠️ Operations Portal',
        opsDesc: 'Bookings & transactions, content, incidents, quality & provider support',
        communityTitle: '🤝 Community Advisor',
        communityDesc: 'Cultural review queue, exception review',
      },
      illustrativeImage: 'Illustrative image',
      you: 'You',
      bookingFlow: {
        slotNotFound: 'The selected activity or time slot could not be found.',
        notEnoughSlots: '"{title}" ({start}–{end}) only has {remaining} spots left, not enough for {requested} guests.',
        createdTitle: 'Trip recorded',
        createdWithTime: 'The trip will start at {time} on {date}. Booking code {code}.',
        createdPending: 'Booking {code} has been recorded — awaiting provider confirmation.',
        bookingNotFound: 'Booking not found.',
        noPendingItems: 'This booking has no items left awaiting confirmation.',
        hostRejectedNote: 'Declined by the provider (demo).',
        confirmedAllTitle: 'Booking confirmed',
        confirmedPartialTitle: 'Booking partially confirmed',
        rejectedTitle: 'Provider declined the booking',
        confirmedAllMsg: 'The provider has confirmed every activity in booking {code}.',
        confirmedPartialMsg: 'Part of booking {code} has been confirmed — some items are still pending or were declined, see details in My Trips.',
        rejectedMsg: 'Unfortunately, the provider declined every activity in booking {code}. You can browse alternative community activities in Explore.',
        bookingItemNotFound: 'Booking item not found.',
        onlyAcceptedCanComplete: 'Only accepted items can be marked as completed.',
        hostCompletedNote: 'Marked completed by the provider (Studio).',
        payoutNotHolding: 'This amount is not currently on hold.',
        openTicketBlocksPayout: 'There is an open support ticket linked to this booking — resolve it before releasing payout.',
        payoutReleasedNote: 'Simulated payout release (demo uses a button instead of waiting for real time).',
        refundNoAcceptedItems: 'No activity has been confirmed yet.',
        refundNotPaid: 'Not paid yet, no refund applies.',
        refundFull: 'Cancelled 24+ hours ahead: 100% refund (illustrative).',
        refundHalf: 'Cancelled 6–24 hours ahead: 50% refund (illustrative).',
        refundNone: 'Cancelled under 6 hours before the scheduled time: no refund (illustrative).',
        cannotCancelFinal: 'This booking is already in a final state and cannot be cancelled.',
        holdExpiredReleased: 'Hold expired — the spot has been released.',
        holdExpired: 'Hold expired.',
      },
      providerLabel: 'Provider',
      hostSwitcherA11y: 'Provider — select to preview demo',
      demoDataLabel: 'Simulated Data',
      loading: 'Loading data…',
      error: {
        title: 'Something went wrong',
        genericMessage: 'Please try again.',
        backToHomeMessage: 'Please go back to the home page and try again.',
      },
    },
  },
};

/** Gộp thêm 1 namespace (vd customer/host/management) vào dict trung tâm — gọi từ mỗi module UI
 * lúc load (top-level, chỉ 1 lần) để không phải nhồi toàn bộ chuỗi của cả app vào 1 file duy nhất. */
export function registerTranslations(namespace, viEntries, enEntries) {
  translations.vi[namespace] = { ...(translations.vi[namespace] || {}), ...viEntries };
  translations.en[namespace] = { ...(translations.en[namespace] || {}), ...enEntries };
}

function readStoredLanguage() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'en' || v === 'vi' ? v : null;
  } catch {
    return null;
  }
}

let currentLanguage = readStoredLanguage() || 'vi';
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLanguage === 'vi' ? 'vi' : 'en';
  document.addEventListener('DOMContentLoaded', () => {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.textContent = t('common.a11y.skipToContent');
  });
}

export function getCurrentLanguage() {
  return currentLanguage;
}

function announce(message) {
  if (typeof document === 'undefined') return;
  let el = document.getElementById('lang-announcer');
  if (!el) {
    el = document.createElement('div');
    el.id = 'lang-announcer';
    el.setAttribute('aria-live', 'polite');
    el.className = 'visually-hidden';
    document.body.appendChild(el);
  }
  el.textContent = message;
}

function applyLanguage(lang, { announceChange = true } = {}) {
  currentLanguage = lang;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang === 'vi' ? 'vi' : 'en';
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.textContent = t('common.a11y.skipToContent');
  }
  if (announceChange) {
    const label = t('common.language.' + lang);
    announce(t('common.language.changedTo', { language: label }));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('khmerlink:language-changed', { detail: { language: lang } }));
  }
}

/** Đổi ngôn ngữ hiện tại + lưu localStorage + báo các tab khác (qua sự kiện `storage` gốc của
 * trình duyệt) + phát `khmerlink:language-changed` cùng-tab để app.js render lại route hiện tại
 * (không reload trang, không mất Trip Cart/hành trình/filter — xem app.js#scheduleRerender). */
export function setLanguage(lang) {
  if (lang !== 'vi' && lang !== 'en') return;
  if (lang === currentLanguage) return;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* localStorage không khả dụng (chế độ riêng tư nghiêm ngặt) — vẫn đổi ngôn ngữ trong bộ nhớ. */
  }
  applyLanguage(lang);
}

// Đồng bộ giữa các tab: tab khác đổi ngôn ngữ → ghi localStorage → trình duyệt tự bắn sự kiện
// `storage` (gốc, không phải custom) ở MỌI tab khác (không bắn ở tab vừa ghi) — bắt sự kiện này để
// cập nhật biến currentLanguage trong bộ nhớ của tab hiện tại rồi phát lại `khmerlink:language-changed`
// nội bộ để app.js render lại, giống hệt luồng cùng-tab.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    const next = e.newValue === 'en' ? 'en' : e.newValue === 'vi' ? 'vi' : null;
    if (!next || next === currentLanguage) return;
    applyLanguage(next, { announceChange: false });
  });
}

function resolvePath(dict, key) {
  return key.split('.').reduce((acc, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), dict);
}

function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined && params[k] !== null ? params[k] : m));
}

/** Lấy chuỗi dịch theo key dạng "namespace.sub.key". Thiếu bản dịch tiếng Anh → fallback tiếng
 * Việt (không hiển thị key, không hiển thị undefined) + ghi console.warn để dễ audit. */
export function t(key, params) {
  let value = resolvePath(translations[currentLanguage], key);
  if (value === undefined) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[i18n] Thiếu bản dịch "${key}" cho ngôn ngữ "${currentLanguage}"`);
    }
    value = resolvePath(translations.vi, key);
  }
  if (value === undefined) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[i18n] Thiếu key "${key}" trong cả bản tiếng Việt`);
    }
    return '';
  }
  if (typeof value !== 'string') return value;
  return interpolate(value, params);
}

function localeTag() {
  return currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
}

/** Vẫn dùng VND cho cả 2 ngôn ngữ — chỉ đổi CÁCH hiển thị, không đổi giá trị. 0đ hiện "Miễn
 * phí"/"Free" (dùng cho GIÁ hoạt động — muốn hiện "0 đ"/"VND 0" thật cho số tiền tài chính thì
 * dùng formatMoney() ở utils.js). */
export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  if (value === 0) return t('common.price.free');
  return formatMoney(value);
}

/** Số tiền tài chính (doanh thu/giải ngân/thanh toán) — 0 hiện đúng số 0, không đổi thành "Miễn phí". */
export function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  if (currentLanguage === 'vi') {
    return `${new Intl.NumberFormat('vi-VN').format(n)}đ`;
  }
  return `VND ${new Intl.NumberFormat('en-US').format(n)}`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat(localeTag()).format(value);
}

/** VI: 17/09/2026 — EN: Sep 17, 2026. */
export function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  if (currentLanguage === 'vi') {
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Giờ giữ định dạng 24h ở cả 2 ngôn ngữ (đúng format hiện có của platform). */
export function formatTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${formatDate(d)} ${formatTime(d)}`;
}

/** Đọc field song ngữ dạng { vi: "...", en: "..." }. Không phải object song ngữ (vd chuỗi thường,
 * hoặc nội dung do người dùng nhập — review/ghi chú thật) → trả nguyên văn, KHÔNG tự dịch máy. */
export function localize(field, fallback) {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    return field[currentLanguage] ?? field.vi ?? field.en ?? fallback ?? '';
  }
  if (Array.isArray(field)) return field;
  return field ?? fallback ?? '';
}

/** Mảng tag song ngữ { vi: [...], en: [...] }. */
export function localizeList(field, fallback = []) {
  if (field && typeof field === 'object' && !Array.isArray(field)) {
    return field[currentLanguage] ?? field.vi ?? field.en ?? fallback;
  }
  if (Array.isArray(field)) return field;
  return fallback;
}

// ---- Language switcher UI (dùng chung Home Page + shared header của cả 4 cổng) ----
// Nút tròn tối giản, chỉ hiện mã ngôn ngữ HIỆN TẠI (VI/EN) — bấm là đổi sang ngôn ngữ còn lại
// (toggle 1 nút, không phải segmented control 2 nút như bản trước). Nhãn tooltip/aria-label mô tả
// hành động SẮP diễn ra, luôn viết bằng chính ngôn ngữ sẽ chuyển tới (quy ước UX chuẩn cho language
// switcher — không đi qua t()/translations vì đây không phải nội dung theo ngôn ngữ hiện tại).
function nextLanguageActionLabel() {
  return currentLanguage === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt';
}

export function languageSwitcherHtml(extraClass = '') {
  const label = currentLanguage === 'vi' ? 'VI' : 'EN';
  const actionLabel = nextLanguageActionLabel();
  return `
    <button type="button" class="language-toggle ${extraClass}" data-lang-toggle
      aria-label="${actionLabel}" data-tooltip="${actionLabel}">
      <span aria-hidden="true">${label}</span>
    </button>
  `;
}

export function wireLanguageSwitchers(root = document) {
  root.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(currentLanguage === 'vi' ? 'en' : 'vi'));
  });
}
