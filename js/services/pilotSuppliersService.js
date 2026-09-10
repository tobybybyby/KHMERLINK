// Hồ sơ supplier/khảo sát vận hành cho 7 listing pilot — CHỈ dùng nội bộ (Cổng vận hành/Studio),
// không hiển thị trên giao diện công khai của Trail. Nạp riêng khỏi state chính (không qua
// CONTENT_KEYS) vì chỉ vài trang admin/ops cần tới, tránh tải thêm cho mọi trang Trail.
const DATA_URL = './data/pilot-suppliers.json';

let cache = null;

export async function loadPilotSuppliers() {
  if (cache) return cache;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    cache = Array.isArray(raw.suppliers) ? raw.suppliers : [];
    return cache;
  } catch (err) {
    if (window.console && console.error) console.error('Không tải được data/pilot-suppliers.json:', err);
    return [];
  }
}

export const PilotSuppliersService = { loadPilotSuppliers };
